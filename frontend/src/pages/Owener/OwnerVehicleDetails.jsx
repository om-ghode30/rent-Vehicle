import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaCar, FaMoneyBillWave, FaShieldAlt, FaClock, FaArrowLeft } from "react-icons/fa";

export default function OwnerVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/owner/vehicles/${id}`);
      setVehicle(res.data.data.vehicle);
      setImages(res.data.data.images || []);
    } catch (err) {
      alert("Failed to load vehicle");
      navigate("/owner/vehicles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!vehicle) return null;

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden"> {/* FIXED: Added overflow-x-hidden */}
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/owner/vehicles")}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm uppercase tracking-widest transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to Fleet
        </button>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-7 w-full max-w-full overflow-hidden space-y-4"> {/* FIXED: Added width constraints */}
            <div className="relative group bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 md:border-4 border-white overflow-hidden aspect-[4/3] md:h-[450px] lg:h-[500px]">
              {images.length > 0 ? (
                <>
                  <img
                    src={assetUrl(images[currentImage])}
                    alt="vehicle main"
                    // FIXED: Changed to h-full/w-full and object-contain for mobile safety
                    className="w-full h-full object-contain md:object-cover transition-all duration-500"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-full shadow-lg transition-all z-10"
                      >
                        <FaChevronLeft className="text-sm md:text-base" />
                      </button>

                      <button
                        onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white p-2 md:p-3 rounded-full shadow-lg transition-all z-10"
                      >
                        <FaChevronRight className="text-sm md:text-base" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                  No Images Available
                </div>
              )}
            </div>

            {/* THUMBNAILS - Improved scroll behavior */}
            <div className="flex gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={assetUrl(img)}
                  alt={`thumbnail ${index}`}
                  onClick={() => setCurrentImage(index)}
                  className={`h-16 w-20 md:h-20 md:w-full flex-shrink-0 object-cover rounded-xl md:rounded-2xl cursor-pointer transition-all border-2 md:border-4 ${
                    currentImage === index ? "border-blue-500 scale-95 shadow-md" : "border-white hover:border-blue-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: VEHICLE SPECS ================= */}
          <div className="lg:col-span-5 w-full max-w-full space-y-6"> {/* FIXED: Added width constraints */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/60 p-5 md:p-8 border border-slate-100">
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <FaCar className="text-sm" />
                    <span className="text-xs font-black uppercase tracking-widest">Owner Portal</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    vehicle.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                  {vehicle.brand} <span className="text-blue-600">{vehicle.model_name}</span>
                </h1>
                <p className="text-slate-400 font-bold text-xs md:text-sm mt-2 uppercase tracking-tighter">Reg: {vehicle.vehicle_number}</p>
              </div>

              {/* Pricing Section - Flex adjustment for narrow screens */}
              <div className="bg-blue-50 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-row items-center justify-between gap-2 mb-6 md:mb-8">
                <div>
                  <p className="text-blue-800 font-bold text-xs md:text-sm">Your Daily Rate</p>
                  <p className="text-[10px] text-blue-600 font-medium">Standard Pricing</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl md:text-3xl font-black text-blue-700 whitespace-nowrap">₹{vehicle.price_per_day}</p>
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Per Day</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <FaClock className="text-[10px]" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Late Fee</span>
                  </div>
                  <p className="text-base md:text-lg font-black text-red-500">₹{vehicle.late_fee_per_hour}<span className="text-[10px] text-slate-400 ml-1">/hr</span></p>
                </div>
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <FaShieldAlt className="text-[10px]" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Status</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{vehicle.availability_status}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                   className="w-full bg-white text-blue-600 border-2 border-blue-600 py-4 rounded-[1.5rem] font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-[0.98]"
                >
                  Manage Availability
                </button>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}