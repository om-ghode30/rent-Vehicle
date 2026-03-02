import { useEffect, useState } from "react";
import {
  getPendingPayments,
  approvePayment,
  syncCompletedPayments,
} from "../../api/api";
import { FaSyncAlt, FaWallet, FaCheckCircle, FaUser, FaHashtag } from "react-icons/fa";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getPendingPayments();
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const ok = window.confirm("Mark this payment as paid?");
    if (!ok) return;

    try {
      await approvePayment(id);
      fetchPayments();
    } catch (err) {
      alert("Payment approval failed");
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await syncCompletedPayments();
      alert(
        `Sync completed. New entries created: ${res.data?.new_entries_created || 0}`
      );
      fetchPayments();
    } catch (err) {
      alert("Sync failed");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 px-2 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Payments <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Review and settle pending owner payouts.</p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncLoading}
          className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
            syncLoading 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          }`}
        >
          <FaSyncAlt className={syncLoading ? "animate-spin" : ""} />
          {syncLoading ? "Syncing..." : "Sync Completed Bookings"}
        </button>
      </div>

      {/* Stats Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 transition-hover hover:border-blue-200">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
          <FaWallet size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{payments.length} Transactions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Retrieving ledger...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <FaCheckCircle className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-bold">All settled! No pending payments found.</p>
        </div>
      ) : (
        /* TABLE CONTAINER - Flips to Cards on Mobile */
        <div className="bg-transparent md:bg-white md:rounded-3xl md:border md:border-slate-100 md:shadow-sm md:overflow-hidden">
          <table className="w-full text-sm border-separate border-spacing-y-4 md:border-spacing-y-0">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-400 border-b border-slate-50">
              <tr>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Booking Ref</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Owner Name</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Amount</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Type</th>
                <th className="p-5 text-left font-black uppercase tracking-widest text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-4">
              {payments.map((p) => (
                <tr key={p.id} className="flex flex-col md:table-row bg-white rounded-3xl border border-slate-100 md:border-0 md:border-t md:border-slate-50 p-6 md:p-0 shadow-sm md:shadow-none transition-hover hover:bg-slate-50/50">
                  
                  {/* Booking ID */}
                  <td className="md:p-5">
                    <span className="md:hidden flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <FaHashtag /> Booking Ref
                    </span>
                    <span className="font-mono font-bold text-slate-600 bg-slate-100 md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg text-xs">
                      #{p.booking_id}
                    </span>
                  </td>

                  {/* Owner Name */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Owner Name</span>
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <FaUser className="text-slate-300" size={12} />
                      {p.name}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Settlement Amount</span>
                    <td className="p-0 font-black text-emerald-600 text-xl md:text-base">
                      ₹{p.amount}
                    </td>
                  </td>

                  {/* Type */}
                  <td className="md:p-5 mt-4 md:mt-0">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Transaction Type</span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-purple-100 inline-block">
                      {p.type}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="md:p-5 mt-6 md:mt-0 border-t md:border-0 pt-4 md:pt-0">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 md:py-2 md:px-4 rounded-xl md:rounded-lg font-black text-sm transition-all shadow-lg shadow-emerald-100 whitespace-nowrap active:scale-95"
                    >
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}