import axios from "axios";

const API = axios.create({
  baseURL: "https://rent-vehicle-zw86.onrender.com/api",
  withCredentials: true, // 🔥 REQUIRED for cookies
});

// ================= ASSET URL =================
export const assetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = API.defaults?.baseURL
    ? API.defaults.baseURL.replace(/\/api\/?$/, "")
    : "https://rent-vehicle-zw86.onrender.com";

  return `${base}${path}`;
};

// ================= AUTH =================
export const login = (payload) =>
  API.post("/common/login", payload);

export const register = (payload) => {
  if (payload instanceof FormData) {
    return API.post("/common/register", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.post("/common/register", payload);
};

export const checkSession = () =>
  API.get("/common/me");

export const logout = () =>
  API.post("/common/logout");

// ================= CHAT =================
export const sendMessage = (data) =>
  API.post("/chat/send", data);

export const getMessages = (bookingId) =>
  API.get(`/chat/${bookingId}`);

// ================= PUBLIC VEHICLES =================
export const getPublicVehicles = () =>
  API.get("/vehicles/public");

export const getPublicVehicle = (id) =>
  API.get(`/vehicles/public/${id}`);

// ================= OWNER =================
export const addVehicleDetails = (formData) =>
  API.post("/owner/vehicles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const addVehicleImages = (vehicleId, formData) =>
  API.post(`/owner/vehicles/${vehicleId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyVehicles = () =>
  API.get("/owner/vehicles");

export const getOwnerBookings = () =>
  API.get("/owner/bookings");

export const getOwnerBookingDetails = (id) =>
  API.get(`/owner/bookings/${id}`);

export const toggleVehicleAvailability = (id, body) =>
  API.patch(`/owner/vehicles/${id}/availability`, body);

// ================= ADMIN: VEHICLES =================
export const getPendingVehicles = () =>
  API.get("/admin/vehicles/pending");

export const getAdminVehicleById = (id) =>
  API.get(`/admin/vehicles/${id}`);

export const getVehicleDetails = (id) =>
  API.get(`/admin/vehicles/${id}/details`);

export const approveVehicle = (id) =>
  API.patch(`/admin/vehicles/${id}/approve`);

export const rejectVehicle = (id) =>
  API.patch(`/admin/vehicles/${id}/reject`);

export const verifyVehicleApi = (id) =>
  API.patch(`/admin/vehicles/${id}/verify`);

export const verifyRcApi = (id) =>
  API.patch(`/admin/vehicles/${id}/verify-rc`);

export const verifyNocApi = (id) =>
  API.patch(`/admin/vehicles/${id}/verify-noc`);

export const verifyImagesApi = (id) =>
  API.patch(`/admin/vehicles/${id}/verify-images`);

export const activateVehicleApi = (id) =>
  API.patch(`/admin/vehicles/${id}/activate`);

export const getVehicleDocument = (vehicleId, fileName) =>
  API.get(`/admin/vehicles/${vehicleId}/docs/${fileName}`, {
    responseType: "blob",
  });

  // ================= OTP USER AUTH =================
export const sendOTP = (email) =>
  API.post("/user/send-otp", { email });

export const verifyOTP = (payload) =>
  API.post("/user/verify-otp", payload);

export const getBookingUser = () =>
  API.get("/user/me");

export const logoutBookingUser = () =>
  API.post("/user/logout");

// ================= ADMIN: USERS =================
export const getPendingUsers = () =>
  API.get("/admin/users/pending");

export const approveUser = (id) =>
  API.patch(`/admin/users/${id}/approve`);

export const rejectUser = (id) =>
  API.patch(`/admin/users/${id}/reject`);

export const getUserAadhar = (userId) =>
  API.get(`/admin/users/${userId}/docs/aadhar`, {
    responseType: "blob",
  });

export const getOwnerAadhar = (ownerId) =>
  API.get(`/admin/owners/${ownerId}/docs/aadhar`, {
    responseType: "blob",
  });

export const getOwnerDetails = (id) =>
  API.get(`/admin/owners/${id}`);

// ================= ADMIN: STATUS =================
export const toggleUserBlocked = (id, isBlocked) => {
  const action = isBlocked === 1;
  return API.patch(`/admin/users/${id}/status`, { action });
};

export const toggleVehicleBlocked = (id, isBlocked) => {
  const action = isBlocked === 1;
  return API.patch(`/admin/vehicles/${id}/status`, { action });
};

// ================= ADMIN: PAYMENTS =================
export const getPendingPayments = () =>
  API.get("/admin/payments/pending");

export const approvePayment = (id) =>
  API.patch(`/admin/payments/${id}/approve`);

export const syncCompletedPayments = () =>
  API.post("/admin/payments/sync-completed");

// ================= ANALYTICS =================
export const getVehicleAnalytics = () =>
  API.get("/admin/analytics/vehicles");

export const getOwnerAnalytics = () =>
  API.get("/admin/analytics/owners");

export const getUserAnalytics = () =>
  API.get("/admin/analytics/users");

// ================= DETAILS =================
export const getVehicleFullDetails = (id) =>
  API.get(`/admin/vehicles/${id}/details`);

export const getUserFullDetails = (id) =>
  API.get(`/admin/users/${id}/details`);

export const getBooking = (id) =>
  API.get(`/admin/bookings/${id}`);

export const createAdminAccount = (data) =>
  API.post(`/admin/create`, data);

// ================= USER =================
export const getApprovedVehicles = () =>
  API.get("/common/vehicles");

export const getVehicleDetailsPublic = (id) =>
  API.get(`/common/vehicles/${id}`);

// ================= BOOKING =================
// export const createBooking = (formData) =>
//   API.post("/booking", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
export const createBooking = (formData) =>
  API.post("/booking", formData, {
    headers: {
      "Content-Type":
        "multipart/form-data",
    },
  });

export const getMyBookings = () =>
  API.get("/booking/my");

export const cancelBooking = (id) =>
  API.patch(`/booking/${id}/cancel`);

export default API;