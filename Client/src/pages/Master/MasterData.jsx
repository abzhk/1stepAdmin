import React, { useEffect, useState } from "react";
import {api} from "../../utils/api.js";
import dateFormatUtils from "../../utils/dateFormatUtils.js";
import PermissionGuard from "../../Components/PermissionGuard";
import { MODULES, ACTIONS } from "../../constants/permission.js";

const MasterData = () => {
  const [services, setServices] = useState([]);
  
  const [formData, setFormData] = useState({
    code: "",
    label: "",
    durationDefault: "",
    billable: false,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
       const data = await api(
      "/api/services/serviceType?format=raw"
    );
      setServices(data.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api("/api/services", {
      method: "POST",
      
      body: JSON.stringify({
        type: "serviceType",
        code: formData.code,
        label: formData.label,
        metadata: {
          durationDefault: Number(formData.durationDefault),
          billable: formData.billable,
        },
      }),
    });

    setFormData({
      code: "",
      label: "",
      durationDefault: "",
      billable: false,
    });

    fetchServices();
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className=" mx-auto">
<PermissionGuard 
          module={MODULES.MASTER_DATA} 
          action={ACTIONS.CREATE}
          
        >

        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Service Name</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                className=" rounded-lg px-3 py-2  bg-offwhite "
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className=" rounded-lg px-3 py-2 bg-offwhite "
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="durationDefault"
                value={formData.durationDefault}
                onChange={handleChange}
                className=" rounded-lg px-3 py-2 bg-offwhite "
              />
            </div>

            <div className="flex items-center mt-6  rounded-lg px-3 py-2 focus:outline-none bg-offwhite ">
              <input
                type="checkbox"
                name="billable"
                checked={formData.billable}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium ">Billable</label>
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-peach text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>

          </form>
        </div>
        </PermissionGuard>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Existing Services
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-offwhite text-left text-sm">
                  <th className="p-3">Sl.no</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Code</th>

                  <th className="p-3">Billable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>

                </tr>
              </thead>

              <tbody>
                {services.map((service,index) => (
                  <tr
                    key={service._id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="p-3">{index+1}</td>
                    <td className="p-3">{service.label}</td>
                    <td className="p-3">{service.code}</td>
                    
                    <td className="p-3">
                      {service.metadata?.billable ? "Yes" : "No"}
                    </td>
                    <td className="p-3">
                      {service.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="p-3">
  {dateFormatUtils(service.createdAt)}
</td>

                  </tr>
                ))}

                {services.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MasterData;
