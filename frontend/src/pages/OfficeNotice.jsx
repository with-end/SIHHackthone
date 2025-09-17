import React, { useState } from "react";
import { Plus, Edit, Trash, Check } from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState([
    { id: 1, description: "Water supply will be shut down for maintenance.", date: "2025-08-25" },
    { id: 2, description: "Street repair scheduled on Main Road.", date: "2025-08-22" },
    { id: 3, description: "Electricity shutdown in Sector 5.", date: "2025-08-20" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newNotice, setNewNotice] = useState("");

  const addNotice = () => {
    if (newNotice.trim() === "") return;
    const date = new Date().toISOString().split("T")[0];
    setNotices([{ id: Date.now(), description: newNotice, date }, ...notices]);
    setNewNotice("");
    setShowAdd(false);
  };

  const updateNotice = (id) => {
    const notice = notices.find((n) => n.id === id);
    const desc = prompt("Update notice description:", notice.description);
    if (desc) {
      setNotices(notices.map(n => n.id === id ? {...n, description: desc} : n));
    }
  };

  const deleteNotice = (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const sortedNotices = [...notices].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-900">Department Notices</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition"
        >
          <Plus className="w-5 h-5" /> Add Notice
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex gap-2 items-center">
          <textarea
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Type your notice here..."
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            rows={3}
          />
          <button
            onClick={addNotice}
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <Check className="w-4 h-4" /> OK
          </button>
        </div>
      )}

      <div className="overflow-y-auto max-h-[350px] border rounded-lg">
        <table className="w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left font-medium text-gray-700">Date</th>
              <th className="p-3 text-left font-medium text-gray-700">Description</th>
              <th className="p-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedNotices.map((notice) => (
              <tr key={notice.id} className="border-b hover:bg-gray-50 transition text-left">
                <td className="p-3 text-gray-800 font-medium">{notice.date}</td>
                <td className="p-3 text-gray-700">{notice.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => updateNotice(notice.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" /> Update
                  </button>
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  >
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
