import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaCar, FaUserAlt, FaTag, FaArrowRight, FaSearch, FaSlidersH } from "react-icons/fa";

export default function AllVehicles() {
  const navigate = useNavigate();
  const { approvedVehicles, fetchApprovedVehicles } = useData();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [priceRange, setPriceRange] = useState(5000);

  const filteredVehicles = approvedVehicles.filter((v) => {
    const matchSearch =
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model_name.toLowerCase().includes(search.toLowerCase());

    const matchLocation =
      location === "" || v.location === location;

    const matchFuel =
      fuelType === "" || v.fuel_type === fuelType;

    const matchPrice =
      v.price_per_day <= priceRange;

    return matchSearch && matchLocation && matchFuel && matchPrice;
  });

  useEffect(() => {
    fetchApprovedVehicles();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* PAGE HEADER & FILTERS */}
        <div className="mb-12 text-center md:text-left">
          
          {/* MODERN FILTER BAR */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 mb-10 shadow-xl shadow-slate-200/50 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* SEARCH INPUT */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>

            
    {/* LOCATION FILTER  This model will be added in future update so do not consider this for now */}
  {/* <select
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="border rounded-lg px-4 py-2 w-full"
  >
    <option value="">All Locations</option>
    <option value="Pune">Kolhapur</option>
    <option value="Mumbai">Pune</option>
  </select> */}

    {/* FUEL TYPE  This model will be added in future update so do not consider this for now */}
  {/* <select
    value={fuelType}
    onChange={(e) => setFuelType(e.target.value)}
    className="border rounded-lg px-4 py-2 w-full"
  >
    <option value="">All Fuel Types</option>
    <option value="petrol">Petrol</option>
    <option value="diesel">Diesel</option>
    <option value="electric">Electric</option>
  </select> */}
  

            {/* PRICE RANGE SLIDER */}
            <div className="space-y-2 px-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FaSlidersH className="text-blue-600" /> Budget: Up to ₹{priceRange}
                </label>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">Per Day</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore <span className="text-blue-600">Available Vehicles</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Filter your search to find the perfect ride for your next journey. All listings are verified.
          </p>
        </div>

        {/* VEHICLE GRID */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[3rem] text-center max-w-2xl mx-auto">
             <FaCar className="text-slate-200 mx-auto mb-4" size={64} />
             <h2 className="text-xl font-bold text-slate-800">No matches found</h2>
             <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
             <button 
              onClick={() => {setSearch(""); setPriceRange(5000);}}
              className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
             >
               Reset All Filters
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.vehicle_id}
                className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 transform md:hover:-translate-y-2 active:scale-95 md:active:scale-100"
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
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tighter">
                      <FaTag className="text-slate-300" />
                      <span>{vehicle.vehicle_number}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <FaUserAlt className="text-slate-300" />
                      <span>Host: <span className="text-slate-700 font-bold">{vehicle.owner_name}</span></span>
                    </div>
                  </div>

                  {/* PRICING & ACTION */}
                  <div className="mt-6 pt-5 border-t border-slate-50">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting at</p>
                        <p className="text-2xl font-black text-slate-900">₹{vehicle.price_per_day}<span className="text-xs text-slate-400 font-medium">/day</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/vehicles/${vehicle.vehicle_id}`)}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Book Now
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