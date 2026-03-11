import { useEffect } from "react";
import { useData } from "../../context/DataContext";
import Navbar from "../../components/Navbar";
import { FaCalendarAlt, FaCar, FaClock, FaReceipt } from "react-icons/fa";

export default function MyBookings() {
  const { myBookings, fetchMyBookings, cancelBooking } = useData();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    const res = await cancelBooking(id);

    if (res.success) {
      alert("Booking cancelled successfully");
      fetchMyBookings();
    } else {
      alert(res.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* PAGE HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            My <span className="text-blue-600">Bookings</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your active rentals and order history.</p>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[2.5rem] text-center">
             <FaReceipt className="text-slate-200 mx-auto mb-4" size={48} />
             <p className="text-slate-500 font-bold italic">No bookings found in your account</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myBookings.map((booking) => (
              <div
                key={booking.id}
                className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
              >
                {/* LEFT: INFO SECTION */}
                <div className="p-6 md:p-8 space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FaCar size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                        {booking.brand} <span className="text-blue-600">{booking.model_name}</span>
                      </h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{booking.vehicle_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <FaClock className="text-slate-300 mt-1" size={14} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pick Up</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(booking.start_datetime)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCalendarAlt className="text-slate-300 mt-1" size={14} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Return</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(booking.end_datetime)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: STATUS & ACTIONS SECTION */}
                <div className="bg-slate-50 md:bg-transparent p-6 md:p-8 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 gap-4 min-w-[200px]">
                  <div className="text-center md:text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-black text-slate-900">₹{booking.total_price}</p>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                    'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {booking.status}
                  </span>

                  {/* CANCEL BUTTON */}
                  {booking.status !== "CANCELLED" &&
                    booking.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="w-full md:w-auto bg-rose-50 text-rose-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95 mt-2 shadow-sm"
                      >
                        Cancel Order
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}