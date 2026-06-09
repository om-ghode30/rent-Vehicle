import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { 
  FaUser, 
  FaPhoneAlt, 
  FaWallet, 
  FaInfoCircle, 
  FaComments, 
  FaCalendarCheck 
} from "react-icons/fa";

export default function OwnerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/owner/bookings");
      setBookings(res.data?.data || []);
    } catch {
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "cancelled") return "bg-rose-100 text-rose-700 border-rose-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Booking <span className="text-blue-600">History</span>
            </h2>
            <p className="text-slate-500 mt-1 font-medium">Manage and track your fleet's rental performance</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-3">
            <FaCalendarCheck className="text-blue-600" />
            <span className="text-slate-700 font-bold">{bookings.length} Total Bookings</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-500 font-bold animate-pulse">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FaCalendarCheck className="text-slate-300 text-3xl" />
            </div>
            <p className="text-slate-400 text-xl font-medium">No bookings found in your history yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {bookings.map((b) => (
              <div 
                key={b.booking_id} 
                className="bg-white group rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col sm:flex-row"
              >
                {/* Image Section */}
                <div className="sm:w-56 h-56 sm:h-auto relative overflow-hidden bg-slate-100">
                  <img
                    src={assetUrl(b.vehicle_image)}
                    alt={b.brand}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] uppercase tracking-[0.15em] font-black px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${getStatusStyle(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-black text-2xl text-slate-800 leading-tight">
                      {b.brand} <span className="text-blue-600 font-bold">{b.model_name}</span>
                    </h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{b.vehicle_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <FaUser className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Customer</span>
                      </div>
                      <p className="font-bold text-slate-700 truncate text-sm">{b.user_name}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <FaWallet className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Revenue</span>
                      </div>
                      <p className="font-black text-emerald-600 text-sm">₹{b.total_price}</p>
                    </div>
                    <div className="col-span-2 space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-slate-400">
                        <FaPhoneAlt className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Contact</span>
                      </div>
                      <p className="text-slate-700 font-bold text-sm">{b.user_phone}</p>
                    </div>
                  </div>

                  {/* Enhanced Buttons Row */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => navigate(`/owner/bookings/${b.booking_id}`)}
                      className="flex-[2] bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FaInfoCircle /> Details
                    </button>

                    <button
                      onClick={() => navigate(`/chat/${b.booking_id}`)}
                      className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-600 text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FaComments className="text-lg" /> Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}