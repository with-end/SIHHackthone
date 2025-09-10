import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash, Check } from "lucide-react";

export default function OfficerInfo() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [officers, setOfficers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    password: "",
    role: "sub",
  });

  const nagarpalikaId = localStorage.getItem("nagarId");

  const departments = [
    { value: "all", label: "Select Department" },
    { value: "others", label: "Others" },
    { value: "roads", label: "Roads Department" },
    { value: "electricity", label: "Electricity Department" },
    { value: "sanitation", label: "Sanitation Department" },
    { value: "water", label: "Water Department" },
  ];

  useEffect(() => {
    if (selectedDept === "all") {
      setOfficers([]);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/${nagarpalikaId}/department/${selectedDept}/officers`
      )
      .then((res) => setOfficers(res.data.officers || []))
      .catch((err) => {
        console.error("Error fetching officers:", err);
        setOfficers([]);
      });
  }, [selectedDept, nagarpalikaId]);

  const handleChange = (e) => {
    setNewOfficer({ ...newOfficer, [e.target.name]: e.target.value });
  };

  const addOfficer = () => {
    const { name, email, password, role } = newOfficer;
    if (!name || !email || !password) return;

    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/${nagarpalikaId}/department/${selectedDept}/add`,
        newOfficer
      )
      .then((res) => {
        setOfficers(obj => [...obj, res?.data?.newOfficer]);
        setNewOfficer({ name: "", email: "", password: "", role: "sub" });
        setShowAdd(false);
      })
      .catch((err) => console.error("Error adding officer:", err));
  };

  const updateOfficer = (id) => {
    const officer = officers.find((o) => o._id === id);
    const newName = prompt("Enter updated name:", officer.name);
    const newRole = prompt("Enter updated role (main/sub):", officer.role);

    if (!newName || !newRole) return;

    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/officers/${id}`, {
        name: newName,
        role: newRole,
      })
      .then((res) => {
        setOfficers((prev) =>
          prev.map((o) => (o._id === id ? res.data : o))
        );
      })
      .catch((err) => console.error("Error updating officer:", err));
  };

  const deleteOfficer = (id) => {
    if (!confirm("Are you sure you want to delete this officer?")) return;

    axios
      .delete(
        `${import.meta.env.VITE_BACKEND_URL}/${nagarpalikaId}/department/${selectedDept}/remove/${id}`
      )
      .then((res) => setOfficers((prev) => prev.filter((officer) => officer._id !== id)))
      .catch((err) => console.error("Error deleting officer:", err));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-full mx-auto">
      {/* Department selector */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 border rounded-lg w-full sm:w-auto"
        >
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {selectedDept !== "all" && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" /> Add Officer
          </button>
        )}
      </div>

      {/* Add officer form */}
      {showAdd && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            name="name"
            placeholder="Officer Name"
            className="border rounded-lg p-2 w-full"
            value={newOfficer.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Officer Email"
            className="border rounded-lg p-2 w-full"
            value={newOfficer.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border rounded-lg p-2 w-full"
            value={newOfficer.password}
            onChange={handleChange}
          />
          <select
            name="role"
            value={newOfficer.role}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full"
          >
            <option value="sub">Sub Officer</option>
            <option value="main">Main Officer</option>
          </select>

          <button
            onClick={addOfficer}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition col-span-1 sm:col-span-2 lg:col-span-4"
          >
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      )}

      {/* Officers table */}
      {selectedDept !== "all" && (
        <div className="overflow-x-auto border rounded-lg text-left">
          <table className="w-full text-sm table-auto border-collapse min-w-[500px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left font-medium text-gray-700">Name</th>
                <th className="p-3 text-left font-medium text-gray-700">Email</th>
                <th className="p-3 text-left font-medium text-gray-700">Role</th>
                <th className="p-3 text-left font-medium text-gray-700">status</th>
                <th className="p-3 text-left font-medium text-gray-700">Actions</th>
               
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{officer.name}</td>
                  <td className="p-3">{officer.email}</td>
                  <td className="p-3 capitalize">{officer.role}</td>
                  <td className="p-3 capitalize">{officer.status}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateOfficer(officer._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" /> Update
                    </button>
                    <button
                      onClick={() => deleteOfficer(officer._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {officers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-3 text-gray-500">
                    No officers found for this department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
