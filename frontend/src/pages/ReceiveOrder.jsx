import { useState } from "react";
import { FaTruck } from "react-icons/fa";
import Sidebar from "../components/sidebar";

export default function ReceiveOrder() {

  const [showModal, setShowModal] = useState(false);

  const orders = [
    {
      id: "PO001",
      supplier: "HP Technologies",
      item: "Desktop Computer",
      quantity: 20,
      status: "Pending"
    },
    {
      id: "PO002",
      supplier: "Dell India",
      item: "Printer",
      quantity: 10,
      status: "Pending"
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Receive Orders
        </h1>

      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-green-700 text-white">

            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Supplier</th>
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Action</th>
            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.supplier}</td>
                <td className="p-4">{order.item}</td>
                <td className="p-4">{order.quantity}</td>

                <td className="p-4">

                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Receive
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white w-[700px] rounded-2xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              Receive Inventory
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <input
                placeholder="Order ID"
                className="border p-3 rounded-xl"
              />

              <input
                placeholder="Supplier"
                className="border p-3 rounded-xl"
              />

              <input
                placeholder="Quantity Received"
                className="border p-3 rounded-xl"
              />

              <input
                type="date"
                className="border p-3 rounded-xl"
              />

              <input
                type="file"
                className="border p-3 rounded-xl"
              />

              <textarea
                placeholder="Remarks"
                className="border p-3 rounded-xl"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-5 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                className="bg-green-600 text-white px-5 py-2 rounded-xl flex items-center gap-2"
              >
                <FaTruck />
                Confirm Receive
              </button>

            </div>

          </div>

        </div>

      )}

      </div>
    </div>
  );
}