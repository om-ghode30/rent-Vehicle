import { useEffect, useState } from "react";
import {
  getVehicleAnalytics,
  getOwnerAnalytics,
  getUserAnalytics,
  toggleUserBlocked,
  toggleVehicleBlocked,
} from "../../api/api";
import { FaCar, FaUserAlt, FaUserShield, FaChartLine } from "react-icons/fa";

export default function Analytics() {
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [vRes, oRes, uRes] = await Promise.all([
        getVehicleAnalytics(),
        getOwnerAnalytics(),
        getUserAnalytics(),
      ]);

      setVehicles(vRes.data?.data || []);
      setOwners(oRes.data?.data || []);
      setUsers(uRes.data?.data || []);
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <p className="text-blue-600 font-bold animate-pulse">Loading Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 px-4 md:px-0">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <FaChartLine className="text-blue-600" /> Platform Analytics
        </h1>
        <p className="text-slate-500 mt-1">Real-time performance and management</p>
      </div>

      {/* 1. TOP VEHICLES SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FaCar className="text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">Top Vehicles</h2>
        </div>
        
        {/* Mobile View: Cards | Desktop View: Table */}
        <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Vehicle</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Owner</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Bookings</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4">
              {vehicles.map((v) => (
                <tr key={v.id || v.vehicle_id} className="flex flex-col md:table-row bg-white rounded-xl border border-slate-100 md:border-0 md:border-t p-4 md:p-0 shadow-sm md:shadow-none">
                  {/* Mobile Label Layout */}
                  <td className="md:p-4">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Vehicle</span>
                    <p className="font-bold text-slate-800">{v.brand} {v.model_name}</p>
                  </td>
                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Owner</span>
                    <p className="text-slate-600">{v.owner_name}</p>
                  </td>
                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Bookings</span>
                    <p className="font-black text-blue-600 md:text-lg">{v.total_bookings}</p>
                  </td>
                  <td className="md:p-4 mt-4 md:mt-0 flex items-center justify-between md:justify-start gap-4 border-t pt-4 md:border-0 md:pt-0">
                    <button
                      onClick={async () => {
                        try {
                          await toggleVehicleBlocked(v.id || v.vehicle_id, v.isBlocked);
                          fetchAnalytics();
                        } catch (err) { alert("Failed"); }
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none text-center ${
                        v.isBlocked === 1 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {v.isBlocked === 1 ? 'Unblock' : 'Block'}
                    </button>
                    <a href={`/admin/vehicles/${v.id || v.vehicle_id}`} className="text-blue-600 font-bold text-xs underline underline-offset-4">View Profile</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. TOP OWNERS SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FaUserShield className="text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">Top Owners</h2>
        </div>
        <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Owner</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Inventory</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4">
              {owners.map((o) => (
                <tr key={o.id} className="flex flex-col md:table-row bg-white rounded-xl border border-slate-100 md:border-0 md:border-t p-4 md:p-0 shadow-sm md:shadow-none">
                  <td className="md:p-4">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Owner Name</span>
                    <p className="font-bold text-slate-800">{o.name}</p>
                  </td>
                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Vehicles</span>
                    <p className="text-slate-600 font-bold">{o.vehicles_count} Cars / {o.total_bookings} Bookings</p>
                  </td>
                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      o.isBlocked === 1 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {o.isBlocked === 1 ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="md:p-4 mt-4 md:mt-0 flex gap-2 border-t pt-4 md:border-0 md:pt-0">
                    <button
                      onClick={async () => {
                        try {
                          await toggleUserBlocked(o.id, o.isBlocked);
                          fetchAnalytics();
                        } catch (err) { alert('Failed'); }
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none text-center ${
                        o.isBlocked === 1 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {o.isBlocked === 1 ? 'Unblock' : 'Block'}
                    </button>
                    <a href={`/admin/owner/${o.id}`} className="text-blue-600 font-bold text-xs underline underline-offset-4 self-center ml-2">Details</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. TOP USERS SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FaUserAlt className="text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">Top Users</h2>
        </div>
        <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">User</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Activity</th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4">
              {users.map((u) => (
                <tr key={u.id} className="flex flex-col md:table-row bg-white rounded-xl border border-slate-100 md:border-0 md:border-t p-4 md:p-0 shadow-sm md:shadow-none">
                  <td className="md:p-4">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">User Name</span>
                    <p className="font-bold text-slate-800">{u.name}</p>
                  </td>
                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Orders</span>
                    <p className="font-black text-blue-600">{u.bookings_count} Bookings</p>
                  </td>
                  <td className="md:p-4 mt-4 md:mt-0 flex gap-2 border-t pt-4 md:border-0 md:pt-0">
                    <button
                      onClick={async () => {
                        try {
                          await toggleUserBlocked(u.id, u.isBlocked);
                          fetchAnalytics();
                        } catch (err) { alert('Failed'); }
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none text-center ${
                        u.isBlocked === 1 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {u.isBlocked === 1 ? 'Unblock' : 'Block'}
                    </button>
                    <a href={`/admin/users/${u.id}`} className="text-blue-600 font-bold text-xs underline underline-offset-4 self-center ml-2">History</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}