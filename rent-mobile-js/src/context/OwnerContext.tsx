import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const BASE_URL = "YOUR_URL";

const OwnerContext = createContext<any>(null);

export const OwnerProvider = ({ children }: any) => {
  const { user } = useAuth();

  const addVehicle = async (formData: any) => {
    const res = await fetch(`${BASE_URL}/api/owner/vehicle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      body: formData,
    });

    return res.json();
  };

  const getMyVehicles = async () => {
    const res = await fetch(`${BASE_URL}/api/owner/vehicles`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    const data = await res.json();
    return data.data || [];
  };

  const getOwnerBookings = async () => {
    const res = await fetch(`${BASE_URL}/api/owner/bookings`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    const data = await res.json();
    return data.data || [];
  };

  const getBookingDetails = async (id: any) => {
    const res = await fetch(`${BASE_URL}/api/owner/booking/${id}`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });

    const data = await res.json();
    return data.data;
  };

  return (
    <OwnerContext.Provider
      value={{
        addVehicle,
        getMyVehicles,
        getOwnerBookings,
        getBookingDetails,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => useContext(OwnerContext);