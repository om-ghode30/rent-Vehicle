import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingVehicles, assetUrl } from "../../api/api";

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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!vehicles || vehicles.length === 0)
    return <p className="p-6">No pending vehicles found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Vehicles</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.vehicle_id}
            onClick={() => handleCardClick(v.vehicle_id)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={assetUrl(v.image_url)}
              alt={`${v.brand} ${v.model_name}`}
              className="h-40 w-full object-cover rounded"
            />

            <h3 className="font-bold mt-3">
              {v.brand} {v.model_name}
            </h3>

            <p className="text-sm text-gray-600">
              Vehicle Number: {v.vehicle_number}
            </p>

            <p className="text-xs text-gray-500">
              Owner: {v.owner_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}