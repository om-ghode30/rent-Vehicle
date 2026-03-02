import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminVehicleById, getVehicleFullDetails, assetUrl } from "../../api/api";

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
          // fallback: try details endpoint which may include images too
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

  if (loading) return <div className="p-8">Loading image...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-gray-800 px-3 py-1 rounded"
          >
            Back
          </button>
          <div className="flex gap-2">
            <a href={imageSrc} target="_blank" rel="noreferrer" className="bg-white text-gray-800 px-3 py-1 rounded">
              Open Raw
            </a>
            <a href={imageSrc} download className="bg-white text-gray-800 px-3 py-1 rounded">
              Download
            </a>
          </div>
        </div>

        <div className="bg-black p-4 rounded">
          <img src={imageSrc} alt="vehicle" className="w-full h-auto rounded shadow-lg object-contain" />
        </div>
      </div>
    </div>
  );
}
