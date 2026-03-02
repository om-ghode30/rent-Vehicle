import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVehicles, assetUrl } from "../../api/api";
import api from "../../api/api";
import Navbar from "../../components/Navbar";

export default function OwnerVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await getMyVehicles();
      const list = res.data?.data || res.data || [];
      const normalized = list.map((v) => ({
        id: v.id || v.vehicle_id || v._id,
        ...v,
      }));
      setVehicles(normalized);
    } catch (err) {
      console.error("Failed to load owner vehicles:", err);
      alert("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Vehicle
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/owner/vehicles/${id}`);
      alert("Vehicle deleted successfully");
      fetchVehicles(); // refresh list
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete vehicle";
      alert(msg);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-50 w-full bg-white bg-opacity-80 backdrop-blur-md shadow-md">
        <Navbar />
      </div>

      <div className="p-6 bg-gray-100 min-h-screen">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search car or bike"
            className="border p-2 rounded w-2/3"
          />

          <button
            onClick={() => navigate("/owner/add-vehicle")}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            Add Vehicle
          </button>
        </div>

        {loading ? (
          <p>Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            No vehicles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded shadow p-4">

                <img
                  src={assetUrl(v.images?.[0] || v.image || "")}
                  alt={`${v.brand}`}
                  className="h-44 w-full object-contain bg-gray-50"
                />

                <h3 className="font-bold mt-2">
                  {v.brand} {v.model_name || v.model}
                </h3>

                <p className="text-sm text-gray-600">
                  {v.fuel_type || v.fuelType || ""}
                </p>

                <p className="font-semibold mt-1">
                  ₹{v.price_per_day || v.pricePerDay} / day
                </p>

                <p className="text-xs text-gray-500">
                  Status: {v.status || v.availability_status || "-"}
                </p>

                {/* ✅ Buttons */}
                <div className="flex gap-2 mt-3">

                  {/* View Button */}
                  <button
                    onClick={() => navigate(`/owner/view-vehicle/${v.id}`)}
                    className="flex-1 bg-green-600 text-white py-2 rounded"
                  >
                    View
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}