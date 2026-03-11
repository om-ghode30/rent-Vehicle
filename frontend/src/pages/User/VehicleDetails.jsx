import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaCar, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaFileImage } from "react-icons/fa";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getVehicleDetails, createBooking } = useData();

  const [currentImage, setCurrentImage] = useState(0);
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [license, setLicense] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      const data = await getVehicleDetails(id);
      setVehicleData(data);
      setLoading(false);
    };
    loadVehicle();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !license) {
      alert("Please fill all fields including license");
      return;
    }

    try {
      setBookingLoading(true);
      const formData = new FormData();
      formData.append("vehicle_id", id);
      formData.append("start_datetime", startDate);
      formData.append("end_datetime", endDate);
      formData.append("license", license);

      const res = await createBooking(formData);
      if (res.success) {
        alert("Booking successful!");
        navigate("/my-bookings");
      } else {
        alert(res.message || "Booking failed");
      }
    } catch (error) {
      alert("Booking error");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!vehicleData)
    return <div className="p-10 text-center text-red-500 font-bold">Vehicle not found</div>;

  const { vehicle, owner, images } = vehicleData;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group">
              <img
                src={assetUrl(images[currentImage])}
                alt="vehicle main"
                className="w-full h-[300px] md:h-[450px] lg:h-[500px] object-cover rounded-[2rem] shadow-2xl border-4 border-white"
              />
              
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white p-3 rounded-full shadow-lg transition-all"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-blue-600 hover:text-white p-3 rounded-full shadow-lg transition-all"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* THUMBNAILS - Horizontal scroll on mobile */}
            <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={assetUrl(img)}
                  alt={`thumbnail ${index}`}
                  onClick={() => setCurrentImage(index)}
                  className={`h-20 w-24 md:w-full flex-shrink-0 object-cover rounded-2xl cursor-pointer transition-all border-4 ${
                    currentImage === index ? "border-blue-500 scale-95 shadow-lg" : "border-white hover:border-blue-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: DETAILS & FORM ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 md:p-8 border border-slate-100">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaCar className="text-sm" />
                  <span className="text-xs font-black uppercase tracking-widest">Premium Listing</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {vehicle.brand} <span className="text-blue-600">{vehicle.model_name}</span>
                </h1>
                <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-tighter">Registration: {vehicle.vehicle_number}</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl flex items-center justify-between mb-8">
                <div>
                  <p className="text-blue-800 font-bold text-sm">Rental Price</p>
                  <p className="text-xs text-blue-600 font-medium">Verified best rate</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-700">₹{vehicle.price_per_day}</p>
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Per Day</p>
                </div>
              </div>

              {/* Owner Info Accordion Style */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                  <FaUser className="text-blue-600" /> Host Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                      {owner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{owner.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{owner.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                    <FaMapMarkerAlt className="text-blue-400 mt-1" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{owner.address}</p>
                  </div>
                </div>
              </div>

              {/* ================= BOOKING FORM ================= */}
              <form onSubmit={handleBooking} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pick Up</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drop Off</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driving License (Photo)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLicense(e.target.files[0])}
                      className="hidden"
                      id="license-upload"
                    />
                    <label 
                      htmlFor="license-upload"
                      className="flex items-center justify-center gap-3 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group"
                    >
                      <FaFileImage className="text-slate-400 group-hover:text-blue-500" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                        {license ? license.name : "Click to upload license"}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : "Confirm & Book Vehicle"}
                </button>
              </form>
              
              <p className="text-center text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-widest">Secure Payment & Instant Confirmation</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}