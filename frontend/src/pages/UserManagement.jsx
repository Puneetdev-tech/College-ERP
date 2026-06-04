import { useState } from "react";
import { FaUserPlus, FaTrash } from "react-icons/fa";
import Sidebar from "../components/sidebar";

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@rjit.edu.in",
      role: "Admin",
      status: "Active"
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya@rjit.edu.in",
      role: "Store Manager",
      status: "Active"
    },
    {
      id: 3,
      name: "Amit Verma",
      email: "amit@rjit.edu.in",
      role: "Purchase Officer",
      status: "Inactive"
    }
  ]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [status, setStatus] = useState("Active");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("All fields are required!");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address!");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status
    };

    setUsersList([...usersList, newUser]);
    setName("");
    setEmail("");
    setPassword("");
    setRole("Admin");
    setStatus("Active");
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            User Management
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <FaUserPlus />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left font-semibold text-sm">Name</th>
                <th className="p-4 text-left font-semibold text-sm">Email</th>
                <th className="p-4 text-left font-semibold text-sm">Role</th>
                <th className="p-4 text-left font-semibold text-sm">Status</th>
                <th className="p-4 text-left font-semibold text-sm">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {usersList.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="p-4 font-medium text-slate-800">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4 text-slate-700 font-medium">{user.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        user.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded cursor-pointer transition"
                      title="Delete User"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white w-[500px] rounded-3xl p-8 shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                Add User
              </h2>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Admin</option>
                      <option>Store Manager</option>
                      <option>Purchase Officer</option>
                      <option>Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setErrorMsg("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-5 py-2.5 rounded-xl cursor-pointer transition font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold"
                  >
                    Save User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}