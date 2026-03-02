import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/DataContext";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

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
    console.log("Submitting login form with:", form);
    try {
      setLoading(true);
      setMessage("");
      console.log("Calling login function from context...");
      const data = await login({
        email: form.email,
        password: form.password,
      });
      console.log("Login response data:", data);
      const role = data.role?.toLowerCase();
      console.log("User role after login:", role);
      
      if (role === "admin") {
        navigate("/admin/dashboard");
        console.log("Admin logged in, navigating to dashboard");
      } 
      else if (role === "owner") {
        navigate("/owner/vehicles");
        console.log("Owner logged in, navigating to vehicles");
      } 
      else {
        console.log("User logged in, navigating to vehicles");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-teal-900/10 border border-white overflow-hidden">
        
        {/* Top Accent Bar */}
        <div className="h-2 bg-teal-600 w-full"></div>

        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Welcome <span className="text-teal-600">Back</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2">Login to manage your rentals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <FaEnvelope size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <FaLock size={18} />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Error Message Box */}
            {message && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <p className="text-xs font-bold text-red-600">
                  {message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black tracking-wide shadow-xl transition-all transform active:scale-[0.98] ${
                loading 
                ? "bg-slate-400 cursor-not-allowed shadow-none" 
                : "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Login</span>
                  <FaArrowRight size={14} />
                </>
              )}
            </button>

            {/* Register Link Area */}
            <div className="pt-6 text-center border-t border-slate-50">
              <p className="text-slate-500 text-sm font-medium">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-teal-600 font-black hover:text-teal-800 transition-colors ml-1 focus:outline-none underline decoration-2 underline-offset-4"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;