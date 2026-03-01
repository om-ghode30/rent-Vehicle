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

  // ================= LOGIN =================
  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password });

    if (!res.data.success) {
      throw new Error(res.data.message || "Login failed");
    }

    // Backend returns role & name (cookie already set)
    setIsAuthenticated(true);
    setRole(res.data.role?.toLowerCase() || null);
    setName(res.data.name || null);

    return res.data;
  };

  // ================= REGISTER =================
  const register = async (formData) => {
    const res = await apiRegister(formData);
    return res.data;
  };

  const registerOwnerAccount = async (formData) => {
    return await apiRegister(formData);
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

  // ================= SESSION CHECK ON REFRESH =================
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await checkSession();

        if (res.data.success) {
          // Backend returns the current user under `data`.
          // Accept several shapes to be resilient (data.user, data.data, data)
          const user = res.data.data || res.data.user || res.data;

          if (user && (user.id || user.role || user.name)) {
            setIsAuthenticated(true);
            setRole(user.role ? String(user.role).toLowerCase() : null);
            setName(user.name || null);
          } else {
            // unexpected shape, treat as not authenticated
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
        isAuthenticated,
        role,
        name,
        loading,
        login,
        logout,
        register,
        registerOwnerAccount,
        vehicles,
        users,
        payments,
        fetchVehicles,
        fetchUsers,
        fetchPayments,
        setVehicles,
        setUsers,
        setPayments,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};