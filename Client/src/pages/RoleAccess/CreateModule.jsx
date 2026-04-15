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
  <div className="min-h-screen bg-white rounded-3xl p-6">
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-darkgreen">
          Module Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage system modules for role permissions
        </p>
      </div>

      {/* Create Module Card */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-darkgreen mb-5">
          Add New Module
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="Enter module name..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-peach text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Add Module
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Modules List */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-darkgreen">
            Available Modules
          </h3>

          <span className="text-sm text-gray-400">
            {modules.length} Total
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            No modules found
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {modules.map((m) => (
              <div
                key={m._id}
                className="px-4 py-2.5 bg-offwhite border border-gray-200 rounded-xl text-sm font-medium text-darkgreen hover:shadow-sm transition"
              >
                {m.modules}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
);
};

export default CreateModule;
