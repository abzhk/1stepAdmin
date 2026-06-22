import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js"
import { useOutletContext } from "react-router-dom";


const AssessmentList = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const assessmentId = id; 
  const [page, setPage] = useState(1);
const [limit] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const { searchTerm } = useOutletContext();

 const fetchAssessments = async () => {
  try {

   const params = new URLSearchParams({
  page,
  limit,
});

if (searchTerm?.trim()) {
  params.append("search", searchTerm.trim());
}

const res = await api(
  `/api/assessmentquestions/get-assessment?${params}`
);

    setList(res.data || []);
    setTotalPages(res.totalPages || 1);

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchAssessments();
}, [page,searchTerm]);

useEffect(() => {
  setPage(1);
}, [searchTerm]);

const handleDelete = async (id) => {
  try {

    await api(
      `/api/assessmentquestions/assessment/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchAssessments();

  } catch (err) {
    console.error(err);
   toast.error("Failed to delete assessment");
  }
};



  return (
    <div className="p-6 bg-offwhite min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-end items-center mb-6">
        {/* <h1 className="text-heading">Assessments</h1> */}
<PermissionGuard module={MODULES.ASSESSMENT} action={ACTIONS.CREATE}>
        <button
          onClick={() => navigate("/create-assessment")}
          className="bg-darkgreen text-white px-4 py-2 rounded-lg shadow hover:opacity-80"
        >
          + Create Assessment
        </button>
        </PermissionGuard>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white px-6 py-6 rounded-2xl shadow border border-gray-200">
      <div className="bg-white rounded-xl shadow  overflow-hidden">
        
        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 bg-offwhite px-6 py-3 text-table-text">
          <div>SL.NO</div>
          <div>Title</div>
          <div>Version</div>
          <div>Status</div>
          <div>Category</div>
          <div className="text-center">Actions</div>
        </div>

        {/* TABLE BODY */}
        {list.map((a, index) => (
          <div
            key={a._id}
            className="grid grid-cols-6 px-6 py-4 items-center hover:bg-offwhite transition"
          >
            <div className="text-table-text">{index + 1}</div>

            <div className="text-table-text">{a.title}</div>
            <div className="text-table-text">{a.version}</div>
            
            {/* STATUS BADGE */}
            <div>
              <span
                className={`px-3 py-1 rounded-2xl text-sm font-semibold ${
                  a.status === "published"
                    ? "bg-green-100 text-green-700"
                    : a.status === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {a.status}
              </span>
            </div>

            <div className="text-table-text">
              {a.category?.name || "-"}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-center gap-2">
              {/* <PermissionGuard module={MODULES.ASSESSMENT} action={ACTIONS.CREATE}>
              <button
                onClick={() => navigate(`/questions/${a._id}`)}
                className="bg-yellow px-3 py-1 rounded-lg text-sm font-semibold"
              >
                Questions
              </button>
              </PermissionGuard> */}
<PermissionGuard module={MODULES.ASSESSMENT} action={ACTIONS.UPDATE}>
              <button
                onClick={() => navigate(`/create-assessment/${a._id}`)}
                className="bg-darkgreen px-3 py-1 rounded-lg text-sm font-semibold text-white"
              >
                Edit
              </button>

              <button
  onClick={() => handleDelete(a._id)}
  className="bg-red-500 px-3 py-1 rounded-lg text-sm font-semibold text-white"
>
  Delete
</button>
</PermissionGuard>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {list.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No assessments found
          </div>
        )}
      </div>
   
      </div>
       <div className="flex justify-end items-center gap-4 mt-6">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className={`px-4 py-2 rounded-2xl ${
      page === 1
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-yellow hover:bg-peach"
    }`}
  >
    Prev
  </button>

  <span className="font-semibold">
    {page} / {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className={`px-4 py-2 rounded-2xl text-white ${
      page === totalPages
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-darkgreen hover:bg-DARKGREEN"
    }`}
  >
    Next
  </button>

</div>
    </div>
  );
}

export default AssessmentList;