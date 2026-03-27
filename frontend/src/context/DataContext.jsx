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
    await apiLogout();

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
    const res = await apiCreateBooking(formData);

    if (!res.data.success) {
      throw new Error(res.data.message || "Booking failed");
    }

    return res.data;
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
        const res = await checkSession();

        if (res.data.success) {
          const user = res.data.data || res.data.user || res.data;

          if (user && (user.id || user.role || user.name)) {
            setIsAuthenticated(true);
            setRole(user.role ? String(user.role).toLowerCase() : null);
            setName(user.name || null);
          } else {
            setIsAuthenticated(false);
          }
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