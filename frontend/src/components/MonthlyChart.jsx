import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useStore } from "../context/StoreContext";

export default function MonthlyChart() {
  const { orders } = useStore();

  const monthlyCounts = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
    Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };

  (orders || []).forEach(o => {
    if (!o.orderDate) return;
    try {
      const parts = o.orderDate.split(" ");
      const datePart = parts[0]; // "YYYY-MM-DD"
      const date = new Date(datePart);
      if (!isNaN(date.getTime())) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[date.getMonth()];
        monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
      }
    } catch (e) {
      // ignore
    }
  });

  const data = [
    { month: "Jan", orders: monthlyCounts.Jan },
    { month: "Feb", orders: monthlyCounts.Feb },
    { month: "Mar", orders: monthlyCounts.Mar },
    { month: "Apr", orders: monthlyCounts.Apr },
    { month: "May", orders: monthlyCounts.May },
    { month: "Jun", orders: monthlyCounts.Jun },
    { month: "Jul", orders: monthlyCounts.Jul },
    { month: "Aug", orders: monthlyCounts.Aug },
    { month: "Sep", orders: monthlyCounts.Sep },
    { month: "Oct", orders: monthlyCounts.Oct },
    { month: "Nov", orders: monthlyCounts.Nov },
    { month: "Dec", orders: monthlyCounts.Dec },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="orders" fill="url(#colorOrders)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}