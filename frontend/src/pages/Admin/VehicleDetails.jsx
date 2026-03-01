import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdminVehicleById,
  getVehicleFullDetails,
  approveVehicle,
  rejectVehicle,
  assetUrl,
} from "../../api/api";

export default function VehicleDetails() {
  const { id } = useParams();

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
      setBookings(detailRes.data?.data?.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    await approveVehicle(id);
    alert("Vehicle Approved");
    fetchVehicle();
  };

  const handleReject = async () => {
    await rejectVehicle(id);
    alert("Vehicle Rejected");
    fetchVehicle();
  };

  if (!vehicle) return <p>Loading...</p>;

  return (
    <div className="space-y-8">

      {/* Vehicle Info */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">
          {vehicle.brand} {vehicle.model_name}
        </h2>

        <p>Vehicle Number: {vehicle.vehicle_number}</p>
        <p>Fuel: {vehicle.fuel_type}</p>
        <p>Year: {vehicle.year}</p>
        <p>Status: {vehicle.status}</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve
          </button>

          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Owner Info */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-3">Owner Details</h3>
        <p>Name: {owner?.name}</p>
        <p>Email: {owner?.email}</p>
        <p>Phone: {owner?.phone}</p>
      </div>

      {/* Documents */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-3">Documents</h3>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(documents || {}).map(([key, value]) =>
            key !== "images" ? (
              <img
                key={key}
                src={assetUrl(value)}
                alt={key}
                className="rounded border"
              />
            ) : null
          )}
        </div>
      </div>

      {/* Bookings */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-3">Booking IDs</h3>

        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul className="list-disc pl-6">
            {bookings.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}