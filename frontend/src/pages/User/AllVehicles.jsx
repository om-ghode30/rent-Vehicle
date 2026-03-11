import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaCar, FaUserAlt, FaTag, FaArrowRight } from "react-icons/fa";

export default function AllVehicles() {
  const navigate = useNavigate();
  const { approvedVehicles, fetchApprovedVehicles } = useData();

  useEffect(() => {
    fetchApprovedVehicles();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* PAGE HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore <span className="text-blue-600">Available Vehicles</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Choose from our wide range of premium vehicles verified for safety and quality.
          </p>
        </div>

        {/* VEHICLE GRID */}
        {approvedVehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-[2.5rem] text-center">
             <FaCar className="text-slate-200 mx-auto mb-4" size={48} />
             <p className="text-slate-500 font-bold italic">No vehicles available at the moment</p>
          </div>
        ) : (
          /* Grid - 1 col mobile, 2 tablet, 3-4 desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {approvedVehicles.map((vehicle) => (
              <div
                key={vehicle.vehicle_id}
                className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 transform md:hover:-translate-y-2"
              >
                {/* VEHICLE IMAGE */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={assetUrl(vehicle.image_url)}
                    alt={vehicle.brand}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verified</p>
                  </div>
                </div>

                {/* VEHICLE INFO */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-black text-slate-800 leading-tight">
                    {vehicle.brand} <span className="text-blue-600 font-bold block text-sm uppercase tracking-tighter">{vehicle.model_name}</span>
                  </h2>

                  <div className="mt-4 space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <FaTag className="text-slate-300" />
                      <span>{vehicle.vehicle_number}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <FaUserAlt className="text-slate-300" />
                      <span>Owner: <span className="text-slate-700 font-bold">{vehicle.owner_name}</span></span>
                    </div>
                  </div>

                  {/* PRICING & ACTION */}
                  <div className="mt-6 pt-5 border-t border-slate-50">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rental Price</p>
                        <p className="text-2xl font-black text-slate-900">₹{vehicle.price_per_day}<span className="text-xs text-slate-400 font-medium">/day</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/vehicles/${vehicle.vehicle_id}`)}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      View Details
                      <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}