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
      // backend returns booking ids as `booking_ids` in data
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

        {/* Show approve/reject only when vehicle is not already approved */}
        {vehicle.status !== "APPROVED" && (
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
        )}
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

        <div className="space-y-4">
          {/* Known document fields with friendly labels */}
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
                <div key={k} className="flex items-center gap-4">
                  <div className="w-40 font-medium">{docMap[k]}:</div>
                  <img src={assetUrl(val)} alt={k} className="h-32 rounded border object-contain" />
                  <a href={assetUrl(val)} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                </div>
              );
            });
          })()}

          {/* Render any other non-image document entries */}
          {Object.entries(documents || {})
            .filter(([key]) => !["images", "rc", "insurance", "puc", "noc", "aadhar"].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-40 font-medium">{key}:</div>
                <img src={assetUrl(value)} alt={key} className="h-32 rounded border object-contain" />
                <a href={assetUrl(value)} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  View
                </a>
              </div>
            ))}

          {/* Vehicle Images (show all) */}
          <div>
            <h4 className="font-semibold mt-4 mb-2">Vehicle Images</h4>
            <div className="grid grid-cols-3 gap-4">
              {(documents?.images || vehicle?.images || []).map((img, idx) => (
                  <a key={idx} href={`/admin/vehicles/${vehicle.id}/image/${idx}`}>
                    <img src={assetUrl(img)} alt={`vehicle-${idx}`} className="rounded border h-40 object-cover" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings (only when vehicle is approved) */}
      {vehicle.status === "APPROVED" && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-3">Booking IDs</h3>

          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <ul className="list-disc pl-6">
              {bookings.map((b) => (
                <li key={b}>
                  <a href={`/admin/booking/${b}`} className="text-blue-600 underline">
                    Booking #{b}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}