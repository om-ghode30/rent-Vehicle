import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOwnerDetails } from "../../api/api";

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

  if (!owner) return <p>Loading owner details...</p>;

  return (
    <div className="space-y-8">

      {/* Owner Info */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Owner Details</h2>

        <p><strong>Name:</strong> {owner.name}</p>
        <p><strong>Email:</strong> {owner.email}</p>
  <p><strong>Phone:</strong> {owner.phone_number}</p>
        <p><strong>Address:</strong> {owner.address}</p>
        <p><strong>Status:</strong> {owner.isApproved ? "Approved" : "Pending"}</p>
      </div>

      {/* Owner Vehicles */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Owned Vehicles</h3>

        {vehicleIds.length === 0 ? (
          <p>No vehicles registered by this owner.</p>
        ) : (
          <ul className="list-disc pl-6 space-y-2">
            {vehicleIds.map((vId) => (
              <li
                key={vId}
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate(`/admin/vehicle/${vId}`)}
              >
                Vehicle ID: {vId}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}