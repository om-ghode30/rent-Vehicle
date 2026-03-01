import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";

export default function AdminLayout() {
  const { logout } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4 text-sm font-semibold">
          <NavLink to="/admin/dashboard" className="hover:text-blue-600">
            Dashboard
          </NavLink>

          <NavLink to="/admin/pending-vehicles" className="hover:text-blue-600">
            Vehicles
          </NavLink>

          <NavLink to="/admin/users" className="hover:text-blue-600">
            Users
          </NavLink>

          <NavLink to="/admin/payments" className="hover:text-blue-600">
            Payments
          </NavLink>

          <NavLink to="/admin/analytics" className="hover:text-blue-600">
            Analytics
          </NavLink>

          <button
            onClick={handleLogout}
            className="text-red-600 mt-10 text-left"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
}