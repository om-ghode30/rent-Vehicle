import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataContext } from "../../context/DataContext";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyUserOtp } = useContext(DataContext);
  
  const location = useLocation();
  const email = location.state?.email;
  const role = location.state?.role; // 👈 Extract role from navigation state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Send both email, otp, and role to your context function
      await verifyUserOtp({ email, otp, role });

      alert("OTP verified successfully");
     navigate("/login");
    } catch (error) {
      alert(error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-2">OTP Verification</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Verifying {role || 'User'} account for <br/> 
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            className="border p-3 text-center text-lg tracking-widest rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
     );
}