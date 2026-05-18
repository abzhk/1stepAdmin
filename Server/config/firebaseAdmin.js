import admin from "firebase-admin";

let initialized = false;

const init = () => {
  if (initialized || admin.apps.length > 0) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
};


export const getSignedUrl = async (fileRef) => {
  init();

  const bucket = admin.storage().bucket();

  const [url] = await bucket.file(fileRef).getSignedUrl({
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 mins
  });

  return url;
};