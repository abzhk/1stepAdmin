import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

const LearningPathList = () => {

  const navigate = useNavigate();

  const [learningPaths, setLearningPaths] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchLearningPaths = async () => {

    try {

      const res = await api(
        "/api/learning-path/all"
      );

      setLearningPaths(
        res.data || []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchLearningPaths();

  }, []);

  const handleDelete = (id) => {

  setSelectedId(id);

  setShowDeleteModal(true);

};
  const confirmDelete = async () => {

    try {

      await api(
        `/api/learning-path/${selectedId}`,
        {
          method: "DELETE",
        }
      );

      fetchLearningPaths();

    } catch (error) {

      console.error(error);

    } finally {

      setShowDeleteModal(false);

      setSelectedId(null);

    }

  };
  return (

    <div className="p-8">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">

          Learning Paths

        </h1>

        <button

          onClick={() =>
            navigate(
              "/resources/addlearningpath"
            )
          }

          className="bg-[#4A5D4E] text-white px-5 py-2 rounded-xl"

        >

          Add Learning Path

        </button>

      </div>

      <div className="overflow-x-auto rounded-xl shadow">

        <table className="min-w-full bg-white">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-4 text-left">

                Image

              </th>

              <th className="p-4 text-left">

                Title

              </th>

              <th className="p-4 text-left">

                Assessment

              </th>

              <th className="p-4 text-center">

                Steps

              </th>

              <th className="p-4 text-center">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {

              learningPaths.length === 0 ?

                (

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center p-8"

                    >

                      No Learning Paths Found

                    </td>

                  </tr>

                )

                :

                (

                  learningPaths.map(

                    (item) => (

                      <tr

                        key={item._id}

                        className="border-b"

                      >

                        <td className="p-4">

                          <img

                            src={item.image}

                            alt={item.title}

                            className="w-20 h-20 rounded-lg object-cover"

                          />

                        </td>

                        <td className="p-4 font-semibold">

                          {item.title}

                        </td>

                        <td className="p-4">

                          {

                            item.assessmentId?.title ||

                            item.assessmentId

                          }

                        </td>

                        <td className="p-4 text-center">

                          {

                            item.steps?.length

                          }

                        </td>

                        <td className="p-4">

                          <div className="flex justify-center gap-3">

                            <button

                              onClick={() =>

                                navigate(

                                  `/resources/edit-learning-path/${item._id}`

                                )

                              }

                              className="bg-[#4A5D4E] text-white px-4 py-2 rounded-lg"

                            >

                              Edit

                            </button>

                            <button

                              onClick={() =>

                                handleDelete(item._id)

                              }

                              className="bg-red-500 text-white px-4 py-2 rounded-lg"

                            >

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>

                    )

                  )

                )

            }

          </tbody>

        </table>

      </div>
      {
  showDeleteModal && (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-2xl shadow-xl p-6 w-[380px]">

        <h2 className="text-xl font-bold mb-3">
          Delete Learning Path
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this learning path?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">

          <button

            onClick={() => {

              setShowDeleteModal(false);

              setSelectedId(null);

            }}

            className="px-5 py-2 rounded-lg border"

          >
            Cancel
          </button>

          <button

            onClick={confirmDelete}

            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"

          >
            Delete
          </button>

        </div>

      </div>

    </div>

  )
}

    </div>

  );

};

export default LearningPathList;