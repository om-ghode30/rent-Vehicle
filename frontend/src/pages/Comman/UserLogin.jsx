import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/DataContext";

const UserLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(DataContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setMessage("");

    const data = await login({
      email: form.email,
      password: form.password,
    });

    const role = data.role?.toLowerCase();

    if (role === "admin") {
      navigate("/admin/dashboard");
    } 
    else if (role === "owner") {
      navigate("/owner/vehicles");
    } 
    else {
      navigate("/vehicles");
    }

  } catch (error) {
    setMessage(
      error?.message ||
      error?.response?.data?.message ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Error Message */}
          {message && (
            <p className="text-center text-sm text-red-500 mt-2">
              {message}
            </p>
          )}

          {/* Register Link */}
          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-600 font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default UserLogin;