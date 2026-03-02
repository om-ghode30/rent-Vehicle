import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminVehicleById,
  getVehicleFullDetails,
  approveVehicle,
  rejectVehicle,
  assetUrl,
} from "../../api/api";
import { FaCar, FaUser, FaFileAlt, FaGasPump, FaCalendarAlt, FaCheck, FaTimes, FaArrowLeft, FaHistory } from "react-icons/fa";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [documents, setDocuments] = useState({});
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await getAdminVehicleById(id);
      const data = res.data?.data;

      setVehicle(data.vehicle);
      setOwner(data.owner);
      setDocuments(data.documents);

      const detailRes = await getVehicleFullDetails(id);
      const bookingIds =
        detailRes.data?.data?.booking_ids ||
        detailRes.data?.data?.bookings ||
        [];

      setBookings(Array.isArray(bookingIds) ? bookingIds : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    const ok = window.confirm("Are you sure you want to approve this vehicle?");
    if (!ok) return;

    try {
      await approveVehicle(id);
      alert("Vehicle Approved");
      fetchVehicle();
    } catch (err) {
      console.error(err);
      alert("Failed to approve vehicle");
    }
  };

  const handleReject = async () => {
    const ok = window.confirm("Are you sure you want to reject this vehicle?");
    if (!ok) return;

    try {
      await rejectVehicle(id);
      alert("Vehicle Rejected");
      fetchVehicle();
    } catch (err) {
      console.error(err);
      alert("Failed to reject vehicle");
    }
  };

  if (!vehicle) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-black text-xs uppercase tracking-widest leading-relaxed">Loading Review Data...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 md:px-0 bg-slate-50 min-h-screen">
      {/* Top Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors py-2"
      >
        <FaArrowLeft /> <span className="text-sm uppercase tracking-widest">Back to List</span>
      </button>

      {/* Main Vehicle Header - Responsive Action Stack */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                vehicle.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {vehicle.status}
              </span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">REF: {vehicle.id}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              {vehicle.brand} <span className="text-blue-600">{vehicle.model_name}</span>
            </h2>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                <FaCar className="text-blue-500" /> {vehicle.vehicle_number}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                <FaGasPump className="text-blue-500" /> {vehicle.fuel_type}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                <FaCalendarAlt className="text-blue-500" /> {vehicle.year}
              </div>
            </div>
          </div>

          {vehicle.status !== "APPROVED" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-5 md:py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                <FaCheck /> Approve
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-5 md:py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95"
              >
                <FaTimes /> Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Documentation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <FaFileAlt className="text-blue-600" /> Legal Documentation
            </h3>

            <div className="space-y-4">
              {(() => {
                const docMap = {
                  rc: "RC Document",
                  insurance: "Insurance",
                  puc: "PUC",
                  noc: "NOC",
                  aadhar: "Aadhar Card",
                };

                return Object.keys(docMap).map((k) => {
                  const val = documents?.[k];
                  if (!val) return null;
                  return (
                    /* Card-Flip Layout for Documents */
                    <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                      <div className="font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">{docMap[k]}</div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0">
                        <img src={assetUrl(val)} alt={k} className="h-16 w-24 rounded-lg border bg-white object-contain shadow-sm" />
                        <a href={assetUrl(val)} target="_blank" rel="noreferrer" className="bg-white border border-slate-200 text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          Inspect
                        </a>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Vehicle Gallery - Responsive Grid */}
            <div className="mt-12 pt-10 border-t border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-widest text-center md:text-left">Condition Gallery</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {(documents?.images || vehicle?.images || []).map((img, idx) => (
                    <div key={idx} className="group relative rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 h-56 sm:h-48">
                      <img src={assetUrl(img)} alt={`vehicle-${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <a 
                        href={assetUrl(img)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        Enlarge Image
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Profile & History */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Owner Profile</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <FaUser size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Name</p>
                  <p className="text-slate-800 font-black truncate">{owner?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <FaFileAlt size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-slate-800 font-black truncate text-sm">{owner?.email || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Sidebar */}
          {vehicle.status === "APPROVED" && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center justify-between text-slate-400">
                Booking History
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] tracking-normal font-bold">{bookings.length}</span>
              </h3>

              {bookings.length === 0 ? (
                <div className="py-10 text-center">
                  <FaHistory className="text-slate-700 mx-auto mb-3" size={32} />
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">No activity recorded</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {bookings.map((b) => (
                    <a 
                      key={b} 
                      href={`/admin/booking/${b}`} 
                      className="block p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">REF</span>
                        <span className="text-blue-500 font-black">#{b}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}