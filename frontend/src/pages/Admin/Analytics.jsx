import { useEffect, useState } from "react";
import {
  getVehicleAnalytics,
  getOwnerAnalytics,
  getUserAnalytics,
  toggleUserBlocked,
  toggleVehicleBlocked,
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
      const [vRes, oRes, uRes] = await Promise.all([
        getVehicleAnalytics(),
        getOwnerAnalytics(),
        getUserAnalytics(),
      ]);

      setVehicles(vRes.data?.data || []);
      setOwners(oRes.data?.data || []);
      setUsers(uRes.data?.data || []);
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
                <td className="p-4">{v.isBlocked === 1 ? 'Blocked' : 'Active'}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await toggleVehicleBlocked(v.id || v.vehicle_id, v.isBlocked);
                        fetchAnalytics();
                      } catch (err) {
                        alert("Failed to update vehicle status");
                      }
                    }}
                    className={`px-3 py-1 rounded ${v.isBlocked === 1 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {v.isBlocked === 1 ? 'Unblock' : 'Block'}
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
              <th className="p-4 text-left">Status</th>
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
                <td className="p-4">{o.isBlocked === 1 ? "Blocked" : "Active"}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await toggleUserBlocked(o.id, o.isBlocked);
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to update owner status');
                      }
                    }}
                    className={`px-3 py-1 rounded ${o.isBlocked === 1 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {o.isBlocked === 1 ? 'Unblock' : 'Block'}
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
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.bookings_count}</td>
                <td className="p-4">{u.isBlocked === 1 ? "Blocked" : "Active"}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await toggleUserBlocked(u.id, u.isBlocked);
                        fetchAnalytics();
                      } catch (err) {
                        alert('Failed to update user status');
                      }
                    }}
                    className={`px-3 py-1 rounded ${u.isBlocked === 1 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {u.isBlocked === 1 ? 'Unblock' : 'Block'}
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