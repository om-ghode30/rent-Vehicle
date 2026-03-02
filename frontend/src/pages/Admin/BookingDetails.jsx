import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooking } from "../../api/api";
import { FaCalendarAlt, FaCar, FaIdBadge, FaArrowLeft } from "react-icons/fa";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBooking(id);
      setBooking(res.data?.data || res.data);
    } catch (err) {
      console.error("Booking fetch error:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (!booking) return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-500 font-medium animate-pulse">Loading booking details...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 md:mb-6 font-bold text-sm"
      >
        <FaArrowLeft size={14} /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
        {/* Header/Status Section - Responsive Stack */}
        <div className="bg-slate-900 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Booking Details</h2>
            <p className="text-slate-400 text-sm mt-1 font-mono">Order Ref: #{booking.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border self-start md:self-center ${
            booking.status === 'Completed' ? 'bg-green-500/10 border-green-500 text-green-400' : 
            booking.status === 'Cancelled' ? 'bg-red-500/10 border-red-500 text-red-400' : 
            'bg-blue-500/10 border-blue-500 text-blue-400'
          }`}>
            {booking.status}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Main IDs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <FaIdBadge size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">User ID</p>
                <p className="text-slate-800 font-bold truncate">{booking.user_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <FaCar size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Vehicle ID</p>
                <p className="text-slate-800 font-bold truncate">{booking.vehicle_id}</p>
              </div>
            </div>
          </div>

          {/* Timing Section - Native Stacking */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <FaCalendarAlt className="text-blue-600" /> Rental Timeline
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-hover hover:border-blue-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Date & Time</p>
                  <p className="text-slate-800 font-bold text-sm md:text-base">{formatDate(booking.start_datetime)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-hover hover:border-blue-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return Date & Time</p>
                  <p className="text-slate-800 font-bold text-sm md:text-base">{formatDate(booking.end_datetime)}</p>
                </div>
             </div>
          </div>

          {/* Pricing Section - Responsive Layout */}
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
            <div>
              <p className="text-blue-800 font-bold text-sm uppercase tracking-wide">Total Paid Amount</p>
              <p className="text-xs text-blue-600 font-medium">Inclusive of all taxes & fees</p>
            </div>
            <div className="bg-white/50 px-6 py-2 rounded-2xl">
              <p className="text-3xl font-black text-blue-700">₹{booking.total_price}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-6 text-center text-slate-400 text-xs font-medium leading-relaxed">
          If you have any questions regarding this booking, please contact our 24/7 support.
        </div>
      </div>
    </div>
  );
}