export default function RecentActivities() {
  const activities = [
    "50 Chairs received from supplier",
    "20 Computers issued to Lab",
    "Sports equipment stock updated",
    "Library inventory checked",
    "New order placed for printers",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        Recent Activities
      </h2>

      <div className="space-y-3">
        {activities.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}