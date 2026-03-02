import { useEffect, useState } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserAadhar,
  getOwnerAadhar,
} from "../../api/api";
import { FaUserShield, FaEye, FaCheck, FaTimes, FaInfoCircle, FaEnvelope, FaPhone } from "react-icons/fa";

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
    const ok = window.confirm("Are you sure you want to approve this user?");
    if (!ok) return;

    try {
      await approveUser(id);
      fetchUsers();
    } catch (err) {
      alert("Approve failed");
    }
  };

  const handleReject = async (id) => {
    const ok = window.confirm("Are you sure you want to reject this user?");
    if (!ok) return;

    try {
      await rejectUser(id);
      fetchUsers();
    } catch (err) {
      alert("Reject failed");
    }
  };

  const handleViewAadhar = async (user) => {
    try {
      const res =
        String(user.role).toUpperCase() === "OWNER"
          ? await getOwnerAadhar(user.id)
          : await getUserAadhar(user.id);

      const file = new Blob([res.data], { type: res.headers["content-type"] || "image/jpeg" });
      const fileURL = URL.createObjectURL(file);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(fileURL);
    } catch (err) {
      console.error("Aadhar fetch error:", err);
      alert("Failed to load document");
    }
  };

  return (
    <div className="space-y-6 pb-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FaUserShield className="text-blue-600" /> Pending <span className="text-blue-600">Users</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Verify new accounts and documents.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Fetching user list...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <p className="text-slate-400 font-bold italic">No pending user verifications found.</p>
        </div>
      ) : (
        /* TABLE CONTAINER - Flips to Cards on Mobile */
        <div className="bg-transparent md:bg-white md:rounded-3xl md:border md:border-slate-100 md:shadow-sm md:overflow-hidden">
          <table className="w-full text-sm border-separate border-spacing-y-4 md:border-spacing-y-0">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Name</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Contact Info</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Role</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Document</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4">
              {users.map((u) => (
                <tr key={u.id} className="flex flex-col md:table-row bg-white rounded-3xl border border-slate-100 md:border-0 md:border-t md:border-slate-50 p-6 md:p-0 shadow-sm md:shadow-none hover:bg-slate-50/50 transition-colors">
                  
                  {/* Name */}
                  <td className="md:p-5">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">User Name</span>
                    <p className="font-black text-slate-800 text-lg md:text-base">{u.name}</p>
                  </td>

                  {/* Contact Info */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Info</span>
                    <div className="space-y-1">
                      <p className="text-slate-600 font-medium flex items-center gap-2"><FaEnvelope className="text-slate-300" size={12}/> {u.email}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-2"><FaPhone className="text-slate-300" size={12}/> {u.phone_number}</p>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">System Role</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${
                      u.role?.toUpperCase() === 'OWNER' 
                      ? 'bg-purple-50 text-purple-600 border-purple-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Document View */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verification</span>
                    <button
                      onClick={() => handleViewAadhar(u)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-black text-xs uppercase tracking-widest transition-colors"
                    >
                      <FaEye size={14} /> View Aadhar
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="md:p-5 mt-6 md:mt-0 border-t md:border-0 pt-4 md:pt-0">
                    <div className="flex items-center justify-between md:justify-start gap-3">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-100 text-emerald-600 p-3 md:p-2 rounded-xl md:rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Approve User"
                      >
                        <FaCheck size={14} /> <span className="md:hidden font-bold">Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-100 text-rose-600 p-3 md:p-2 rounded-xl md:rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Reject User"
                      >
                        <FaTimes size={14} /> <span className="md:hidden font-bold">Reject</span>
                      </button>
                      <a
                        href={`/admin/users/${u.id}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-600 p-3 md:p-2 rounded-xl md:rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                        title="View Details"
                      >
                        <FaInfoCircle size={14} /> <span className="md:hidden font-bold">Details</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aadhar Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 transform transition-all">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Aadhar Card Preview</h2>
              <button 
                 onClick={() => setPreviewUrl(null)}
                 className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 bg-white">
              <img src={previewUrl} alt="Aadhar" className="w-full h-auto rounded-2xl shadow-xl border border-slate-100" />
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}