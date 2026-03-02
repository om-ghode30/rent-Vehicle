import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOwnerDetails } from "../../api/api";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCar, FaArrowLeft, FaCheckCircle, FaClock } from "react-icons/fa";

export default function OwnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [vehicleIds, setVehicleIds] = useState([]);

  useEffect(() => {
    fetchOwner();
  }, [id]);

  const fetchOwner = async () => {
    try {
      const res = await getOwnerDetails(id);
      const data = res.data?.data;

      setOwner(data?.owner || data);
      setVehicleIds(data?.vehicle_ids || []);
    } catch (err) {
      console.error("Owner fetch error:", err);
    }
  };

  if (!owner) return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-500 font-bold animate-pulse text-lg">Fetching owner profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm mb-2"
      >
        <FaArrowLeft size={14} /> Back to Analytics
      </button>

      {/* Owner Header Card - Responsive Stack */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shrink-0">
              <FaUser size={36} className="text-white/80" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{owner.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest ${
                  owner.isApproved 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {owner.isApproved ? <FaCheckCircle /> : <FaClock />}
                  {owner.isApproved ? "Approved Owner" : "Pending Approval"}
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-white/10 text-white/70">
                  ID: {id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid - Responsive Columns */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                <FaEnvelope size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-slate-800 font-bold break-all text-sm md:text-base">{owner.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                <FaPhone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-slate-800 font-bold text-sm md:text-base">{owner.phone_number}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 shrink-0">
              <FaMapMarkerAlt size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Address</p>
              <p className="text-slate-800 font-bold leading-relaxed text-sm md:text-base">
                {owner.address || "No address provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Vehicles Section - Responsive Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FaCar size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Owned Vehicles</h3>
          </div>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase w-fit">
            {vehicleIds.length} Total Vehicles
          </span>
        </div>

        {vehicleIds.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">No vehicles registered by this owner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicleIds.map((vId) => (
              <div
                key={vId}
                onClick={() => navigate(`/admin/vehicles/${vId}`)}
                className="group p-4 md:p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaCar />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-600">Vehicle Ref</p>
                    <p className="text-slate-800 font-bold tracking-tight truncate">ID: {vId}</p>
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 ml-2">
                  <FaArrowLeft className="rotate-180" size={14} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}