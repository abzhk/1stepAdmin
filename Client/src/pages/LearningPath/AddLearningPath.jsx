import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { storage } from "../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const AddLearningPath = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATES
  // =====================================================

  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    categoryId: "",
    testId: "",
    assessmentId: "",
    title: "",
    image: "",
    steps: [
      {
        title: "",
        desc: "",
        practices: [""],
      },
    ],
  });

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCategories();

    if (id) {
      fetchLearningPath();
    }
  }, [id]);

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError("");

      const res = await api(
        "/api/assessment/category/getall"
      );

      console.log("Categories response:", res);

      setCategories(res.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      setError("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // =====================================================
  // FETCH EXISTING LEARNING PATH
  // =====================================================

  const fetchLearningPath = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await api(
      `/api/learning-path/edit/${id}`
    );

    console.log("Learning path response:", res);

    const data = res.data || res;

    const assessmentId =
      data.assessmentId?._id ||
      data.assessmentId ||
      "";

    setFormData({
      categoryId: "",
      testId: "",
      assessmentId,
      title: data.title || "",
      image: data.image || "",
      steps:
        data.steps?.length > 0
          ? data.steps
          : [
              {
                title: "",
                desc: "",
                practices: [""],
              },
            ],
    });

  } catch (error) {
    console.error(
      "Failed to fetch learning path:",
      error
    );

    setError("Failed to load learning path.");
  } finally {
    setLoading(false);
  }
};
  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      categoryId,
      testId: "",
      assessmentId: "",
    }));

    setTests([]);
    setAssessment(null);

    if (!categoryId) {
      return;
    }

    await fetchTests(categoryId);
  };

  // =====================================================
  // FETCH TESTS
  // =====================================================

  const fetchTests = async (categoryId) => {
    try {
      setLoadingTests(true);
      setError("");

      const res = await api(
         `/api/assessment/category/${categoryId}`
      );

      console.log("Tests response:", res);

      setTests(res.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch tests:",
        error
      );

      setTests([]);
      setError("Failed to load tests.");
    } finally {
      setLoadingTests(false);
    }
  };

  // =====================================================
  // TEST CHANGE
  // =====================================================

  const handleTestChange = async (e) => {
    const testId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      testId,
      assessmentId: "",
    }));

    setAssessment(null);

    if (!testId) {
      return;
    }

    await fetchAssessment(testId);
  };

  // =====================================================
  // FETCH ASSESSMENT
  // =====================================================

  const fetchAssessment = async (testId) => {
    try {
      setLoadingAssessment(true);
      setError("");

      const res = await api(
  `/api/assessmentquestions/test/${testId}`
);

      console.log(
        "Assessment for test:",
        res
      );

      const assessmentData = res.data || res;

      if (!assessmentData?._id) {
        setAssessment(null);

        setError(
          "No assessment found for this test."
        );

        return;
      }

      setAssessment(assessmentData);

      setFormData((prev) => ({
        ...prev,
        testId,
        assessmentId: assessmentData._id,
      }));
    } catch (error) {
      console.error(
        "Failed to fetch assessment:",
        error
      );

      setAssessment(null);

      setError(
        "No assessment is available for this test."
      );
    } finally {
      setLoadingAssessment(false);
    }
  };

  // =====================================================
  // GENERAL FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  // const handleImageChange = async (e) => {
  //   const file = e.target.files?.[0];

  //   if (!file) return;

  //   // ---------------------------------------------
  //   // Validate image
  //   // ---------------------------------------------

  //   if (!file.type.startsWith("image/")) {
  //     setError("Please select a valid image file.");
  //     return;
  //   }

  //   // 5 MB limit
  //   if (file.size > 5 * 1024 * 1024) {
  //     setError("Image size must be less than 5 MB.");
  //     return;
  //   }

  //   try {
  //     setUploadingImage(true);
  //     setError("");
  //     setSuccess("");

  //     // ---------------------------------------------
  //     // Create unique Firebase Storage path
  //     // ---------------------------------------------

  //     const fileExtension =
  //       file.name.split(".").pop();

  //     const fileName = `learning-path-${Date.now()}.${fileExtension}`;

  //     const storageRef = ref(
  //       storage,
  //       `learning-paths/${fileName}`
  //     );

  //     // ---------------------------------------------
  //     // Upload to Firebase Storage
  //     // ---------------------------------------------

  //     await uploadBytes(storageRef, file);

  //     // ---------------------------------------------
  //     // Get permanent Firebase download URL
  //     // ---------------------------------------------

  //     const downloadURL =
  //       await getDownloadURL(storageRef);

  //     console.log(
  //       "Firebase image URL:",
  //       downloadURL
  //     );

  //     // ---------------------------------------------
  //     // Save URL in form state
  //     // ---------------------------------------------

  //     setFormData((prev) => ({
  //       ...prev,
  //       image: downloadURL,
  //     }));

  //     setSuccess(
  //       "Cover image uploaded successfully."
  //     );
  //   } catch (error) {
  //     console.error(
  //       "Image upload failed:",
  //       error
  //     );

  //     setError(
  //       "Failed to upload image. Please try again."
  //     );
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };

  // =====================================================
  // STEP CHANGE
  // =====================================================

  const handleStepChange = (
    stepIndex,
    field,
    value
  ) => {
    setFormData((prev) => {
      const steps = [...prev.steps];

      steps[stepIndex] = {
        ...steps[stepIndex],
        [field]: value,
      };

      return {
        ...prev,
        steps,
      };
    });
  };

  // =====================================================
  // PRACTICE CHANGE
  // =====================================================

  const handlePracticeChange = (
    stepIndex,
    practiceIndex,
    value
  ) => {
    setFormData((prev) => {
      const steps = [...prev.steps];

      const practices = [
        ...(steps[stepIndex].practices || []),
      ];

      practices[practiceIndex] = value;

      steps[stepIndex] = {
        ...steps[stepIndex],
        practices,
      };

      return {
        ...prev,
        steps,
      };
    });
  };

  // =====================================================
  // ADD STEP
  // =====================================================

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          title: "",
          desc: "",
          practices: [""],
        },
      ],
    }));
  };

  // =====================================================
  // REMOVE STEP
  // =====================================================

  const removeStep = (stepIndex) => {
    setFormData((prev) => {
      const steps = prev.steps.filter(
        (_, index) => index !== stepIndex
      );

      return {
        ...prev,
        steps:
          steps.length > 0
            ? steps
            : [
                {
                  title: "",
                  desc: "",
                  practices: [""],
                },
              ],
      };
    });
  };

  // =====================================================
  // ADD PRACTICE
  // =====================================================

  const addPractice = (stepIndex) => {
    setFormData((prev) => {
      const steps = [...prev.steps];

      steps[stepIndex] = {
        ...steps[stepIndex],
        practices: [
          ...(steps[stepIndex].practices || []),
          "",
        ],
      };

      return {
        ...prev,
        steps,
      };
    });
  };

  // =====================================================
  // REMOVE PRACTICE
  // =====================================================

  const removePractice = (
    stepIndex,
    practiceIndex
  ) => {
    setFormData((prev) => {
      const steps = [...prev.steps];

      let practices = [
        ...(steps[stepIndex].practices || []),
      ];

      practices = practices.filter(
        (_, index) => index !== practiceIndex
      );

      if (practices.length === 0) {
        practices = [""];
      }

      steps[stepIndex] = {
        ...steps[stepIndex],
        practices,
      };

      return {
        ...prev,
        steps,
      };
    });
  };

  // =========================
  // IMAGE CHANGE
  // =========================

  const handleImageChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const fileName = `${Date.now()}_${file.name}`;

  const storageRef = ref(
    storage,
    `learningPaths/${fileName}`
  );

  const uploadTask = uploadBytesResumable(
    storageRef,
    file
  );

  uploadTask.on(
    "state_changed",

    (snapshot) => {
      const progress =
        Math.round(
          (snapshot.bytesTransferred /
            snapshot.totalBytes) *
            100
        );

      console.log("Upload progress:", progress);
    },

    (error) => {
      console.error(
        "Learning path image upload failed:",
        error
      );
    },

    async () => {
      try {
        const downloadURL =
          await getDownloadURL(
            uploadTask.snapshot.ref
          );

        console.log(
          "Firebase image URL:",
          downloadURL
        );

        setFormData((prev) => ({
          ...prev,
          image: downloadURL,
        }));

      } catch (error) {
        console.error(
          "Failed to get image URL:",
          error
        );
      }
    }
  );
};

  // =========================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------
    // Validation
    // ---------------------------------------------

    if (!formData.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!formData.testId) {
      setError("Please select a test.");
      return;
    }

    if (!formData.assessmentId) {
      setError(
        "No assessment is linked to the selected test."
      );
      return;
    }

    if (!formData.title.trim()) {
      setError(
        "Please enter a learning path title."
      );
      return;
    }

    if (!formData.image) {
      setError(
        "Please upload a cover image."
      );
      return;
    }

    const validSteps = formData.steps.filter(
      (step) =>
        step.title?.trim() ||
        step.desc?.trim() ||
        step.practices?.some(
          (practice) => practice?.trim()
        )
    );

    if (validSteps.length === 0) {
      setError(
        "Please add at least one step."
      );
      return;
    }

    // ---------------------------------------------
    // Save
    // ---------------------------------------------

    try {
      setLoading(true);

      const payload = {
        categoryId: formData.categoryId,
        testId: formData.testId,
        assessmentId: formData.assessmentId,
        title: formData.title.trim(),

        // IMPORTANT:
        // This is now the Firebase download URL,
        // NOT a blob URL.
        image: formData.image,

        steps: validSteps,
      };

      console.log(
        "Learning path payload:",
        payload
      );

      let res;

      if (id) {
        res = await api(
          `/api/learning-path/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await api(
          "/api/learning-path/add",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      console.log(
        "Learning path response:",
        res
      );

      setSuccess(
        id
          ? "Learning path updated successfully."
          : "Learning path created successfully."
      );

      setTimeout(() => {
        navigate("/learning-path");
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to save learning path:",
        error
      );

      setError(
        error?.message ||
          "Failed to save learning path."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F8F3EE] px-4 sm:px-6 py-8 md:py-10">

      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#B27676]">
                Learning Path
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#26382F] mt-1">
                {id
                  ? "Edit Learning Path"
                  : "Create Learning Path"}
              </h1>

              <p className="mt-2 text-[#756A65]">
                Connect a category, test and assessment
                to create a personalized learning path.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/learning-path")
              }
              className="px-5 py-3 rounded-xl border border-[#DCCFC8] bg-white text-[#26382F] font-semibold hover:bg-[#F8F3EE] transition"
            >
              Back
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 bg-[#FCE8E6] border border-[#E8C8C2] text-[#9B5555] px-5 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-6 bg-[#E7F2EA] border border-[#C8DDCD] text-[#3E6548] px-5 py-4 rounded-2xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              ASSESSMENT CONNECTION
          ================================================= */}

          <div className="bg-white rounded-[28px] border border-[#E9DED8] shadow-sm p-6 md:p-8 mb-7">

            <div className="mb-6">

              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F3DDD8] text-[#9B6666] text-xs font-semibold">
                Assessment Connection
              </span>

              <h2 className="text-2xl font-bold text-[#26382F] mt-3">
                Select Assessment
              </h2>

              <p className="text-[#756A65] mt-1">
                Select the category and test. The linked
                assessment will be selected automatically.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CATEGORY */}

              <div className="space-y-2">

                <label className="block text-sm font-bold text-[#26382F]">
                  Category
                </label>

                <select
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  disabled={loadingCategories}
                  className="w-full px-5 py-3.5 bg-[#F5F5F0] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition text-[#26382F] font-medium disabled:opacity-50"
                >

                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* TEST */}

              <div className="space-y-2">

                <label className="block text-sm font-bold text-[#26382F]">
                  Test
                </label>

                <select
                  value={formData.testId}
                  onChange={handleTestChange}
                  disabled={
                    !formData.categoryId ||
                    loadingTests
                  }
                  className="w-full px-5 py-3.5 bg-[#F5F5F0] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition text-[#26382F] font-medium disabled:opacity-50"
                >

                  <option value="">
                    {!formData.categoryId
                      ? "Select Category First"
                      : loadingTests
                      ? "Loading tests..."
                      : "Select Test"}
                  </option>

                  {tests.map((test) => (
                    <option
                      key={test._id}
                      value={test._id}
                    >
                      {test.name}
                      {test.code
                        ? ` (${test.code})`
                        : ""}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* LINKED ASSESSMENT */}

            {loadingAssessment && (
              <div className="mt-6 bg-[#F8F3EE] rounded-2xl p-5">
                <p className="text-sm text-[#756A65]">
                  Loading linked assessment...
                </p>
              </div>
            )}

            {assessment && !loadingAssessment && (
              <div className="mt-6 bg-[#F3DDD8] border border-[#E8C8C2] rounded-2xl p-5">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center text-xl">
                    📝
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-bold uppercase tracking-wider text-[#9B6666]">
                      Linked Assessment
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#26382F]">
                      {assessment.title}
                    </h3>

                    {assessment.description && (
                      <p className="mt-1 text-sm text-[#756A65]">
                        {assessment.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-3">

                      {assessment.version && (
                        <span className="text-xs px-3 py-1 rounded-full bg-white text-[#756A65]">
                          Version {assessment.version}
                        </span>
                      )}

                      {assessment.status && (
                        <span className="text-xs px-3 py-1 rounded-full bg-white text-[#756A65] capitalize">
                          {assessment.status}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              PATH DETAILS
          ================================================= */}

          <div className="bg-white rounded-[28px] border border-[#E9DED8] shadow-sm p-6 md:p-8 mb-7">

            <div className="mb-6">

              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F3DDD8] text-[#9B6666] text-xs font-semibold">
                Path Details
              </span>

              <h2 className="text-2xl font-bold text-[#26382F] mt-3">
                Learning Path Information
              </h2>

            </div>

            {/* TITLE */}

            <div className="space-y-2 mb-6">

              <label className="block text-sm font-bold text-[#26382F]">
                Path Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. ADHD Learning & Growth Path"
                className="w-full px-5 py-3.5 bg-[#F5F5F0] border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition text-[#26382F]"
              />

            </div>

            {/* =================================================
                COVER IMAGE
            ================================================= */}

            <div className="space-y-3">

              <label className="block text-sm font-bold text-[#26382F]">
                Cover Image
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="w-full px-5 py-3.5 bg-[#F5F5F0] rounded-2xl text-sm text-[#756A65] disabled:opacity-50"
              />

              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-[#756A65]">
                  <span className="animate-spin">
                    ⏳
                  </span>
                  Uploading image...
                </div>
              )}

              {/* IMAGE PREVIEW */}

              {formData.image && !uploadingImage && (
                <div className="mt-4">

                  <p className="text-xs font-semibold text-[#756A65] mb-2">
                    Image Preview
                  </p>

                  <div className="relative w-full max-w-md">

                    <img
                      src={formData.image}
                      alt="Learning path cover"
                      className="w-full h-52 object-cover rounded-2xl border border-[#E9DED8] shadow-sm"
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          formData.image
                        );

                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                  {/* Firebase URL indicator */}

                  <p className="mt-2 text-xs text-[#756A65] break-all">
                    Image uploaded successfully
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              STEPS
          ================================================= */}

          <div className="bg-white rounded-[28px] border border-[#E9DED8] shadow-sm p-6 md:p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

              <div>

                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F3DDD8] text-[#9B6666] text-xs font-semibold">
                  Learning Content
                </span>

                <h2 className="text-2xl font-bold text-[#26382F] mt-3">
                  Learning Steps
                </h2>

                <p className="text-[#756A65] mt-1">
                  Add the steps and practices that will
                  guide the learner.
                </p>

              </div>

              <button
                type="button"
                onClick={addStep}
                className="px-5 py-3 rounded-xl bg-[#26382F] text-white font-semibold hover:bg-[#344A3F] transition"
              >
                + Add Step
              </button>

            </div>

            <div className="space-y-6">

              {formData.steps.map(
                (step, stepIndex) => (

                  <div
                    key={stepIndex}
                    className="relative bg-[#F8F3EE] rounded-[24px] p-5 md:p-6 border border-[#E9DED8]"
                  >

                    {/* STEP HEADER */}

                    <div className="flex items-center justify-between mb-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-[#F3DDD8] flex items-center justify-center font-bold text-[#9B6666]">
                          {stepIndex + 1}
                        </div>

                        <h3 className="font-bold text-[#26382F]">
                          Step {stepIndex + 1}
                        </h3>

                      </div>

                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeStep(stepIndex)
                          }
                          className="text-sm font-semibold text-[#A95D5D] hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    {/* STEP TITLE */}

                    <div className="space-y-2 mb-5">

                      <label className="block text-sm font-bold text-[#26382F]">
                        Step Title
                      </label>

                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) =>
                          handleStepChange(
                            stepIndex,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Understanding Emotions"
                        className="w-full px-5 py-3.5 bg-white border border-[#E5D9D3] rounded-xl focus:outline-none focus:border-[#4A5D4E]"
                      />

                    </div>

                    {/* DESCRIPTION */}

                    <div className="space-y-2 mb-5">

                      <label className="block text-sm font-bold text-[#26382F]">
                        Description
                      </label>

                      <textarea
                        value={step.desc}
                        onChange={(e) =>
                          handleStepChange(
                            stepIndex,
                            "desc",
                            e.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe this learning step..."
                        className="w-full px-5 py-3.5 bg-white border border-[#E5D9D3] rounded-xl resize-none focus:outline-none focus:border-[#4A5D4E]"
                      />

                    </div>

                    {/* PRACTICES */}

                    <div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                        <label className="block text-sm font-bold text-[#26382F]">
                          Practices
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            addPractice(stepIndex)
                          }
                          className="text-sm font-semibold text-[#4A5D4E] hover:underline text-left sm:text-right"
                        >
                          + Add Practice
                        </button>

                      </div>

                      <div className="space-y-3">

                        {(step.practices || [""]).map(
                          (
                            practice,
                            practiceIndex
                          ) => (

                            <div
                              key={practiceIndex}
                              className="flex gap-3"
                            >

                              <input
                                type="text"
                                value={practice}
                                onChange={(e) =>
                                  handlePracticeChange(
                                    stepIndex,
                                    practiceIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Practice ${
                                  practiceIndex + 1
                                }`}
                                className="flex-1 min-w-0 px-5 py-3 bg-white border border-[#E5D9D3] rounded-xl focus:outline-none focus:border-[#4A5D4E]"
                              />

                              {(step.practices || [])
                                .length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePractice(
                                      stepIndex,
                                      practiceIndex
                                    )
                                  }
                                  className="px-4 shrink-0 rounded-xl bg-white border border-[#E5D9D3] text-[#A95D5D] hover:bg-[#FCE8E6]"
                                >
                                  ×
                                </button>
                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-7 border-t border-[#E9DED8]">

              <button
                type="button"
                onClick={() =>
                  navigate("/learning-path")
                }
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#DCCFC8] bg-white text-[#26382F] font-semibold hover:bg-[#F8F3EE] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  uploadingImage ||
                  !formData.assessmentId
                }
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#26382F] text-white font-semibold hover:bg-[#344A3F] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage
                  ? "Uploading Image..."
                  : loading
                  ? "Saving..."
                  : id
                  ? "Update Learning Path"
                  : "Create Learning Path"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddLearningPath;