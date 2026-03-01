import { useEffect, useState } from "react";
import {
  getPendingVehicles,
  getPendingUsers,
  getPendingPayments,
} from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    vehicles: 0,
    users: 0,
    payments: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);
const fetchStats = async () => {
  setLoading(true);
  try {
    const v = await getPendingVehicles();
    const u = await getPendingUsers();
    const p = await getPendingPayments();

    console.log("Vehicles:", v.data);
    console.log("Users:", u.data);
    console.log("Payments:", p.data);

    const vehicleList =
      v.data?.data ||
      v.data?.vehicles ||
      v.data ||
      [];

    const userList =
      u.data?.data ||
      u.data?.users ||
      u.data ||
      [];

    const paymentList =
      p.data?.data ||
      p.data?.payments ||
      p.data ||
      [];

    setStats({
      vehicles: Array.isArray(vehicleList) ? vehicleList.length : 0,
      users: Array.isArray(userList) ? userList.length : 0,
      payments: Array.isArray(paymentList) ? paymentList.length : 0,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of system activities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard
          title="Pending Vehicles"
          value={stats.vehicles}
          color="bg-blue-600"
          onClick={() => navigate("/admin/pending-vehicles")}
        />

        <StatCard
          title="Pending Users"
          value={stats.users}
          color="bg-green-600"
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Pending Payments"
          value={stats.payments}
          color="bg-purple-600"
          onClick={() => navigate("/admin/payments")}
        />

      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate("/admin/pending-vehicles")}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            Review Vehicles
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-green-600 text-white px-5 py-2 rounded font-semibold"
          >
            Approve Users
          </button>

          <button
            onClick={() => navigate("/admin/payments")}
            className="bg-purple-600 text-white px-5 py-2 rounded font-semibold"
          >
            Manage Payments
          </button>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${color} text-white p-6 rounded-xl shadow cursor-pointer hover:scale-105 transition`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}