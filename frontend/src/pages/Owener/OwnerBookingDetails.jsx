import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaFileAlt, FaUser, FaCar, FaClock, FaArrowLeft, FaReceipt, FaExternalLinkAlt } from "react-icons/fa";

export default function OwnerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchBooking();
  }, [id]);

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
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!booking) return null;

  const images = booking.vehicle_images || [];

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden"> {/* Added overflow-x-hidden for safety */}
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* Top Navigation Row */}
        <button
          onClick={() => navigate("/owner/bookings")}
          className="mb-6 md:mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm uppercase tracking-widest transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to History
        </button>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES & DOCUMENTS ================= */}
          <div className="lg:col-span-7 w-full max-w-full space-y-6"> {/* Constrained width */}
            
            {/* Main Vehicle Image Slider */}
            <div className="relative group bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 md:border-4 border-white overflow-hidden aspect-[4/3] md:h-[450px]">
              {images.length > 0 ? (
                <>
                  <img
                    src={assetUrl(images[currentImage])}
                    alt="vehicle"
                    // Changed to h-full and object-contain for mobile fit
                    className="w-full h-full object-contain md:object-cover transition-all duration-500"
                  />
                  {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4">
                      <button
                        onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="bg-white/90 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-full shadow-lg transition-all"
                      >
                        <FaChevronLeft className="text-xs md:text-base" />
                      </button>
                      <button
                        onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="bg-white/90 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-full shadow-lg transition-all"
                      >
                        <FaChevronRight className="text-xs md:text-base" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Images</div>
              )}
            </div>

            {/* Thumbnail Navigation - Horizontal scroll with constrained height */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={assetUrl(img)}
                  alt="thumb"
                  onClick={() => setCurrentImage(index)}
                  className={`h-14 w-18 md:h-16 md:w-20 flex-shrink-0 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                    currentImage === index ? "border-blue-500 scale-95" : "border-white"
                  }`}
                />
              ))}
            </div>

            {/* Documents Section */}
            {booking.documents && (
              <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-lg p-5 md:p-8 border border-slate-100">
                <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-6">
                  <FaFileAlt className="text-blue-600" /> Verification Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {booking.documents.aadhar_url && (
                    <a
                      href={assetUrl(booking.documents.aadhar_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">📄</div>
                        <span className="text-xs md:text-sm font-bold text-slate-700">Aadhar Card</span>
                      </div>
                      <FaExternalLinkAlt className="text-slate-300 group-hover:text-blue-500 text-[10px]" />
                    </a>
                  )}
                  {booking.documents.license_url && (
                    <a
                      href={assetUrl(booking.documents.license_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">🪪</div>
                        <span className="text-xs md:text-sm font-bold text-slate-700">Driving License</span>
                      </div>
                      <FaExternalLinkAlt className="text-slate-300 group-hover:text-blue-500 text-[10px]" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: BOOKING SUMMARY ================= */}
          <div className="lg:col-span-5 w-full max-w-full space-y-6">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl p-5 md:p-8 border border-slate-100">
              
              {/* Header Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 text-blue-600 overflow-hidden">
                    <FaReceipt className="flex-shrink-0 text-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">ID #{booking.id}</span>
                  </div>
                  <span className={`flex-shrink-0 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${
                    booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                    booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                  {booking.brand} <span className="text-blue-600">{booking.model_name}</span>
                </h1>
                <p className="text-slate-400 font-bold text-[10px] md:text-xs mt-1 uppercase">Registration: {booking.vehicle_number}</p>
              </div>

              {/* Price Banner */}
              <div className="bg-blue-50 p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <p className="text-blue-800 font-bold text-xs md:text-sm">Total Revenue</p>
                  <p className="text-[10px] text-blue-600 font-medium">Earned Amount</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-blue-700">₹{booking.total_price}</p>
                  <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-400">Net Total</p>
                </div>
              </div>

              {/* Customer & Timeline Information */}
              <div className="space-y-4 mb-6 md:mb-8">
                {/* Customer */}
                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                    <FaUser className="text-sm md:text-base" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                    <p className="font-bold text-sm md:text-base text-slate-800 truncate">{booking.user_name}</p>
                    <p className="text-xs text-slate-500">{booking.phone_number}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-50 p-3 md:p-4 rounded-2xl">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Rental Timeline</p>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <div>
                      <p className="font-bold text-slate-700">{new Date(booking.start_datetime).toLocaleDateString()}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Start</p>
                    </div>
                    <div className="flex-1 border-t border-dashed border-slate-300 mx-2 md:mx-4"></div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">{new Date(booking.end_datetime).toLocaleDateString()}</p>
                      <p className="text-[9px] text-slate-400 uppercase">End</p>
                    </div>
                  </div>
                </div>

                {/* Duration & Late Fees */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-slate-50 p-3 md:p-4 rounded-2xl">
                    <div className="flex items-center gap-1 md:gap-2 mb-1 text-slate-400">
                      <FaClock className="text-[10px]" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase">Duration</span>
                    </div>
                    <p className="text-sm md:text-lg font-black text-slate-700">{booking.total_days} Days</p>
                  </div>
                  <div className="bg-slate-50 p-3 md:p-4 rounded-2xl">
                    <div className="flex items-center gap-1 md:gap-2 mb-1 text-slate-400">
                      <FaReceipt className="text-[10px]" />
                      <span className="text-[9px] md:text-[10px] font-black uppercase">Late Fees</span>
                    </div>
                    <p className="text-sm md:text-lg font-black text-red-500">₹{booking.late_fee}</p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <p className="text-center text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Booking processed on {new Date(booking.start_datetime).toDateString()}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}