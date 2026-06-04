import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", orders: 40 },
  { month: "Feb", orders: 65 },
  { month: "Mar", orders: 55 },
  { month: "Apr", orders: 90 },
  { month: "May", orders: 75 },
  { month: "Jun", orders: 110 },
  { month: "Jul", orders: 85 },
  { month: "Aug", orders: 95 },
  { month: "Sep", orders: 70 },
  { month: "Oct", orders: 120 },
  { month: "Nov", orders: 105 },
  { month: "Dec", orders: 130 },
];

export default function MonthlyChart() {
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