import {
  FaBell,
  FaUserCircle,
  FaSearch
} from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center">

      <div className="relative">

        <FaSearch
          className="absolute left-4 top-4 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search inventory..."
          className="pl-12 pr-4 py-3 rounded-xl bg-slate-100 outline-none w-80"
        />

      </div>

      <div className="flex items-center gap-6">

        <div className="relative cursor-pointer">
          <FaBell size={22} />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            4
          </span>
        </div>

        <div className="flex items-center gap-2 cursor-pointer">

          <FaUserCircle size={35} />

          <div>
            <p className="font-semibold">
              Store Manager
            </p>

            <p className="text-xs text-gray-500">
              Admin
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}