import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios"; // 🔥 ADD THIS LINE

import {
  getApprovedVehicles,
  getVehicleDetailsPublic,
  getMyBookings as apiGetMyBookings,
  cancelBooking as apiCancelBooking,
} from "../api/api";

const BASE_URL =
  "https://55f5-2409-40c2-100d-5b-6409-ce33-fd08-9cca.ngrok-free.app";

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth(); // 🔥 get token from AuthContext

  // ================= VEHICLES =================

  const fetchApprovedVehicles = async () => {
    const res = await getApprovedVehicles();
    return res.data?.data || [];
  };

  const getVehicleDetails = async (id: any) => {
    const res = await getVehicleDetailsPublic(id);
    return res.data?.data || null;
  };

  // ================= BOOKINGS =================
const createBooking = async (formData: any) => {
  try {
    console.log("USER OBJECT:", user);
console.log("TOKEN USED:", user?.token);
    // console.log("TOKEN:", user?.token); // 🔍 debug

    const res = await axios.post(
      `${BASE_URL}/api/booking`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`, // 🔥 FIX
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("BOOKING RESPONSE:", res.data);

    return res.data;
  } catch (error: any) {
    console.log("AXIOS ERROR:", error.response?.data || error.message);

    return error.response?.data || {
      success: false,
      message: "Booking failed",
    };
  }
};

const fetchMyBookings = async () => {
  try {
    console.log("USER OBJECT:", user);
    console.log("TOKEN USED:", user?.token);

    const response = await fetch(`${BASE_URL}/api/booking/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();

    console.log("BOOKINGS RESPONSE:", data);

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.log("FETCH BOOKINGS ERROR:", error);
    throw error;
  }
};

const cancelBooking = async (id: number) => {
  try {
    console.log("CANCEL TOKEN:", user?.token);

    const response = await fetch(`${BASE_URL}/api/booking/${id}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();

    console.log("CANCEL RESPONSE:", data);

    return data;
  } catch (error) {
    console.log("CANCEL ERROR:", error);
    throw error;
  }
};

  return (
    <DataContext.Provider
      value={{
        fetchApprovedVehicles,
        getVehicleDetails,
        createBooking,
        fetchMyBookings,
        cancelBooking,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used inside DataProvider");
  }
  return context;
};