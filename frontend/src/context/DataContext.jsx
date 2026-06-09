import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";

import {
  getPendingVehicles,
  getPendingUsers,
  getPendingPayments,
  login as apiLogin,
  register as apiRegister,
  checkSession,
  logout as apiLogout,
  sendOTP as apiSendOTP,
verifyOTP as apiVerifyOTP,
getBookingUser,
logoutBookingUser,

  // ❌ OTP removed from usage (but kept import safe if backend still has it)
  sendMessage as apiSendMessage,
  getMessages as apiGetMessages,
} from "../api/api";

import {
  getApprovedVehicles,
  getVehicleDetailsPublic,
  createBooking as apiCreateBooking,
  getMyBookings as apiGetMyBookings,
  cancelBooking as apiCancelBooking,
} from "../api/api";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // ================= AUTH STATE =================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= ADMIN DATA =================
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  // ================= USER DATA =================
  const [approvedVehicles, setApprovedVehicles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // ================= LOGIN =================
  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password });

    if (!res.data.success) {
      throw new Error(res.data.message || "Login failed");
    }

    setIsAuthenticated(true);
    setRole(res.data.role?.toLowerCase() || null);
    setName(res.data.name || null);

    return res.data;
  };

  // ================= REGISTER =================
const register = async (formData) => {
  try {
    const res = await apiRegister(formData);
    return res.data;
  } catch (error) {
    console.log("FULL ERROR:", error.response); // 🔥 ADD THIS
    throw error.response?.data || { message: "Registration failed" };
  }
};

  const registerOwnerAccount = async (formData) => {
    const res = await apiRegister(formData);

    if (!res.data.success) {
      throw new Error(res.data.message || "Registration failed");
    }

    return res.data;
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {

  await apiLogout();

} catch {}

try {

  await logoutBookingUser();

} catch {}

    setIsAuthenticated(false);
    setRole(null);
    setName(null);
  };

  // ================= FETCH ADMIN DATA =================
  const fetchVehicles = useCallback(async () => {
    try {
      const res = await getPendingVehicles();
      setVehicles(res.data?.data || []);
    } catch (err) {
      console.error("Vehicles fetch error:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getPendingUsers();
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await getPendingPayments();
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error("Payments fetch error:", err);
    }
  }, []);

  // ================= OTP LOGIN =================
const sendOTP = async (email) => {

  const res = await apiSendOTP(email);

  if (!res.data.success) {
    throw new Error(
      res.data.message || "OTP send failed"
    );
  }

  return res.data;
};

const verifyOTP = async ({ email, otp }) => {

  const res = await apiVerifyOTP({
    email,
    otp,
  });

  if (!res.data.success) {
    throw new Error(
      res.data.message || "OTP verification failed"
    );
  }

  // 🔥 IMPORTANT
  setIsAuthenticated(true);

  setRole("user");

  setName(email);

  return res.data;
};

  // ================= USER FEATURES =================
  const fetchApprovedVehicles = async () => {
    try {
      const res = await getApprovedVehicles();
      setApprovedVehicles(res.data?.data || []);
    } catch (error) {
      console.error("Vehicle fetch error:", error);
    }
  };

  const getVehicleDetails = async (id) => {
    try {
      const res = await getVehicleDetailsPublic(id);
      return res.data?.data;
    } catch (error) {
      console.error("Vehicle details error:", error);
      return null;
    }
  };

const createBooking = async (formData) => {
  try {
    const res = await apiCreateBooking(formData);
    return res.data;
  } catch (err) {
    console.log("BOOKING ERROR:", err.response?.data); // 🔥 DEBUG

    throw new Error(
      err.response?.data?.message || "Booking failed"
    );
  }
};

  const fetchMyBookings = async () => {
    try {
      const res = await apiGetMyBookings();
      setMyBookings(res.data?.data || []);
    } catch (error) {
      console.error("Bookings fetch error:", error);
    }
  };

  const cancelBooking = async (id) => {
    const res = await apiCancelBooking(id);

    if (!res.data.success) {
      throw new Error(res.data.message || "Cancel failed");
    }

    return res.data;
  };

  // ================= CHAT =================
  const sendChatMessage = async (payload) => {
    const res = await apiSendMessage(payload);
    return res.data;
  };

  const fetchChatMessages = async (bookingId) => {
    const res = await apiGetMessages(bookingId);
    return res.data?.data || [];
  };

  // ================= SESSION CHECK =================
useEffect(() => {

  const verifySession = async () => {

    try {

      // =========================
      // ADMIN / OWNER LOGIN
      // =========================
      const res = await checkSession();

      if (res.data.success) {

        const user =
          res.data.data ||
          res.data.user ||
          res.data;

        setIsAuthenticated(true);

        setRole(
          user.role
            ? String(user.role).toLowerCase()
            : null
        );

        setName(user.name || null);

        setLoading(false);

        return;
      }

    } catch (error) {

      console.log("Normal auth not found");

    }

    // =========================
    // OTP USER LOGIN
    // =========================
    try {

      const bookingRes =
        await getBookingUser();

      if (bookingRes.data.success) {

        setIsAuthenticated(true);

        setRole("user");

        setName(
          bookingRes.data.data?.email
        );

      } else {

        setIsAuthenticated(false);

      }

    } catch (error) {

      setIsAuthenticated(false);

    } finally {

      setLoading(false);

    }

  };

  verifySession();

}, []);

  return (
    <DataContext.Provider
      value={{
        // AUTH
        isAuthenticated,
        role,
        name,
        loading,
        login,
        logout,
        register,
        registerOwnerAccount,

        // ADMIN
        vehicles,
        users,
        payments,
        fetchVehicles,
        fetchUsers,
        fetchPayments,
        setVehicles,
        setUsers,
        setPayments,

        // USER
        approvedVehicles,
        myBookings,
        fetchApprovedVehicles,
        getVehicleDetails,
        createBooking,
        fetchMyBookings,
        cancelBooking,

        // CHAT
        sendChatMessage,
        fetchChatMessages,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// ================= CUSTOM HOOK =================
export const useData = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }

  return context;
};