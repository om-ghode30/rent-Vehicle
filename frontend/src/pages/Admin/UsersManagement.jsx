import { useEffect, useState } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserAadhar,
  getOwnerAadhar,
} from "../../api/api";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getPendingUsers();
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      fetchUsers();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      fetchUsers();
    } catch (err) {
      alert("Reject failed");
    }
  };

  const handleViewAadhar = async (user) => {
    try {
      // Choose endpoint based on role
      const res =
        String(user.role).toUpperCase() === "OWNER"
          ? await getOwnerAadhar(user.id)
          : await getUserAadhar(user.id);

      const file = new Blob([res.data], { type: res.headers["content-type"] || "image/jpeg" });
      const fileURL = URL.createObjectURL(file);

      // Revoke previous preview URL if any
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setPreviewUrl(fileURL);
    } catch (err) {
      console.error("Aadhar fetch error:", err);
      alert("Failed to load document");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Users</h1>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <div className="bg-white p-10 text-center rounded shadow">
          No pending users found.
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Aadhar</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.phone_number}</td>
                  <td className="p-4 uppercase">{u.role}</td>

                  <td className="p-4">
                    <button
                      onClick={() => handleViewAadhar(u)}
                      className="text-blue-600 underline"
                    >
                      View
                    </button>
                  </td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>

                    <a
                      href={`/admin/users/${u.id}`}
                      className="underline text-blue-600 px-3 py-1"
                    >
                      Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aadhar Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="font-bold mb-4">Aadhar Preview</h2>
            <img src={previewUrl} alt="Aadhar" className="w-full rounded" />
            <button
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}