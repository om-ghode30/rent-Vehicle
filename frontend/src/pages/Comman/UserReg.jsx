import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";

const UserReg = () => {
  const navigate = useNavigate();

  // ✅ FIX: use custom hook instead of useContext directly
  const { register } = useData();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [aadhar, setAadhar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAadhar(e.target.files[0]);
  };

  // ================= SUBMIT (DIRECT REGISTER) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setMessage("Passwords do not match");
    }

    if (!aadhar) {
      return setMessage("Aadhar image is required");
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("phone_number", form.phone); // ✅ correct key
      data.append("password", form.password);
      data.append("role", form.role);
      data.append("aadhar", aadhar);

      // ✅ Direct register (NO OTP)
      await register(data);

      alert("Registration successful! Please wait for admin approval.");
      navigate("/login");

    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Phone */}
          <input
            type="text"
            name="phone"
            placeholder="Mobile Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Role */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="USER">USER</option>
            <option value="OWNER">OWNER</option>
          </select>

          {/* Aadhar Upload */}
          <div className="border-2 border-dashed border-gray-300 p-3 rounded-md">
            <label className="block text-sm mb-1 font-medium">
              Aadhar image (required)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="w-full text-sm"
            />
          </div>

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition duration-200"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-red-500 mt-2">
              {message}
            </p>
          )}

          {/* Login */}
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default UserReg;