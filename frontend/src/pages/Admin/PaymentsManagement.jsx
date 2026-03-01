import { useEffect, useState } from "react";
import {
  getPendingPayments,
  approvePayment,
  syncCompletedPayments,
} from "../../api/api";

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pending Payments</h1>

        <button
          onClick={handleSync}
          disabled={syncLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          {syncLoading ? "Syncing..." : "Sync Completed Bookings"}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <div className="bg-white p-10 text-center rounded shadow">
          No pending payments found.
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4">{p.booking_id}</td>
                  <td className="p-4">{p.name}</td>
                  <td className="p-4 font-semibold text-green-600">
                    ₹{p.amount}
                  </td>
                  <td className="p-4 uppercase">{p.type}</td>

                  <td className="p-4">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
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