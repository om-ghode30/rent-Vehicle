import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaChevronLeft, FaChevronRight, FaCar, FaShieldAlt, FaClock, FaArrowLeft } from "react-icons/fa";

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
      setVehicle(res.data.data);
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

          {/* ================= RIGHT COLUMN: VEHICLE DETAILS ================= */}

<div className="lg:col-span-5 w-full max-w-full space-y-6">

  <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-5 md:p-8 border border-slate-100">

    {/* TOP HEADER */}
    <div className="flex items-start justify-between gap-4 mb-6">

      <div>

        <div className="flex items-center gap-2 text-blue-600 mb-2">

          <FaCar className="text-sm" />

          <span className="text-[10px] font-black uppercase tracking-widest">

            Owner Vehicle

          </span>

        </div>

        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">

          {vehicle.brand}

          <span className="text-blue-600">

            {" "} {vehicle.model_name}

          </span>

        </h1>

        <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">

          {vehicle.vehicle_number}

        </p>

      </div>

      {/* STATUS */}
      <div className="flex flex-col gap-2">

        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            vehicle.status === "APPROVED"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >

          {vehicle.status}

        </span>

        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            vehicle.availability_status ===
            "AVAILABLE"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >

          {vehicle.availability_status}

        </span>

      </div>

    </div>

    {/* ACTIVE PRICE */}
    <div
      className={`rounded-3xl p-5 flex items-center justify-between mb-6 ${
        vehicle.availability_status ===
        "AVAILABLE"
          ? "bg-blue-50"
          : "bg-rose-50"
      }`}
    >

      <div>

        <p className="text-sm font-black text-slate-700">

          Daily Rental

        </p>

        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">

          Current Active Price

        </p>

      </div>

      <div className="text-right">

        <p className="text-3xl font-black text-blue-700">

          ₹{vehicle.daily_price}

        </p>

        <p className="text-[10px] font-black uppercase text-blue-500">

          Per Day

        </p>

      </div>

    </div>

    {/* MINI INFO CARDS */}
    <div className="grid grid-cols-2 gap-4 mb-6">

      {/* DAILY */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">

        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

          Daily

        </p>

        <p className="text-xl font-black text-blue-600">

          ₹{vehicle.daily_price}

        </p>

      </div>

      {/* HOURLY */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">

        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

          Hourly

        </p>

        <p className="text-xl font-black text-green-600">

          ₹{vehicle.hourly_price}

        </p>

      </div>

      {/* LATE FEE */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">

        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

          Late Fee

        </p>

        <p className="text-xl font-black text-rose-600">

          ₹{vehicle.late_fee_per_hour || 0}

        </p>

      </div>

      {/* LOCATION */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">

        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

          Pickup

        </p>

        <p className="text-sm font-black text-slate-700 truncate">

          {vehicle.pickup_address}

        </p>

      </div>

    </div>

    {/* LOCATION BLOCK */}
    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 mb-6">

      <div className="flex items-center gap-2 mb-3">

        <FaShieldAlt className="text-blue-600 text-sm" />

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">

          Pickup Location

        </p>

      </div>

      <p className="text-sm font-bold text-slate-700 leading-relaxed">

        {vehicle.pickup_address}

      </p>

      {vehicle.pickup_map_link && (

        <a
          href={vehicle.pickup_map_link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
        >

          Open Map

        </a>

      )}

    </div>

 {/* ACTION BUTTONS */}
<div className="grid grid-cols-2 gap-4">

  {/* AVAILABILITY BUTTON */}
  <button
    onClick={async () => {

      try {

        const newStatus =
          vehicle.availability_status ===
          "AVAILABLE"
            ? "UNAVAILABLE"
            : "AVAILABLE";

        await api.patch(
          `/owner/vehicles/${vehicle.id}/availability`,
          {
            availability_status:
              newStatus,
          }
        );

        setVehicle((prev) => ({
          ...prev,
          availability_status:
            newStatus,
        }));

      } catch (error) {

        alert(
          "Failed to update availability"
        );

      }

    }}
    className={`py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-[0.98] ${
      vehicle.availability_status ===
      "AVAILABLE"
        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-600 hover:text-white"
        : "bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-600 hover:text-white"
    }`}
  >

    {vehicle.availability_status ===
    "AVAILABLE"
      ? "Available"
      : "Unavailable"}

  </button>

  {/* DELETE BUTTON */}
  <button
    onClick={async () => {

      const confirmDelete =
        window.confirm(
          "Delete this vehicle?"
        );

      if (!confirmDelete)
        return;

      try {

        await api.delete(
          `/owner/vehicles/${vehicle.id}`
        );

        alert(
          "Vehicle deleted"
        );

        navigate(
          "/owner/vehicles"
        );

      } catch (error) {

        alert(
          error?.response?.data
            ?.message ||
            "Failed to delete vehicle"
        );

      }

    }}
    className="py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-[0.98] bg-rose-50 text-rose-700 border-2 border-rose-200 hover:bg-rose-600 hover:text-white"
  >

    Delete Vehicle

  </button>

</div>

  </div>

</div>

        </div>
      </div>
    </div>
  );
}