import { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";

const AssessmentCreation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [assessmentId, setAssessmentId] = useState(id || null);
   const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
     test: "",
    image: "",
    scoringType: "sum",
    status: "draft",
  });
 
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const DEFAULT_OPTIONS = [
    {
      key: "A",
      label: "Never",
      score: 0,
    },
    {
      key: "B",
      label: "Rarely",
      score: 1,
    },
    {
      key: "C",
      label: "Sometimes",
      score: 2,
    },
    {
      key: "D",
      label: "Often",
      score: 3,
    },
    {
      key: "E",
      label: "Always",
      score: 4,
    },
  ];

  const initialQuestionForm = {
    questionText: "",
    type: "multi_choice",
    options: DEFAULT_OPTIONS,
  };

  const [questionForm, setQuestionForm] = useState(initialQuestionForm);

  const [editingId, setEditingId] = useState(null);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // FETCH CATEGORY

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api("/api/assessment/category/active");

        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const fetchTests = async (categoryId) => {
  try {
    const res = await api(
      `/api/assessment/category/${categoryId}`
    );

    setTests(res.data || []);
  } catch (error) {
    console.error(error);
  }
};

  // FETCH ASSESSMENT

  useEffect(() => {
  if (!assessmentId) return;

  const fetchAssessment = async () => {
    try {
      const data = await api(
        `/api/assessmentquestions/get-by/${assessmentId}`
      );

      // Load the tests for the selected category
      if (data.category?._id) {
        await fetchTests(data.category._id);
      }

      setForm({
        title: data.title || "",
        description: data.description || "",
        image: data.image || "",
        category: data.category?._id || "",
        test: data.test?._id || data.test || "",
        scoringType: data.scoringType || "sum",
        status: data.status || "draft",
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchAssessment();
}, [assessmentId]);

  // FETCH QUESTIONS

  useEffect(() => {
    if (!assessmentId) return;

    fetchQuestions();
  }, [assessmentId]);

  const fetchQuestions = async () => {
    try {
      const res = await api(
        `/api/assessmentquestions/assessment/${assessmentId}/questions`,
      );

      console.log("FETCH QUESTIONS", res);

      setQuestions(res);

      return res;
    } catch (err) {
      console.error(err);
    }
  };

  // CREATE ASSESSMENT

  const handleCreateAssessment = async () => {
    try {
      const res = await api("/api/assessmentquestions/create", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const newId = res._id;

      setAssessmentId(newId);

      toast.success("Assessment created");

      return newId;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create assessment");
    }
  };

  // UPDATE ASSESSMENT

  const handleUpdateAssessment = async () => {
    try {
      await api(`/api/assessmentquestions/assessment/${assessmentId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      toast.success("Assessment updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update assessment");
    }
  };

  // ADD OPTION

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + questionForm.options.length);

    setQuestionForm({
      ...questionForm,
      options: [
        ...questionForm.options,
        {
          key: nextKey,
          label: "",
          score: 0,
        },
      ],
    });
  };

  // REMOVE OPTION

  const removeOption = (index) => {
    const updated = questionForm.options.filter((_, i) => i !== index);

    setQuestionForm({
      ...questionForm,
      options: updated,
    });
  };

  // TYPE CHANGE

  const handleTypeChange = (type) => {
    if (type === "multi_choice") {
      setQuestionForm({
        ...questionForm,
        type,
        options: DEFAULT_OPTIONS,
      });
    } else {
      setQuestionForm({
        ...questionForm,
        type,
        options: [
          {
            key: "A",
            label: "",
            score: 0,
          },
        ],
      });
    }
  };

  // VALIDATE QUESTION

  const validateQuestion = () => {
    if (!questionForm.questionText.trim()) {
      toast.error("Question is required");

      return false;
    }

    if (questionForm.options.length < 2) {
      toast.error("At least 2 options required");

      return false;
    }

    if (questionForm.options.some((o) => !o.label.trim())) {
      toast.error("Fill all options");

      return false;
    }

    return true;
  };

  // SAVE QUESTION

  const saveQuestion = async (isNext = false) => {
    try {
      if (!validateQuestion()) return;

      if (!assessmentId) {
        toast.error("Create assessment first");
        return;
      }

      const payload = {
        assessmentId,
        type: questionForm.type,
        questionText: questionForm.questionText,
        options: questionForm.options,
      };

      // UPDATE QUESTION
      if (editingId) {
        await api(`/api/assessmentquestions/edit-assessment/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast.success("Question updated");
      }

      // CREATE QUESTION
      else {
        await api("/api/assessmentquestions/addquestions", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        toast.success("Question added");
      }

      await fetchQuestions();

      if (isNext) {
        setQuestionForm(initialQuestionForm);

        setEditingId(null);
      } else {
        resetQuestionForm();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    }
  };

  // EDIT QUESTION

  const handleEditQuestion = (q) => {
    setEditingId(q._id);

    setQuestionForm({
      questionText: q.questionText || "",

      type: q.type,

      options:
        q.options?.length > 0
          ? q.options
          : q.options?.length > 0
            ? q.options
            : [
                {
                  key: "A",
                  label: "",
                  score: 0,
                },
              ],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // RESET QUESTION FORM

  const resetQuestionForm = () => {
    setEditingId(null);
    setQuestionForm(initialQuestionForm);
  };

  // DELETE POPUP

  const openDeletePopup = (id) => {
    setDeleteId(id);
    setDeletePopup(true);
  };

  // DELETE QUESTION

  const confirmDelete = async () => {
    try {
      await api(`/api/assessmentquestions/assessment/questions/${deleteId}`, {
        method: "DELETE",
      });

      setDeletePopup(false);
      setDeleteId(null);
      fetchQuestions();

      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // NEXT STEP

  const handleNext = async () => {
    // STEP 1 VALIDATION
    if (step === 1) {
      if (!form.title || !form.description || !form.category) {
        toast.error("Fill all assessment fields");

        return;
      }

      // CREATE ONLY FIRST TIME
      if (!assessmentId) {
        const newId = await handleCreateAssessment();

        if (!newId) return;
      }
    }

    // STEP 2 VALIDATION
    if (step === 2) {
      if (questions.length === 0) {
        toast.error("Add at least one question");

        return;
      }
    }

    setStep(step + 1);
  };

  // PREVIOUS STEP

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handlePublishVersion = async () => {
    try {
      console.log("FORM BEFORE PUBLISH", form);
      console.log("IMAGE BEFORE PUBLISH", form.image);

      // GET CURRENT ASSESSMENT
      const current = await api(
        `/api/assessmentquestions/get-by/${assessmentId}`,
      );

      // FIRST TIME PUBLISH
      if (
        current.status === "draft" &&
        current.version === 1 &&
        !current.AssessmentId
      ) {
        await api(`/api/assessmentquestions/assessment/${assessmentId}`, {
          method: "PUT",

          body: JSON.stringify({
            ...form,
            isLatestVersion: true,
          }),
        });

        toast.success("Assessment published");

        navigate("/assessment-list");

        return;
      }

      // VERSIONING FLOW
      const payload = {
        assessment: form,
      };

      await api(
        `/api/assessmentquestions/assessment/${assessmentId}/publish-version`,
        {
          method: "POST",

          body: JSON.stringify(payload),
        },
      );

      toast.success("New version published");

      navigate("/assessment-list");
    } catch (err) {
      console.error(err);

      toast.error("Publish failed");
    }
  };

  //excel upload handler question
  const handleExcelImport = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const formData = new FormData();

      formData.append("file", file);

      formData.append("assessmentId", assessmentId);

      await api("/api/assessmentquestions/bulk-import", {
        method: "POST",
        body: formData,
      });

      toast.success("Questions imported");

      const updatedQuestions = await fetchQuestions();

      console.log("UPDATED QUESTIONS", updatedQuestions);
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    }
  };

  const Max_SIZE = 2 * 1024 * 1024; 
  //image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    
    if (!file) return;

    if (file.size > Max_SIZE) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    uploadImage(file);
  };

  const uploadImage = (file) => {
    setUploading(true);

    const fileName = new Date().getTime() + file.name;

    const storageRef = ref(storage, "assessmentImages/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setProgress(prog);
      },

      (error) => {
        console.error(error);

        toast.error("Image upload failed");

        setUploading(false);
      },

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("FIREBASE URL", downloadURL);

          setForm((prev) => ({
            ...prev,
            image: downloadURL,
          }));

          toast.success("Image uploaded");

          setUploading(false);
        });
      },
    );
  };

  return (
    <div className="min-h-screen bg-offwhite p-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* BACK */}
        <button
          onClick={() => navigate("/assessment-list")}
          className="text-sm opacity-80 hover:underline mb-2"
        >
          ← Back
        </button>

        {/* MAIN CARD */}
        <div className="rounded-3xl bg-white shadow-xl overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#2d4a36] to-[#426b50] p-6 text-white">
            <h1 className="text-2xl font-bold">
              {assessmentId ? "Edit Assessment" : "Create Assessment"}
            </h1>

            <p className="text-sm opacity-90">Manage assessment details</p>
          </div>

          {/* STEPPER */}

          <div className="flex items-center justify-center gap-4 p-6 bg-offwhite">
            {/* STEP 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step >= 1 ? "bg-darkgreen" : "bg-gray-400"
                }`}
              >
                1
              </div>

              <span className="font-semibold">Assessment</span>
            </div>

            <div className="w-16 h-1 bg-gray-300 rounded-full" />

            {/* STEP 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step >= 2 ? "bg-darkgreen" : "bg-gray-400"
                }`}
              >
                2
              </div>

              <span className="font-semibold">Questions</span>
            </div>

            <div className="w-16 h-1 bg-gray-300 rounded-full" />

            {/* STEP 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step >= 3 ? "bg-darkgreen" : "bg-gray-400"
                }`}
              >
                3
              </div>

              <span className="font-semibold">Review</span>
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1 */}

            {step === 1 && (
              <div className="bg-offwhite p-6 rounded-2xl shadow mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* TITLE */}
                  <div>
                    <label className="mb-2 block text-label">Title</label>

                    <input
                      value={form.title}
                      className="w-full rounded-xl border-2 border-greenmuted p-3"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="mb-2 block text-label">Category</label>

                    <select
  value={form.category}
  className="w-full rounded-xl border-2 border-greenmuted p-3"
  onChange={async (e) => {
    const categoryId = e.target.value;

    setForm((prev) => ({
      ...prev,
      category: categoryId,
      test: "",
    }));

    await fetchTests(categoryId);
  }}
>
                      <option value="">Select Category</option>

                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
  <label className="mb-2 block text-label">Assessment Code</label>

  <select
    value={form.test}
    className="w-full rounded-xl border-2 border-greenmuted p-3"
    onChange={(e) =>
      setForm({
        ...form,
        test: e.target.value,
      })
    }
  >
    <option value="">Select Test</option>

    {tests.map((test) => (
      <option key={test._id} value={test._id}>
        {test.code}
      </option>
    ))}
  </select>
</div>

                  <div>
                    <label className="mb-2 block text-label">Image</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-xl border-2 border-greenmuted p-3"
                    />

                    {uploading && (
                      <p className="text-sm text-blue-600 mt-2">
                        Uploading... {Math.round(progress)}%
                      </p>
                    )}

                    {(imagePreview || form.image) && (
                      <img
                        src={imagePreview || form.image}
                        alt="assessment"
                        className="mt-4 w-40 h-40 object-cover rounded-xl border"
                      />
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-label">Description</label>

                    <textarea
                      value={form.description}
                      className="w-full rounded-xl border-2 border-greenmuted p-3"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* SCORING */}
                  <div>
                    <label className="mb-2 block text-label">
                      Scoring Type
                    </label>

                    <select
                      value={form.scoringType}
                      className="w-full rounded-xl border-2 border-greenmuted p-3"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          scoringType: e.target.value,
                        })
                      }
                    >
                      <option value="sum">Sum</option>

                      <option value="weighted">Weighted</option>

                      <option value="formula">Formula</option>
                    </select>
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="mb-2 block text-label">Status</label>

                    <select
                      value={form.status}
                      className="w-full rounded-xl border-2 border-greenmuted p-3"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="draft">Draft</option>

                      <option value="published">Published</option>

                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}

            {step === 2 && assessmentId && (
              <>
                {/* QUESTION FORM */}
                <div className="bg-offwhite p-6 rounded-2xl shadow mb-6">
                  <h2 className="text-xl font-bold mb-4">Questions</h2>

                  {/* import question file excel */}
                  <div className="mb-4">
                    <label className="bg-darkgreen text-white px-4 py-2 rounded-xl cursor-pointer">
                      Import Excel / CSV
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelImport}
                        hidden
                      />
                    </label>
                  </div>

                  <input
                    value={questionForm.questionText}
                    placeholder="Enter question..."
                    className="w-full border p-3 mb-3 rounded-xl"
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        questionText: e.target.value,
                      })
                    }
                  />

                  <select
                    value={questionForm.type}
                    className="w-full border p-3 mb-3 rounded-xl"
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="multi_choice">Multi Choice</option>

                    <option value="scale">Scale</option>
                  </select>

                  {/* OPTIONS */}
                  <>
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          value={opt.label}
                          placeholder="Option"
                          className="flex-1 border p-2 rounded"
                          onChange={(e) => {
                            const updated = [...questionForm.options];

                            updated[i].label = e.target.value;

                            setQuestionForm({
                              ...questionForm,
                              options: updated,
                            });
                          }}
                        />

                        <input
                          type="number"
                          value={opt.score}
                          placeholder="Score"
                          className="w-20 border p-2 rounded"
                          onChange={(e) => {
                            const updated = [...questionForm.options];

                            updated[i].score = Number(e.target.value);

                            setQuestionForm({
                              ...questionForm,
                              options: updated,
                            });
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="text-red-500"
                        >
                          X
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addOption}
                      className="text-blue-600 text-sm"
                    >
                      + Add Option
                    </button>
                  </>

                  {/* BUTTONS */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => saveQuestion(false)}
                      className="bg-darkgreen text-white px-5 py-2 rounded-xl"
                    >
                      {editingId ? "Update" : "Save"}
                    </button>

                    {!editingId && (
                      <button
                        onClick={() => saveQuestion(true)}
                        className="bg-yellow text-white px-5 py-2 rounded-xl"
                      >
                        Save & Add Next
                      </button>
                    )}

                    {editingId && (
                      <button
                        onClick={resetQuestionForm}
                        className="bg-gray-400 text-white px-5 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* QUESTION LIST */}
                {questions.map((q, index) => (
                  <div key={q._id} className="p-4 bg-offwhite rounded-2xl mb-3">
                    <div className="font-semibold">
                      {index + 1}. {q.questionText}
                    </div>

                    {q.options?.length > 0 && (
                      <div className="text-sm mt-2">
                        {q.options.map((o, i) => (
                          <div key={i}>
                            {o.label} → {o.score}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="bg-darkgreen text-white px-3 py-1 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeletePopup(q._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* STEP 3 */}

            {step === 3 && (
              <div className="bg-offwhite p-6 rounded-2xl shadow">
                <h2 className="text-2xl font-bold mb-4">Review Assessment</h2>

                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Title:</span> {form.title}
                  </div>

                  <div>
                    <span className="font-semibold">Description:</span>{" "}
                    {form.description}
                  </div>

                  <div>
                    <span className="font-semibold">Questions:</span>{" "}
                    {questions.length}
                  </div>

                  <div>
                    <span className="font-semibold">Status:</span> {form.status}
                  </div>
                </div>
                <PermissionGuard
                  module={MODULES.ASSESSMENT}
                  action={ACTIONS.CREATE}
                >
                  <button
                    className="mt-6 bg-darkgreen text-white px-6 py-3 rounded-xl"
                    onClick={handlePublishVersion}
                  >
                    Publish
                  </button>
                </PermissionGuard>
              </div>
            )}

            {/* NAVIGATION */}

            <div className="flex justify-between mt-6">
              {/* PREV */}
              <button
                disabled={step === 1}
                onClick={handlePrev}
                className={`px-5 py-2 rounded-xl text-white ${
                  step === 1 ? "bg-gray-400" : "bg-darkgreen"
                }`}
              >
                Previous
              </button>

              {/* NEXT */}
              {step < 3 && (
                <button
                  onClick={handleNext}
                  className="bg-darkgreen text-white px-5 py-2 rounded-xl"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE POPUP */}
      {deletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-3">Delete Question</h2>

            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this question?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentCreation;
