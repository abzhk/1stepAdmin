import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AssessmentQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const initialForm = {
    questionText: "",
    type: "multi_choice",
    options: [],
  };

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // FETCH
  const fetchAssessment = async () => {
    try {
      const res = await api(`/api/assessmentquestions/get-by/${id}`);
      setAssessment(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api(
        `/api/assessmentquestions/assessment/${id}/questions`
      );
      setQuestions(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssessment();
    fetchQuestions();
  }, [id]);

  
  const addOption = () => {
    const nextKey = String.fromCharCode(65 + form.options.length);
    setForm({
      ...form,
      options: [...form.options, { key: nextKey, label: "", score: 0 }],
    });
  };

  const removeOption = (index) => {
    const updated = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: updated });
  };

  // TYPE CHANGE
  const handleTypeChange = (type) => {
    setForm({
      ...form,
      type,
      options:
        type === "multi_choice"
          ? []
          : [{ key: "A", label: "", score: 0 }],
    });
  };

  // VALIDATION
  const validateForm = () => {
    if (!form.questionText.trim()) {
       toast.error("Question is required");
      return false;
    }

    if (form.type !== "multi_choice") {
      if (form.options.length < 2) {
        alert("At least 2 options required");
        return false;
      }

      if (form.options.some((o) => !o.label.trim())) {
        alert("All options must be filled");
        return false;
      }
    }

    return true;
  };

  // SAVE
  const saveQuestion = async (isNext = false) => {
    try {
      if (!validateForm()) return;

      const nextOrder =
        questions.length > 0
          ? Math.max(...questions.map((q) => q.order || 0)) + 1
          : 1;

      const payload = {
        assessmentId: id,
        order: nextOrder,
        type: form.type,
        questionText: form.questionText,
      };

  
      if (form.type !== "multi_choice") {
        payload.options = form.options;
      }

      if (editingId) {
        await api(`/api/assessmentquestions/edit-assessment/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/assessmentquestions/addquestions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await fetchQuestions();

      if (isNext) {
        setForm(initialForm);
        setEditingId(null);
      } else {
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT
  const handleEdit = (q) => {
    setEditingId(q._id);

    setForm({
      questionText: q.questionText?.en || "",
      type: q.type,
      options:
        q.type === "multi_choice"
          ? []
          : q.options?.length > 0
          ? q.options
          : [{ key: "A", label: "", score: 0 }],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // RESET
  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  // DELETE
  const openDeletePopup = (id) => {
    setDeleteId(id);
    setDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      await api(`/api/assessmentquestions/assessment/questions/${deleteId}`, {
        method: "DELETE",
      });
      setDeletePopup(false);
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite p-6 flex justify-center">
      <div className="w-full max-w-5xl">

        <button
          onClick={() => navigate("/assessment-list")}
          className="text-sm opacity-80 hover:underline mb-2"
        >
          ← Back
        </button>

        <div className="rounded-3xl bg-white shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-[#2d4a36] to-[#426b50] p-6 text-white">
            <h1 className="text-2xl font-bold">Question</h1>
            <p className="text-sm opacity-90">
              Create and manage questions
            </p>
          </div>

          <div className="p-6">

            {/* ASSESSMENT INFO */}
           {assessment && 
           ( <div className="bg-offwhite p-5 rounded-2xl shadow mb-6"> 
           <h2 className="text-lg font-bold text-darkgreen"> {assessment.title} </h2>
            <p className="text-gray-600 text-sm"> {assessment.description} </p>
             <div className="flex gap-3 mt-3 flex-wrap"> 
              <span className="bg-white px-3 py-1 rounded-lg text-sm shadow"> {assessment.category?.name} </span>
               <span className="bg-white px-3 py-1 rounded-lg text-sm shadow"> Version: {assessment.version} </span>
                <span className="bg-white px-3 py-1 rounded-lg text-sm shadow"> Questions: {questions.length} </span> </div> 
                </div> 
              )}

            {/* FORM */}
            <div className="bg-offwhite p-6 rounded-2xl shadow mb-6">

              <input
                value={form.questionText}
                placeholder="Enter question..."
                className="w-full border p-3 mb-3 rounded-xl"
                onChange={(e) =>
                  setForm({ ...form, questionText: e.target.value })
                }
              />

              <select
                value={form.type}
                className="w-full border p-3 mb-3 rounded-xl"
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="multi_choice">Multi Choice</option>
                <option value="scale">Scale</option>
              </select>

              {/* OPTIONS */}
              {form.type === "multi_choice" ? (
                <div className="bg-offwhite p-4 rounded-xl text-sm">
                  <p className="font-semibold mb-2">
                   Options :
                  </p>
                  <ul className="space-y-1">
                    <li>Never (0)</li>
                    <li>Rarely (1)</li>
                    <li>Sometimes (2)</li>
                    <li>Often (3)</li>
                    <li>Always (4)</li>
                  </ul>
                </div>
              ) : (
                <>
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={opt.label}
                        placeholder="Option"
                        className="flex-1 border p-2 rounded"
                        onChange={(e) => {
                          const updated = [...form.options];
                          updated[i].label = e.target.value;
                          setForm({ ...form, options: updated });
                        }}
                      />

                      <input
                        type="number"
                        value={opt.score}
                        placeholder="Score"
                        className="w-20 border p-2 rounded"
                        onChange={(e) => {
                          const updated = [...form.options];
                          updated[i].score = Number(e.target.value);
                          setForm({ ...form, options: updated });
                        }}
                      />

                      <button
                        onClick={() => removeOption(i)}
                        className="text-red-500"
                      >
                        X
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addOption}
                    className="text-blue-600 text-sm"
                  >
                    + Add Option
                  </button>
                </>
              )}

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
                    onClick={resetForm}
                    className="bg-gray-400 text-white px-5 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* LIST */}
            {questions.map((q, index) => (
              <div key={q._id} className="p-4 bg-offwhite rounded-2xl mb-3">
                <div className="font-semibold">
                  {index + 1}. {q.questionText?.en}
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
                    onClick={() => handleEdit(q)}
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

          </div>
        </div>
      </div>

      {deletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-3">
              Delete Question
            </h2>

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
}

export default AssessmentQuestions;