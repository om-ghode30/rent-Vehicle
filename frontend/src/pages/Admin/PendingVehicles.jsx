import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingVehicles,
  getVehicleAnalytics,
  toggleVehicleBlocked,
  assetUrl, // Kept this import as you had it in your snippet
} from "../../api/api";

import {
  FaCar,
  FaUser,
  FaClipboardCheck,
  FaArrowRight,
} from "react-icons/fa";

export default function PendingVehicles() {
  const navigate = useNavigate();
  
  // State initialization
  const [vehicles, setVehicles] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);

    try {
      // Fetching both pending and analytics data as requested
      const [pendingRes, analyticsRes] = await Promise.all([
        getPendingVehicles(),
        getVehicleAnalytics(),
      ]);

      setVehicles(pendingRes.data?.data || []);
      setTopVehicles(analyticsRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Loading state fallback
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-blue-600 font-bold animate-pulse">Loading Vehicles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 px-4 md:px-0">
      {/* ================= TOP VEHICLES ================= */}
      <section className="pt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaCar className="text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">
            Top Vehicles
          </h2>
        </div>

        <div className="bg-white md:rounded-2xl md:shadow-sm md:border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">
                  Vehicle
                </th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">
                  Owner
                </th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">
                  Bookings
                </th>
                <th className="p-4 text-left font-bold uppercase tracking-wider text-[10px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="flex flex-col md:table-row-group gap-4">
              {topVehicles.map((v) => (
                <tr
                  key={v.id || v.vehicle_id}
                  className="flex flex-col md:table-row bg-white rounded-xl border border-slate-100 md:border-0 md:border-t p-4 md:p-0 shadow-sm md:shadow-none"
                >
                  <td className="md:p-4">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Vehicle
                    </span>

                    <p className="font-bold text-slate-800">
                      {v.brand} {v.model_name}
                    </p>
                  </td>

                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Owner
                    </span>

                    <p className="text-slate-600">
                      {v.owner_name}
                    </p>
                  </td>

                  <td className="md:p-4 mt-3 md:mt-0">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Total Bookings
                    </span>

                    <p className="font-black text-blue-600 md:text-lg">
                      {v.total_bookings}
                    </p>
                  </td>

                  <td className="md:p-4 mt-4 md:mt-0 flex items-center justify-between md:justify-start gap-4 border-t pt-4 md:border-0 md:pt-0">
                    <button
                      onClick={async () => {
                        try {
                          await toggleVehicleBlocked(
                            v.id || v.vehicle_id,
                            v.isBlocked
                          );

                          fetchVehicles();
                        } catch {
                          alert("Failed");
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none text-center ${
                        v.isBlocked === 1
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {v.isBlocked === 1 ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/vehicles/${v.id || v.vehicle_id}`)
                      }
                      className="text-blue-600 font-bold text-xs underline underline-offset-4"
                    >
                      View Profile
                    </button>
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