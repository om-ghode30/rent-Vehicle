import { createContext, useContext, useState, useEffect } from "react";
import { login as loginAPI } from "../api/api";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 simulate session check (later connect real API)
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginAPI({ email, password });

    console.log("LOGIN RESPONSE:", res.data);

    if (res.data.success) {
      const userData = {
  role: res.data.role?.toLowerCase(),
  token: res.data.token, // 🔥 IMPORTANT
  isLoggedIn: true,
};
console.log("TOKEN FROM LOGIN:", res.data.token);

setUser(userData);
return userData;

    } else {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);