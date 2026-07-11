import React, { useEffect, useState, useRef } from "react";
import { api } from "../../utils/api";
import dateFormatUtils from "../../utils/dateFormatUtils";
import PermissionGuard from "../../Components/PermissionGuard";
import { MODULES, ACTIONS } from "../../constants/permission";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom"; 

const BillingInterval = () => {
  const [billings, setBillings] = useState([]);
  const [editId, setEditId] = useState(null);
  const { searchTerm } = useOutletContext();
  const formRef = useRef(null);


  const [formData, setFormData] = useState({
    label: "",
    code: "",
    discount_percent: 0,
    badge_text: "",
    is_enabled: true,
    order: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      const res = await api("/api/services/admin/planBillingConfig");
      setBillings(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditId(null);

    setFormData({
      label: "",
      code: "",
      discount_percent: 0,
      badge_text: "",
      is_enabled: true,
      order: 1,
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      label: formData.label,
      code: formData.code,
      isActive: formData.isActive,
      order: Number(formData.order),

      metadata: {
        discount_percent: Number(formData.discount_percent),
        badge_text: formData.badge_text,
        is_enabled: formData.is_enabled,
      },
    };

    try {
      if (editId) {
        // UPDATE
        await api(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast.success("Billing updated");
      } else {
        // CREATE
        await api("/api/services", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            type: "planBillingConfig",
          }),
        });

        toast.success("Billing created");
      }

      resetForm();
      fetchBillings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);

    setFormData({
      label: item.label || "",
      code: item.code || "",
      discount_percent: item.metadata?.discount_percent ?? 0,
      badge_text: item.metadata?.badge_text ?? "",
      is_enabled: item.metadata?.is_enabled ?? true,
      order: item.metadata?.order ?? item.order ?? 1,
      isActive: item.isActive ?? true,
    });
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleDelete = async (id) => {
    await api(`/api/services/${id}`, {
      method: "DELETE",
    });

    toast.success("Deleted");
    fetchBillings();
  };


  const filteredBillings = billings.filter((item) => {
  const search = searchTerm?.toLowerCase() || "";

  return (
    item.label?.toLowerCase().includes(search) ||
    item.code?.toLowerCase().includes(search) ||
    item.metadata?.badge_text?.toLowerCase().includes(search) ||
    (item.isActive ? "active" : "inactive").includes(search)
  );
});

  return (
    <div className="min-h-screen bg-offwhite">
      <PermissionGuard module={MODULES.MASTER_DATA} action={ACTIONS.CREATE}>
        <div ref={formRef} style={{ scrollMarginTop: "160px" }} className="bg-white p-6 rounded-2xl shadow mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Label</label>
              <input
                name="label"
                placeholder="Label"
                maxLength={50}
                value={formData.label}
                onChange={handleChange}
                className="bg-offwhite p-2 rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Code</label>
              <input
                name="code"
                placeholder="Code"
                maxLength={50}
                value={formData.code}
                onChange={handleChange}
                className="bg-offwhite p-2 rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Discount %</label>
              <input
                name="discount_percent"
                type="number"
                min={0}
                max={100}
                placeholder="Discount %"
                value={formData.discount_percent}
                onChange={handleChange}
                className="bg-offwhite p-2 rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Badge</label>
              <input
                name="badge_text"
                placeholder="Badge"
                maxLength={50}
                value={formData.badge_text}
                onChange={handleChange}
                className="bg-offwhite p-2 rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Order</label>
              <input
                name="order"
                type="number"
                min={1}
                placeholder="Order"
                value={formData.order}
                onChange={handleChange}
                className="bg-offwhite p-2 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-6">
              <label>
                <input
                  type="checkbox"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleChange}
                />
                <span className="ml-2">Enabled</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span className="ml-2">Active</span>
              </label>
            </div>

            <div className="col-span-2 flex justify-end">
              <button className="bg-peach px-6 py-2 rounded-lg text-white">
                {editId ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </PermissionGuard>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-tabheading mb-4">Billing Intervals</h3>

        <table className="w-full">
          <thead className="bg-offwhite">
            <tr className="text-left text-sm gap-4">
              <th className="p-3">Sl.No</th>
              <th>Label</th>
              <th>Code</th>
              <th>Discount</th>
              <th>Badge</th>
              <th>Order</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBillings.map((item, index) => (
              <tr key={item._id}>
                <td className="p-3 ">{index + 1}</td>
                <td className="p-3 ">{item.label}</td>
                <td className="p-3 ">{item.code}</td>
                <td className="p-3 ">{item.metadata?.discount_percent}%</td>
                <td className="p-3 ">{item.metadata?.badge_text}</td>
                <td className="p-3">{item.metadata?.order ?? item.order}</td>
                <td className="p-3 ">
                  {item.isActive ? "Active" : "Inactive"}
                </td>
                <td>{dateFormatUtils(item.createdAt)}</td>

                <td className="flex gap-2 p-2">
                    <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.UPDATE}
                        >
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-darkgreen px-4 py-2 rounded-lg text-white"
                  >
                    Edit
                  </button>
</PermissionGuard>
  <PermissionGuard
                          module={MODULES.MASTER_DATA}
                          action={ACTIONS.DELETE}
                        >
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 px-4 py-2 rounded-lg text-white"
                  >
                    Delete
                  </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingInterval;
