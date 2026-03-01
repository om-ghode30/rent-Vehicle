import { useEffect, useState } from "react";
import {
  getVehicleAnalytics,
  getOwnerAnalytics,
  getUserAnalytics,
  approveUser,
  rejectUser,
  approveVehicle,
  rejectVehicle,
} from "../../api/api";

export default function Analytics() {
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const v = await getVehicleAnalytics();
      const o = await getOwnerAnalytics();
      const u = await getUserAnalytics();

      setVehicles(v.data?.data || []);
      setOwners(o.data?.data || []);
      setUsers(u.data?.data || []);
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="space-y-10">

      {/* Vehicles Ranking with actions */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Top Vehicles by Bookings</h2>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Vehicle</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Bookings</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, i) => (
              <tr key={v.id || v.vehicle_id} className="border-t">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{v.brand} {v.model_name}</td>
                <td className="p-4">{v.owner_name}</td>
                <td className="p-4">{v.total_bookings}</td>
                <td className="p-4">{v.isBlocked ? "Blocked" : "Active"}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await rejectVehicle(v.id || v.vehicle_id);
                        fetchAnalytics();
                      } catch (err) {
                        alert("Failed to block vehicle");
                      }
                    }}
                    className={`px-3 py-1 rounded bg-red-600 text-white`}>
                    Block
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await approveVehicle(v.id || v.vehicle_id);
                        fetchAnalytics();
                      } catch (err) {
                        alert("Failed to unblock vehicle");
                      }
                    }}
                    className={`px-3 py-1 rounded bg-green-600 text-white`}>
                    Unblock
                  </button>

                  <a href={`/admin/vehicles/${v.id || v.vehicle_id}`} className="underline text-blue-600">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Owners Ranking with actions */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Top Owners by Vehicle Count</h2>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Vehicles</th>
              <th className="p-4 text-left">Bookings</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o, i) => (
              <tr key={o.id} className="border-t">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{o.name}</td>
                <td className="p-4">{o.vehicles_count}</td>
                <td className="p-4">{o.total_bookings}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await rejectUser(o.id); // block (mark not approved)
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to block owner');
                      }
                    }}
                    className={`px-3 py-1 rounded bg-red-600 text-white`}>
                    Block
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await approveUser(o.id); // unblock / approve
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to unblock owner');
                      }
                    }}
                    className={`px-3 py-1 rounded bg-green-600 text-white`}>
                    Unblock
                  </button>

                  <a href={`/admin/owner/${o.id}`} className="underline text-blue-600">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users Ranking with actions */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Top Users by Bookings</h2>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Bookings</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.bookings_count}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await rejectUser(u.id);
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to block user');
                      }
                    }}
                    className={`px-3 py-1 rounded bg-red-600 text-white`}>
                    Block
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await approveUser(u.id);
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to unblock user');
                      }
                    }}
                    className={`px-3 py-1 rounded bg-green-600 text-white`}>
                    Unblock
                  </button>

                  <a href={`/admin/users/${u.id}`} className="underline text-blue-600">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function SectionTable({ title, headers, data }) {
  return (
    <div className="bg-white rounded shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="p-4 text-left">{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="p-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}