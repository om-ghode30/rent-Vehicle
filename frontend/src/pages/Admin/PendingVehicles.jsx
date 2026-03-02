import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingVehicles, assetUrl } from "../../api/api";
import { FaCar, FaUser, FaClipboardCheck, FaArrowRight } from "react-icons/fa";

export default function PendingVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await getPendingVehicles();
      setVehicles(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/admin/vehicles/${id}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Loading submissions...</p>
      </div>
    </div>
  );

  if (!vehicles || vehicles.length === 0) return (
    <div className="p-4 md:p-10 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 md:p-16 text-center max-w-lg w-full">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaClipboardCheck className="text-slate-300" size={30} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Queue is Empty</h2>
        <p className="text-slate-500 mt-2">No vehicles are currently waiting for approval.</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Area - Mobile Centered */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Pending <span className="text-blue-600">Vehicles</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">Review listings and verify documentation</p>
      </div>

      {/* Grid - 1 Col on Mobile, 2 on Tablet, 3 on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.vehicle_id}
            onClick={() => handleCardClick(v.vehicle_id)}
            className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform md:hover:-translate-y-1 active:scale-95 md:active:scale-100"
          >
            {/* Image Wrap */}
            <div className="relative h-56 sm:h-48 overflow-hidden">
              <img
                src={assetUrl(v.image_url)}
                alt={`${v.brand} ${v.model_name}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Review Needed
                </span>
              </div>
            </div>

            {/* Content Wrap */}
            <div className="p-6">
              <h3 className="font-black text-xl text-slate-800 leading-tight">
                {v.brand} {v.model_name}
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FaCar className="text-slate-400" size={14} />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {v.vehicle_number}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-slate-500">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FaUser className="text-slate-400" size={14} />
                  </div>
                  <p className="text-xs font-medium">
                    Owner: <span className="text-slate-700 font-bold">{v.owner_name}</span>
                  </p>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between text-blue-600 font-black text-xs uppercase tracking-widest">
                <span>Examine Documents</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}