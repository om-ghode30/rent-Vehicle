import { useEffect, useState } from "react";
import {
  getPendingVehicles,
  getPendingUsers,
  getPendingPayments,
} from "../../api/api";
import { useNavigate } from "react-router-dom";
import { FaCar, FaUsers, FaWallet, FaCheckCircle, FaArrowRight } from "react-icons/fa";

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

      const vehicleList = v.data?.data || v.data?.vehicles || v.data || [];
      const userList = u.data?.data || u.data?.users || u.data || [];
      const paymentList = p.data?.data || p.data?.payments || p.data || [];

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

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
       <div className="flex flex-col items-center gap-2">
         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-slate-500 font-bold">Synchronizing Dashboard...</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-10">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Admin <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            System overview and pending approvals
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Pending Vehicles"
          value={stats.vehicles}
          icon={<FaCar size={24} />}
          color="from-blue-600 to-blue-700"
          onClick={() => navigate("/admin/pending-vehicles")}
        />

        <StatCard
          title="Pending Users"
          value={stats.users}
          icon={<FaUsers size={24} />}
          color="from-emerald-600 to-emerald-700"
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Pending Payments"
          value={stats.payments}
          icon={<FaWallet size={24} />}
          color="from-purple-600 to-purple-700"
          onClick={() => navigate("/admin/payments")}
        />
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-8">
          <FaCheckCircle className="text-blue-600" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Priority Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              label: "Review Vehicles", 
              path: "/admin/pending-vehicles", 
              bg: "bg-blue-50 text-blue-700", 
              desc: "Verify car details and documents." 
            },
            { 
              label: "Approve Users", 
              path: "/admin/users", 
              bg: "bg-emerald-50 text-emerald-700", 
              desc: "KYC verification for new drivers." 
            },
            { 
              label: "Manage Payments", 
              path: "/admin/payments", 
              bg: "bg-purple-50 text-purple-700", 
              desc: "Check transactions and refunds." 
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className={`${action.bg} p-6 rounded-2xl text-left transition-all hover:scale-[1.02] group border border-transparent hover:border-current/20`}
            >
              <p className="font-black text-lg flex items-center justify-between">
                {action.label}
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-sm opacity-80 mt-1 font-medium">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${color} text-white p-6 md:p-8 rounded-3xl shadow-lg shadow-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      
      <div className="flex items-center gap-3 mb-4 opacity-80">
        {icon}
        <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
      </div>
      <p className="text-5xl font-black tracking-tight">{value}</p>
      
      <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest opacity-60">
        View Details <FaArrowRight className="ml-2" />
      </div>
    </div>
  );
}