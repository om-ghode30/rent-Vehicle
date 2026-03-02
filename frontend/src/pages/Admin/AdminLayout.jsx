import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useState } from "react";
// Replaced FaLayout with FaThLarge to fix the export error
import { FaBars, FaTimes, FaThLarge, FaCar, FaUsers, FaCreditCard, FaChartBar, FaSignOutAlt } from "react-icons/fa";

export default function AdminLayout() {
  const { logout } = useData();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinkClasses = ({ isActive }) => 
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      isActive 
      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
        <h2 className="text-xl font-black text-blue-600 tracking-tighter">ADMIN PANEL</h2>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-slate-600 bg-slate-100 rounded-lg"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-slate-200 p-6 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-blue-600 tracking-tighter">
            ADMIN PANEL
          </h2>
          <button className="lg:hidden text-slate-400" onClick={toggleSidebar}>
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 text-sm font-bold">
          {/* Using FaThLarge here */}
          <NavLink to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
            <FaThLarge size={18} /> Dashboard
          </NavLink>

          <NavLink to="/admin/pending-vehicles" onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
            <FaCar size={18} /> Vehicles
          </NavLink>

          <NavLink to="/admin/users" onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
            <FaUsers size={18} /> Users
          </NavLink>

          <NavLink to="/admin/payments" onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
            <FaCreditCard size={18} /> Payments
          </NavLink>

          <NavLink to="/admin/analytics" onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
            <FaChartBar size={18} /> Analytics
          </NavLink>

          <div className="mt-auto pt-10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
            >
              <FaSignOutAlt size={18} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}