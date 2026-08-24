import { TherapistDocument, TherapistClaimRequest } from "../models/ClaimProfile/index.js";
import { uploadToStorage, getSignedUrl } from "../config/firebase.js";
import { errorHandler } from "../utils/error.js";
import { audit } from "./claimProfile.controller.js";
import { fileTypeFromBuffer } from "file-type";

const MAX_DOCS_PER_CLAIM = 30;

// ─── POST /server/claim/:id/documents ────────────────────────────────────────

export const uploadDocument = async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const userId = req.user.id || req.user._id;
    const claim = req.claim; // provided by requireClaimOwnership guard
    const file = req.file;   // provided by multerUpload
    const { docType, itemIndex } = req.body;
    const itemIdxVal = Number(itemIndex) || 0;

    if (!docType) {
      return next(errorHandler(400, "docType is required in the request body."));
    }

    if (!file || !file.buffer) {
      return next(errorHandler(400, "No file uploaded."));
    }

    // Magic-bytes validation
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType || !["image/jpeg", "image/png", "application/pdf"].includes(fileType.mime)) {
      return next(errorHandler(400, "Invalid file format detected. Only JPG, PNG, and PDF are allowed."));
    }

    // Check rate limit dynamically across active docs for this claim
    const activeDocCount = await TherapistDocument.countDocuments({
      claimId,
      isActive: true,
    });

    if (activeDocCount >= MAX_DOCS_PER_CLAIM) {
      return res.status(429).json({
        success: false,
        message: `Maximum of ${MAX_DOCS_PER_CLAIM} documents allowed per claim.`,
        code: "DOC_LIMIT_REACHED",
      });
    }

    // Step 1: Deduplication (Soft delete any existing document of the same type and index)
    await TherapistDocument.updateMany(
      { claimId, userId, docType, itemIndex: itemIdxVal, isActive: true },
      { $set: { isActive: false } }
    );

    // Step 2: Upload to Firebase Storage using Admin SDK
    const timestamp = Date.now();
    // Sanitize filename to avoid weird characters in storage path
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const destination = `claims/${userId}/${claimId}/${docType}/${timestamp}_${sanitizedName}`;

    const fileRef = await uploadToStorage({
      buffer: file.buffer,
      destination,
      mimeType: file.mimetype, // this was verified by validateMimeType
    });

    // Step 3: Save to MongoDB
    const newDoc = await TherapistDocument.create({
      userId,
      claimId,
      docType,
      itemIndex: itemIdxVal,
      fileRef,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      isActive: true,
      docStatus: "pending",
    });

    // Step 4: Audit Log
    await audit({
      claimId,
      userId,
      performedBy: userId,
      action: "document_uploaded",
      req,
      metadata: { docId: newDoc._id, docType, fileSizeBytes: file.size },
    });

    res.status(201).json({
      success: true,
      document: {
        docId: newDoc._id,
        docType: newDoc.docType,
        itemIndex: newDoc.itemIndex,
        fileName: newDoc.fileName,
        fileSizeBytes: newDoc.fileSizeBytes,
        uploadedAt: newDoc.uploadedAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ─── GET /server/claim/:id/documents ──────────────────────────────────────────

export const getMyDocuments = async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const userId = req.user.id || req.user._id;

    // Only return metadata, do NOT return signed URLs here.
    // URLs expire and are requested on demand.
    const documents = await TherapistDocument.find({
      claimId,
      userId,
      isActive: true,
    })
      .select("-fileRef") // Hide storage path from frontend
      .lean();

    res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// ─── GET /server/claim/:id/documents/:docId/url ─────────────────────────────

export const getDocumentUrl = async (req, res, next) => {
  try {
    const { id: claimId, docId } = req.params;
    const userId = req.user.id || req.user._id;

    // Verify ownership and existence
    const doc = await TherapistDocument.findOne({
      _id: docId,
      claimId,
      userId,
      isActive: true,
    }).lean();

    if (!doc) {
      return next(errorHandler(404, "Document not found or access denied."));
    }

    // Generate 15-minute signed URL
    const url = await getSignedUrl(doc.fileRef, 15 * 60 * 1000);

    // Audit that the user viewed their document (optional, but good for compliance)
    await audit({
      claimId,
      userId,
      performedBy: userId,
      action: "document_viewed_by_user",
      req,
      metadata: { docId },
    });

    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /server/claim/:id/documents/:docId ────────────────────────────────

export const deleteDocument = async (req, res, next) => {
  try {
    const { id: claimId, docId } = req.params;
    const userId = req.user.id || req.user._id;

    // We do NOT delete from Firebase — we just soft delete to preserve audit trails.
    const doc = await TherapistDocument.findOneAndUpdate(
      { _id: docId, claimId, userId, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!doc) {
      return next(errorHandler(404, "Document not found or already deleted."));
    }

    await audit({
      claimId,
      userId,
      performedBy: userId,
      action: "document_deleted",
      req,
      metadata: { docId, docType: doc.docType },
    });

    res.status(200).json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── GET /server/claim/admin/:id/documents ────────────────────────────────────

export const getAdminDocuments = async (req, res, next) => {
  try {
    const claimId = req.params.id;

    const documents = await TherapistDocument.find({
      claimId,
      isActive: true,
    }).lean();

    // Map through and attach signed URLs for the admin to view
    // (Admin gets a 1 hour TTL on these links)
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const url = await getSignedUrl(doc.fileRef, 60 * 60 * 1000);
        const { fileRef, ...safeDoc } = doc;
        return { ...safeDoc, downloadUrl: url };
      })
    );

    if (documents.length > 0) {
      await audit({
        claimId,
        userId: documents[0].userId, // Admin is viewing this user's claim
        performedBy: req.user.id || req.user._id, // The Admin
        action: "document_viewed_by_admin",
        req,
      });
    }

    res.status(200).json({ success: true, documents: docsWithUrls });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/admin/:id/documents/:docId/review ────────────────────

export const reviewDocument = async (req, res, next) => {
  try {
    const { id: claimId, docId } = req.params;
    const { docStatus, docRejectionReason } = req.body;
    const adminId = req.user.id || req.user._id;

    if (!["accepted", "rejected"].includes(docStatus)) {
      return next(errorHandler(400, "Invalid docStatus. Must be 'accepted' or 'rejected'."));
    }

    if (docStatus === "rejected" && !docRejectionReason) {
      return next(errorHandler(400, "Rejection reason is required when rejecting a document."));
    }

    const doc = await TherapistDocument.findOneAndUpdate(
      { _id: docId, claimId, isActive: true },
      { 
        $set: { 
          docStatus,
          docRejectionReason: docStatus === "rejected" ? docRejectionReason : null,
          reviewedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!doc) {
      return next(errorHandler(404, "Document not found."));
    }

    await audit({
      claimId,
      userId: doc.userId,
      performedBy: adminId,
      action: `document_${docStatus}`,
      req,
      metadata: { docId, docType: doc.docType, reason: docRejectionReason },
    });

    res.status(200).json({ success: true, document: doc });
  } catch (error) {
    next(error);
  }
};
