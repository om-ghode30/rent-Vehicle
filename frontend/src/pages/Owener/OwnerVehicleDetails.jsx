import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function OwnerVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, []);

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
      <p className="text-blue-600 font-bold animate-pulse text-lg">Loading Vehicle Details...</p>
    </div>
  );

  if (!vehicle) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      {/* <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b"> */}
        <Navbar />
      {/* </div> */}

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Top Navigation Row */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/owner/vehicles")}
            className="inline-flex items-center gap-2 px-4 py-2 
                      text-slate-600 font-semibold 
                      bg-white border border-slate-300 rounded-lg
                      shadow-sm
                      hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400
                      active:scale-95 
                      transition-all duration-200 ease-in-out"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to Vehicles</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            Vehicle Brand : {vehicle.brand} <span className="text-blue-600 text-xl md:text-4xl"><br className="hidden md:block" /> Vehicle Model : {vehicle.model_name}</span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg mt-2">Registration No: {vehicle.vehicle_number}</p>
        </div>

        {/* Image Gallery - Responsive Grid */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Vehicle Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((img, index) => (
              <div key={index} className="group overflow-hidden rounded-2xl shadow-md bg-white border border-slate-100">
                <img
                  src={assetUrl(img)}
                  alt="vehicle"
                  className="h-48 md:h-60 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Main Specs Card */}
          <div className="md:col-span-2 bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 border-b pb-4">Full Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
                  vehicle.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Availability</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
                  vehicle.availability_status === 'Available' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {vehicle.availability_status}
                </span>
              </div>

              <div className="sm:col-span-2 border-t pt-4 mt-2">
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Pricing Details</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                    <p className="text-xs md:text-sm text-slate-600 font-medium">Daily Rate</p>
                    <p className="text-xl md:text-2xl font-black text-blue-600">₹{vehicle.price_per_day}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                    <p className="text-xs md:text-sm text-slate-600 font-medium">Late Fee (per hr)</p>
                    <p className="text-xl md:text-2xl font-black text-red-500">₹{vehicle.late_fee_per_hour}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This empty space on desktop will be filled by the specs card stacking on mobile */}
        </div>
      </div>
    </div>
  );
}