import React, {
  useState,
  useContext,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FaEnvelope,
  FaArrowRight,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";

import { DataContext } from "../../context/DataContext";

const UserOTPLogin = () => {

  const navigate = useNavigate();

  const {
    sendOTP,
    verifyOTP,
  } = useContext(DataContext);

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // =========================
  // SEND OTP
  // =========================
  const handleSendOTP = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setMessage("");

      const data = await sendOTP(
        form.email
      );

      setMessage(data.message);

      setStep(2);

    } catch (error) {

      setMessage(
        error.message ||
        "Failed to send OTP"
      );

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // VERIFY OTP
  // =========================
  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setMessage("");

      await verifyOTP({
        email: form.email,
        otp: form.otp,
      });

      navigate("/vehicles");

    } catch (error) {

      setMessage(
        error.message ||
        "OTP verification failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">

        {/* Top Accent */}
        <div className="h-2 bg-blue-600"></div>

        <div className="p-8 md:p-10">

          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
          >
            <FaArrowLeft />
            <span className="text-sm font-semibold">
              Back to Home
            </span>
          </button>

          {/* Logo */}
          <div className="text-center mb-10">

            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 shadow-inner">

              <FaShieldAlt
                className="text-blue-600"
                size={38}
              />

            </div>

            <h1 className="text-4xl font-black text-slate-800 tracking-tight">

              User <span className="text-blue-600">Login</span>

            </h1>

            <p className="text-slate-500 font-medium mt-3 leading-relaxed">

              Secure OTP authentication for
              vehicle booking access

            </p>

          </div>

          {/* ========================= */}
          {/* STEP 1 */}
          {/* ========================= */}
          {step === 1 && (

            <form
              onSubmit={handleSendOTP}
              className="space-y-6"
            >

              {/* Email */}
              <div className="relative group">

                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">

                  <FaEnvelope size={18} />

                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                />

              </div>

              {/* Message */}
              {message && (

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">

                  <p className="text-sm font-bold text-blue-700">

                    {message}

                  </p>

                </div>

              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black tracking-wide shadow-xl transition-all active:scale-[0.98] ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >

                {loading ? (

                  <div className="flex items-center gap-3">

                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

                    <span>Sending OTP...</span>

                  </div>

                ) : (

                  <>
                    <span>Send OTP</span>
                    <FaArrowRight size={14} />
                  </>

                )}

              </button>

            </form>

          )}

          {/* ========================= */}
          {/* STEP 2 */}
          {/* ========================= */}
          {step === 2 && (

            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >

              {/* OTP BOXES */}
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-5 text-center text-2xl tracking-[10px] font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />

              {/* Message */}
              {message && (

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">

                  <p className="text-sm font-bold text-blue-700">

                    {message}

                  </p>

                </div>

              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black tracking-wide shadow-xl transition-all active:scale-[0.98] ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >

                {loading ? (

                  <div className="flex items-center gap-3">

                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

                    <span>Verifying OTP...</span>

                  </div>

                ) : (

                  <>
                    <span>Verify OTP</span>
                    <FaArrowRight size={14} />
                  </>

                )}

              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                Change Email Address
              </button>

            </form>

          )}

        </div>

      </div>

    </div>
  );
};

export default UserOTPLogin;