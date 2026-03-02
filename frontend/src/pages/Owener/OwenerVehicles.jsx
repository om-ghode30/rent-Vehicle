import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVehicles, assetUrl } from "../../api/api";
import api from "../../api/api";
import Navbar from "../../components/Navbar";
import { FaPlus, FaBook, FaSearch, FaTrash, FaEye, FaGasPump, FaTag } from "react-icons/fa";

export default function OwnerVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await getMyVehicles();
      setVehicles(res.data?.data || []);
    } catch (err) {
      alert("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      await api.delete(`/owner/vehicles/${id}`);
      alert("Vehicle deleted");
      fetchVehicles();
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const query = search.toLowerCase();
    return (
      v.brand?.toLowerCase().includes(query) ||
      v.model_name?.toLowerCase().includes(query) ||
      v.vehicle_number?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* <div className="sticky top-0 z-50"> */}
        <Navbar />
      {/* </div> */}

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Top Bar - Fully Responsive Stack */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              My <span className="text-blue-600">Garage</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage your rental fleet and availability.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 flex-1 lg:max-w-3xl">
            {/* ✅ Enhanced Search Bar */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, model, number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/owner/add-vehicle")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <FaPlus /> Add
              </button>

              <button
                onClick={() => navigate("/owner/bookings")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all active:scale-95"
              >
                <FaBook /> Bookings
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Garage...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[2.5rem] text-center">
            <p className="text-slate-400 font-bold text-lg">No vehicles found in your garage.</p>
          </div>
        ) : (
          /* Grid - 1 col on mobile, 2 on tablet, 3 on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((v) => (
              <div key={v.id} className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 transform md:hover:-translate-y-2">
                
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={assetUrl(v.image_url)}
                    alt={v.brand}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${
                      v.status === 'APPROVED' ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-amber-500/80 text-white border-amber-400'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight">
                        {v.brand}
                      </h3>
                      <p className="text-blue-600 font-bold text-sm uppercase tracking-tighter">{v.model_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">₹{v.price_per_day}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Day</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 my-2">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <FaTag className="text-slate-300" /> {v.vehicle_number}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold justify-end">
                      <div className={`w-2 h-2 rounded-full ${v.availability_status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {v.availability_status}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto pt-4">
                    <button
                      onClick={() => navigate(`/owner/view-vehicle/${v.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    >
                      <FaEye /> View
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                    >
                      <FaTrash /> Delete
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