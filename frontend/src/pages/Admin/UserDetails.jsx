import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserFullDetails } from "../../api/api";
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTicketAlt, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await getUserFullDetails(id);
      const data = res.data?.data || res.data;

      setUser(data?.user || data);
      setBookings(data?.bookings || data?.booking_ids || []);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  if (!user) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <p className="text-blue-600 font-black animate-pulse uppercase tracking-widest text-xs">Loading profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      {/* Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm py-2"
      >
        <FaArrowLeft size={14} /> Back to Users List
      </button>

      {/* User Info Card - Responsive Stack */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="bg-white/10 p-1 rounded-full border-2 border-white/20 shrink-0">
              <FaUserCircle size={80} className="text-white/90" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{user.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  user.isApproved 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {user.isApproved ? <FaCheckCircle /> : <FaExclamationCircle />}
                  {user.isApproved ? "Approved" : "Pending"}
                </span>
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                  UID: {id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-8 border-b border-slate-50">
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <FaEnvelope size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-slate-800 font-bold break-all text-sm md:text-base">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                <FaPhone size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-slate-800 font-bold text-sm md:text-base">{user.phone_number}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl shrink-0">
              <FaMapMarkerAlt size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Address</p>
              <p className="text-slate-800 font-bold leading-relaxed text-sm md:text-base">
                {user.address || "Address not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Bookings Section - Mobile Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <FaTicketAlt size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Booking History</h3>
          </div>
          <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest w-fit">
            {bookings.length} Total Orders
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic text-sm">No bookings found for this user.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div
                key={b.id || b}
                onClick={() => navigate(`/admin/booking/${b.id || b}`)}
                className="group flex items-center justify-between p-4 md:p-5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-colors">
                    <FaTicketAlt size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-600 transition-colors">Ref ID</p>
                    <p className="text-slate-800 font-bold tracking-tight text-sm md:text-base">#{b.id || b}</p>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0">
                  <FaArrowLeft className="rotate-180" size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}