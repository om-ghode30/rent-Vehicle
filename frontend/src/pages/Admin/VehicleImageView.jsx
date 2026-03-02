import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminVehicleById, getVehicleFullDetails, assetUrl } from "../../api/api";
import { FaArrowLeft, FaExternalLinkAlt, FaExpand } from "react-icons/fa";

export default function VehicleImageView() {
  const { id, idx } = useParams();
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try to fetch documents first (admin vehicle endpoint includes documents)
        const res = await getAdminVehicleById(id);
        const data = res.data?.data || {};
        const documents = data.documents || {};
        const vehicle = data.vehicle || {};

        const images = documents.images || vehicle.images || [];
        const index = Number(idx || 0);
        
        if (!Array.isArray(images) || images.length === 0) {
          // fallback: try details endpoint
          const det = await getVehicleFullDetails(id);
          const d = det.data?.data || {};
          const imgs = d.images || d.documents?.images || [];
          if (Array.isArray(imgs) && imgs.length > index) {
            setImageSrc(assetUrl(imgs[index]));
          } else {
            throw new Error("No images found for this vehicle");
          }
        } else if (images.length <= index) {
          throw new Error("Image index out of range");
        } else {
          setImageSrc(assetUrl(images[index]));
        }
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, idx]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <p className="mt-4 text-zinc-400 font-bold tracking-widest text-xs uppercase">Rendering Image...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <FaExpand className="text-red-500 text-2xl" />
      </div>
      <p className="text-white font-black text-xl mb-2">Something went wrong</p>
      <p className="text-zinc-500 mb-6 max-w-xs">{error}</p>
      <button 
        onClick={() => navigate(-1)}
        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-4 md:p-6">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        
        {/* Responsive Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
          >
            <FaArrowLeft /> <span className="hidden sm:inline">Back to Review</span>
          </button>
          
          <div className="flex gap-3">
            <a 
              href={imageSrc} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 bg-white text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-xl"
            >
              <FaExternalLinkAlt size={14} /> <span>Raw View</span>
            </a>
          </div>
        </div>

        {/* Image Container with focus layout */}
        <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center relative group">
          <img 
            src={imageSrc} 
            alt="vehicle high resolution view" 
            className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain transition-transform duration-700"
          />
          
          {/* Subtle watermark or info overlay */}
          <div className="absolute bottom-6 left-6 opacity-30 pointer-events-none">
            <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Vehicle Inspection System v2.0</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            Vehicle Reference: #{id} | Index: {idx}
          </p>
        </div>
      </div>
    </div>
  );
}