import React, { useEffect, useState } from "react";
import {api} from "../../utils/api";


const CreateModule = () => {
  const [moduleName, setModuleName] = useState("");
  const [modules, setModules] = useState([]);
  const[loader,setLoader]= useState(false);
  const[error,setError]=useState(null);

  const fetchModules = async () => {
    try {
      setLoader(true);
      setError(null);
      const data = await api(`/api/module/get-module`, {
        method: "GET",
      });

      setModules(data);
    } catch (error) {
      console.error("Fetch module error:", error);
      setError(error.message || "Failed to fetch modules");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleName.trim()) return;

    try {
      setError(null);

      await api(`/api/module/create`, {
        method: "POST",
        body: JSON.stringify({ modules: moduleName }),
      });

      setModuleName("");
      fetchModules();
    } catch (error) {
      console.error("Create module error:", error);
      setError(error.message || "Something went wrong");
    }
  };

  if (loader) {
    return (
      <div className="w-full bg-offwhite p-6 md:p-8 font-sans text-darkgreen mt-8"> 
        <h2 className="text-lg font-semibold mb-4">Create Module</h2>
        <p>Loading...</p>
      </div>
    );
  }
  if(error){
    return (
      <div className="w-full bg-offwhite p-6 md:p-8 font-sans text-darkgreen mt-8"> 
        <h2 className="text-lg font-semibold mb-4">Create Module</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-offwhite p-6 md:p-8 font-sans text-darkgreen mt-8">
      <h2 className="text-lg font-semibold mb-4">Create Module</h2>


      <form onSubmit={handleSubmit} className="flex gap-2 mb-6 w-90 bg-white rounded-lg ">
        <input
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          placeholder="Enter module name"
          className="border rounded px-3 py-2 w-full"
        />
        <button className="bg-peach text-white px-4 rounded">
          Add
        </button>
      </form>

       <div className="mt-8">
        <h3 className="font-semibold mb-4 text-gray-700">
          Available Modules
        </h3>

        {modules.length === 0 ? (
          <p className="text-gray-400">No modules found</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {modules.map((m) => (
              <div
                key={m._id}
                className="px-4 py-2 bg-gray-100 border rounded-full text-sm font-medium hover:bg-gray-200 transition"
              >
                {m.modules}
              </div>
            ))}
          </div>
            )}
      </div>
    </div>
  );
};

export default CreateModule;
