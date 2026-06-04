export default function LowStock() {
  const items = [
    "A4 Sheets",
    "Markers",
    "Mouse",
    "Keyboard",
    "Printer Ink",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-red-600">
        Low Stock Alerts
      </h2>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-red-50 border border-red-200"
          >
            ⚠️ {item}
          </div>
        ))}
      </div>
    </div>
  );
}