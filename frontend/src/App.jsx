import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider, useData } from "./context/DataContext";

import UserLogin from "./pages/Comman/UserLogin";
import UserReg from "./pages/Comman/UserReg";
import Otp from "./pages/Comman/otp";
import Home from "./pages/Home";

import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import PendingVehicles from "./pages/Admin/PendingVehicles";
import UsersManagement from "./pages/Admin/UsersManagement";
import PaymentsManagement from "./pages/Admin/PaymentsManagement";
import Analytics from "./pages/Admin/Analytics";
import VehicleDetails from "./pages/Admin/VehicleDetails";
import OwnerDetails from "./pages/Admin/OwnerDetails";
import UserDetails from "./pages/Admin/UserDetails";
import BookingDetails from "./pages/Admin/BookingDetails";
import VehicleImageView from "./pages/Admin/VehicleImageView";
import OwnerVehicles from "./pages/Owener/OwenerVehicles";
import OwnerVehicleDetails from "./pages/Owener/OwnerVehicleDetails";
import VehicleDetailsPage from "./pages/Owener/VehicleDetailsPage";

function AdminProtected({ children }) {
  const { isAuthenticated, role, loading } = useData();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (String(role).toLowerCase() !== "admin") return <Navigate to="/" replace />;

  return children;
}

function OwnerProtected({ children }) {
  const { isAuthenticated, role, loading } = useData();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (String(role).toLowerCase() !== "owner") return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserReg />} />
        <Route path="/otp" element={<Otp />} />

        {/* Admin protected routes */}
        <Route
          path="/admin/*"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pending-vehicles" element={<PendingVehicles />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="vehicles/:id" element={<VehicleDetails />} />
          <Route path="vehicles/:id/image/:idx" element={<VehicleImageView />} />
          <Route path="owner/:id" element={<OwnerDetails />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="booking/:id" element={<BookingDetails />} />
        </Route>

  {/* Default & 404 */}
  <Route path="/" element={<Home />} />

        {/* Owner routes */}
        <Route path="/owner/vehicles" element={<OwnerProtected><OwnerVehicles /></OwnerProtected>} />
        <Route path="/owner/add-vehicle" element={<OwnerProtected><VehicleDetailsPage /></OwnerProtected>} />
        <Route path="/owner/view-vehicle/:id" element={<OwnerProtected><OwnerVehicleDetails /></OwnerProtected>} />
        <Route path="*" element={<div className="p-20 text-center text-2xl">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppRoutes />
    </DataProvider>
  );
}
