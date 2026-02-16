import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const CreateModule = () => {
  const [moduleName, setModuleName] = useState("");
  const [modules, setModules] = useState([]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`${API}/api/module/get-module`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setModules(data);
    } catch (error) {
      console.error("Fetch module error:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleName.trim()) return;

    try {
      const res = await fetch(`${API}/api/module/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules: moduleName }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setModuleName("");
      fetchModules(); 
    } catch (error) {
      console.error("Create module error:", error);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Create Module</h2>


      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
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
