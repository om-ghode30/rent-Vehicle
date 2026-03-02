import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyVehicles, assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";

export default function OwnerVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const res = await getMyVehicles();
      const list = res.data?.data || res.data || [];

      const found = list.find(
        (v) =>
          String(v.id) === String(id) ||
          String(v.vehicle_id) === String(id) ||
          String(v._id) === String(id)
      );

      if (!found) {
        alert("Vehicle not found");
        navigate("/owner/vehicles");
        return;
      }

      setVehicle(found);
    } catch (err) {
      console.error(err);
      alert("Failed to load vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!vehicle) return <p className="p-6">Vehicle not found</p>;

  return (
    <div>
      <div className="sticky top-0 z-50 w-full bg-white shadow-md">
        <Navbar />
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        <h2 className="text-3xl font-bold mb-6">
          {vehicle.brand} {vehicle.model_name || ""}
        </h2>

        {/* Vehicle Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {vehicle.images?.length ? (
            vehicle.images.map((img, index) => (
              <img
                key={index}
                src={assetUrl(img)}
                alt="vehicle"
                className="h-56 w-full object-cover rounded shadow"
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">
              No images uploaded
            </div>
          )}
        </div>

        {/* Vehicle Details Block */}
        <div className="bg-white p-6 rounded shadow space-y-3">

          <p><b>Vehicle Number:</b> {vehicle.vehicle_number || vehicle.vehicleNumber}</p>

          <p><b>Fuel Type:</b> {vehicle.fuel_type || vehicle.fuelType}</p>

          <p><b>Price Per Day:</b> ₹{vehicle.price_per_day}</p>

          {vehicle.seats && (
            <p><b>Seats:</b> {vehicle.seats}</p>
          )}

          {vehicle.bikeType && (
            <p><b>Bike Type:</b> {vehicle.bikeType}</p>
          )}

          <p>
            <b>Availability Status:</b>{" "}
            <span className="text-green-600 font-semibold">
              {vehicle.availability_status || vehicle.status}
            </span>
          </p>

        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/owner/vehicles")}
          className="mt-6 bg-gray-600 text-white px-6 py-2 rounded"
        >
          Back
        </button>

      </div>
    </div>
  );
}