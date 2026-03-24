import axios from "axios";

// 🔥 CHANGE THIS BASE URL WHEN NEEDED
// const BASE_URL = "http://172.26.192.1:5000";
const BASE_URL = "https://b44b-2409-40c2-12a8-d59d-352f-189a-3b28-70a4.ngrok-free.app";
// const BASE_URL = "http://localhost:5000";
// Axios instance
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: false, // mobile → no cookies
  timeout: 10000,
   headers: {
    "ngrok-skip-browser-warning": "true", // ✅ IMPORTANT
  },
});
export const setAuthToken = (token: string) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// ============================================
// 🔥 IMAGE HELPERS (VERY IMPORTANT)
// ============================================

// 👉 For vehicle images (your backend route)
export const getOwnerVehicleImageUrl = (vehicleId:any, imageName:any) => {
  return `${BASE_URL}/api/owner/vehicles/${vehicleId}/${imageName}`;
};

export const getLicenseUrl = (bookingId: number) => {
  return `${BASE_URL}/api/owner/bookings/${bookingId}/license`;
};

export const getAadharUrl = (bookingId: number) => {
  return `${BASE_URL}/api/owner/bookings/${bookingId}/aadhar`;
};
export const getOwnerVehicleDetails = (id: number) =>
  API.get(`/owner/vehicles/${id}`);
export const deleteVehicle = (id: number) =>
  API.delete(`/owner/vehicles/${id}`);
export const getOwnerBookingDetails = (id: number) =>
  API.get(`/owner/bookings/${id}`);

// 👉 Generic asset handler (fallback)
export const assetUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

// ============================================
// AUTH
// ============================================

export const login = (data: any) =>
  API.post("/common/login", data);

export const register = (data: any) =>
  API.post("/common/register", data);

export const checkSession = () =>
  API.get("/common/me");

export const logout = () =>
  API.post("/common/logout");

// ============================================
// OTP
// ============================================

export const sendOtp = (email: string) =>
  API.post("/common/send-otp", { email });

export const verifyOtp = (data: any) =>
  API.post("/common/verify-otp", data);

// ============================================
// CHAT
// ============================================

export const sendMessage = (data: any) =>
  API.post("/chat/send", data);

export const getMessages = (bookingId: number) =>
  API.get(`/chat/${bookingId}`);

// ============================================
// 🔥 PUBLIC VEHICLES (FIXED ROUTES)
// ============================================

// ❌ OLD: /public/vehicles
// ✅ NEW:
export const getPublicVehicles = () =>
  API.get("/common/vehicles");

export const getPublicVehicle = (id: any) =>
  API.get(`/common/vehicles/${id}`);

// ============================================
// USER VEHICLES
// ============================================

export const getApprovedVehicles = () =>
  API.get("/common/vehicles");

export const getVehicleDetailsPublic = (id: any) =>
  API.get(`/common/vehicles/${id}`);

// ============================================
// BOOKINGS
// ============================================

export const createBooking = (formData: any) =>
  API.post("/booking", formData);

export const getMyBookings = () =>
  API.get("/booking/my");

export const cancelBooking = (id: number) =>
  API.patch(`/booking/${id}/cancel`);

// ============================================
// OWNER
// ============================================

export const addVehicleDetails = (formData: any) =>
  API.post("/owner/vehicles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyVehicles = () =>
  API.get("/owner/vehicles");

export const getOwnerBookings = () =>
  API.get("/owner/bookings");

export const toggleVehicleAvailability = (id: number, body: any) =>
  API.patch(`/owner/vehicles/${id}/availability`, body);

// ============================================
// ADMIN
// ============================================

export const getPendingVehicles = () =>
  API.get("/admin/vehicles/pending");

export const approveVehicle = (id: number) =>
  API.patch(`/admin/vehicles/${id}/approve`);

export const rejectVehicle = (id: number) =>
  API.patch(`/admin/vehicles/${id}/reject`);

export default API;