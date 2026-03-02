import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function OwnerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/owner/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      alert("Failed to load booking details");
      navigate("/owner/bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-medium text-blue-600 animate-pulse">Loading Booking Details...</p>
    </div>
  );
  
  if (!booking) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b"> */}
        <Navbar />
      {/* </div> */}

      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Booking <span className="text-blue-600">#{booking.id}</span>
            </h2>
            <p className="text-slate-500 mt-1">Manage and review your vehicle rental details</p>
          </div>
          <button
            onClick={() => navigate("/owner/bookings")}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-semibold"
          >
            ← Back to List
          </button>
        </div>

        {/* Image Gallery with polished rounded corners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {booking.vehicle_images?.map((img, index) => (
            <div key={index} className="group overflow-hidden rounded-2xl shadow-md bg-white">
              <img
                src={assetUrl(img)}
                alt="vehicle"
                className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vehicle & User Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">General Information</h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Vehicle</p>
                  <div>
                    <p className="text-xl font-bold text-slate-900">Vehicle Brand : {booking.brand} <br /> Vehicle Model : {booking.model_name}</p>
                    <p className="text-slate-500 font-medium">Vehicle no. : {booking.vehicle_number}</p>
                  </div>
                </div>

                <div className="space-y-4 border-l-4 border-green-500 pl-4">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Customer</p>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{booking.user_name}</p>
                    <p className="text-slate-500 font-medium">{booking.phone_number}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Card */}
            {booking.documents && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Verification Documents</h3>
                <div className="flex flex-wrap gap-4">
                  {booking.documents.aadhar_url && (
                    <a
                      href={assetUrl(booking.documents.aadhar_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[200px] text-center bg-blue-50 text-blue-700 font-bold py-3 rounded-xl border-2 border-transparent hover:border-blue-200 transition-all"
                    >
                      📄 View Aadhar Card
                    </a>
                  )}
                  {booking.documents.license_url && (
                    <a
                      href={assetUrl(booking.documents.license_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[200px] text-center bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl border-2 border-transparent hover:border-indigo-200 transition-all"
                    >
                      🪪 View Driving License
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info - Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24">
              <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-2">Booking Summary</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Duration</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{booking.total_days} Days</p>
                    <p className="text-xs text-slate-400">{new Date(booking.start_datetime).toLocaleDateString()} to {new Date(booking.end_datetime).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Late Fee</span>
                  <span className="font-semibold text-red-500">₹{booking.late_fee}</span>
                </div>

                <div className="pt-4 border-t border-dashed">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-800 font-bold text-lg">Total Revenue</span>
                    <span className="text-2xl font-black text-green-600">₹{booking.total_price}</span>
                  </div>
                </div>

                <div className="pt-4">
                   <div className={`w-full text-center py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs border ${
                     booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                     booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                     'bg-blue-50 text-blue-700 border-blue-200'
                   }`}>
                     {booking.status}
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}