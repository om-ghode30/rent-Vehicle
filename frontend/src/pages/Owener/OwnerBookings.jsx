import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";

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

  // Helper to color code statuses
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-700 border-green-200";
    if (s === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b"> */}
        <Navbar />
      {/* </div> */}

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My <span className="text-blue-600">Bookings</span>
          </h2>
          <p className="text-slate-500">Track and manage your incoming vehicle rentals</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <p className="text-slate-400 text-lg">No bookings found yet.</p>
          </div>
        ) : (
          /* Responsive Grid: 1 col on mobile, 2 on lg screens */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((b) => (
              <div 
                key={b.booking_id} 
                className="bg-white group rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Image Section - Fixed size on desktop, full width on mobile */}
                <div className="sm:w-48 lg:w-56 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={assetUrl(b.vehicle_image)}
                    alt={b.brand}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800">
                          Vehicle Brand : {b.brand} <br /> Vehicle Model : {b.model_name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">{b.vehicle_number}</p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Customer</p>
                        <p className="font-semibold text-slate-700 truncate">{b.user_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Revenue</p>
                        <p className="font-bold text-green-600">₹{b.total_price}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400 text-xs">Contact</p>
                        <p className="text-slate-700 font-medium">{b.user_phone}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/owner/bookings/${b.booking_id}`)}
                    className="mt-5 w-full bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}