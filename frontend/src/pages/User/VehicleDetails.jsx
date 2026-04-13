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

  const [driverName, setDriverName] = useState("");

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
    if (!startDate || !endDate || !license || !driverName) {
  alert("Please fill all fields including driver name & license");
  return;
}

    try {
      setBookingLoading(true);
      const formData = new FormData();
      formData.append("vehicle_id", id);
      formData.append("start_datetime", startDate);
      formData.append("end_datetime", endDate);
      formData.append("driver_name", driverName); 
      formData.append("license", license);

      const res = await createBooking(formData);
      if (res.success) {
        alert("Booking successful!");
        navigate("/my-bookings");
      } else {
        alert(res.message || "Booking failed");
      }
    } catch (error) {
      alert(error.message); 
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
    <div className="bg-slate-50 min-h-screen overflow-x-hidden"> {/* FIXED: Added overflow-x-hidden to prevent body scroll */}
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-7 w-full max-w-full overflow-hidden space-y-4"> {/* FIXED: Added w-full max-w-full */}
            <div className="relative group bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-white overflow-hidden aspect-[4/3] md:aspect-video"> 
              <img
                src={assetUrl(images[currentImage])}
                alt="vehicle main"
                // FIXED: Changed h-[300px] to full and h-full to fit within the responsive parent container
                className="w-full h-full object-contain md:object-cover" 
              />
              
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg z-10"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg z-10"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={assetUrl(img)}
                  alt={`thumbnail ${index}`}
                  onClick={() => setCurrentImage(index)}
                  className={`h-16 w-20 md:h-20 md:w-full flex-shrink-0 object-cover rounded-xl cursor-pointer transition-all border-2 ${
                    currentImage === index ? "border-blue-500 scale-95" : "border-white"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: DETAILS & FORM ================= */}
          <div className="lg:col-span-5 w-full max-w-full space-y-6"> {/* FIXED: Added w-full max-w-full */}
            <div className="bg-white rounded-[2rem] shadow-lg p-5 md:p-8 border border-slate-100">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FaCar className="text-sm" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Premium Listing</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                  {vehicle.brand} <span className="text-blue-600">{vehicle.model_name}</span>
                </h1>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase">Registration: {vehicle.vehicle_number}</p>
              </div>

              {/* FIXED: Pricing section optimized for small screens */}
              <div className="bg-blue-50 p-4 md:p-6 rounded-3xl flex flex-row items-center justify-between gap-2 mb-8">
                <div className="flex-1">
                  <p className="text-blue-800 font-bold text-sm">Rental Price</p>
                  <p className="text-[10px] text-blue-600 font-medium">Verified rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xl md:text-3xl font-black text-blue-700 whitespace-nowrap">₹{vehicle.price_per_day}</p>
                  <p className="text-[10px] font-black uppercase text-blue-400">Per Day</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                  <FaUser className="text-blue-600" /> Host Information
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{owner.name}</p>
                    <p className="text-xs text-slate-500">{owner.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl">
                  <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">{owner.address}</p>
                </div>
              </div>

              {/* BOOKING FORM */}
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pick Up</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Drop Off</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="Enter driver name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">License Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLicense(e.target.files[0])}
                    className="hidden"
                    id="license-upload"
                  />
                  <label 
                    htmlFor="license-upload"
                    className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 cursor-pointer hover:bg-slate-100"
                  >
                    <FaFileImage className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {license ? license.name : "Click to upload license"}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {bookingLoading ? "Processing..." : "Confirm & Book Vehicle"}
                </button>
              </form>
              <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase">Secure Payment & Instant Confirmation</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}