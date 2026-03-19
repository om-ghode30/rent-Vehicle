import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataContext } from "../../context/DataContext";

export default function Otp() {
const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();
const location = useLocation();

const { verifyUserOtp, register } = useContext(DataContext);

// 🔥 Get full data passed from register page
const { form, aadhar } = location.state || {};

// ❗ Safety check
if (!form || !aadhar) {
return ( <div className="text-center mt-10"> <p className="text-red-500">Invalid access. Please register again.</p>
<button
onClick={() => navigate("/register")}
className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
>
Go to Register </button> </div>
);
}

const handleSubmit = async (e) => {
e.preventDefault();

if (otp.length !== 6) {
  alert("Please enter 6 digit OTP");
  return;
}

setLoading(true);

try {
  // ✅ STEP 1: Verify OTP
  await verifyUserOtp({ email: form.email, otp });

  // ✅ STEP 2: Prepare FormData
  const data = new FormData();
  data.append("name", form.name);
  data.append("email", form.email);
  data.append("phone_number", form.phone); // ✅ FIXED
  data.append("password", form.password);
  data.append("role", form.role);
  data.append("aadhar", aadhar);

  // ✅ STEP 3: Register user
  await register(data);

  alert("Registration successful! Please wait for admin approval.");
  navigate("/login");

} catch (error) {
  const msg = error?.response?.data?.message || error.message;

  if (msg?.toLowerCase().includes("expired")) {
    alert("OTP expired. Please try again.");
    navigate("/register");
  } else {
    alert(msg || "Invalid OTP");
  }
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4"> <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6"> <h2 className="text-2xl font-bold text-center mb-2">OTP Verification</h2>


    <p className="text-center text-sm text-gray-500 mb-6">
      Verifying {form.role} account for <br />
      <span className="font-semibold text-gray-700">
        {form.email}
      </span>
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
