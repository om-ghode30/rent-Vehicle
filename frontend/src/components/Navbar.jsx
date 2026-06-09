import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import {
  FaBars,
  FaTimes,
  FaCarSide,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

const Navbar = ({ contactRef }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] =
  useState("");

  // ✅ USE role (NOT user)
  const { isAuthenticated, role, logout } = useContext(DataContext);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      alert("Logout successfully");
      navigate("/");
    } catch {
      alert("Logout failed");
    }
  };

  const scrollToContact = () => {
    if (contactRef?.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  const handleSearch = (e) => {

  e.preventDefault();

  if (!search.trim()) return;

  navigate(
    `/vehicles?search=${search}`
  );

  setOpen(false);

};

  const navLinkStyles = "relative font-medium text-slate-600 hover:text-blue-600 transition-colors duration-300 py-2";

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <FaCarSide className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
              Rent<span className="text-blue-600">Car</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-8 items-center">
            {/* SEARCH BAR */}
{role !== "owner" &&
 role !== "admin" && (

  <form
    onSubmit={handleSearch}
    className="hidden lg:flex items-center bg-slate-100 rounded-2xl overflow-hidden border border-slate-200"
  >

    <input
      type="text"
      placeholder="Search vehicles..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="bg-transparent px-4 py-2 outline-none text-sm w-52"
    />

    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 transition-all"
    >

      <FaSearch />

    </button>

  </form>

)}
          {/* HOME LINK */}
{role !== "owner" && (
  <li>
    <Link
      to="/"
      className={navLinkStyles}
    >
      Home
    </Link>
  </li>
)}

            {contactRef && (
              <li>
                <button onClick={scrollToContact} className={navLinkStyles}>
                  Contact
                </button>
              </li>
            )}

            {/* ✅ OWNER ONLY LINKS */}
            {isAuthenticated && role === "owner" && (
              <>
                <li>
                  <Link to="/owner/vehicles" className={navLinkStyles}>Vehicles</Link>
                </li>
                <li>
                  <Link to="/owner/bookings" className={navLinkStyles}>Bookings</Link>
                </li>
              </>
            )}

            {/* USER LINKS */}
{/* USER LINKS */}
{isAuthenticated && role === "user" && (
  <>
    <li>
      <Link to="/my-bookings" className={navLinkStyles}>
        My Bookings
      </Link>
    </li>
  </>
)}

            <div className="h-6 w-[1px] bg-slate-200 mx-2" />

            {/* AUTH BUTTONS */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <FaUserCircle className="text-lg" />
                  <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-50 text-rose-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/user-login">
                  <button className="text-slate-700 font-bold px-4 py-2 hover:text-blue-600 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </ul>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-x-0 top-20 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="p-6 space-y-4">
          {/* MOBILE SEARCH */}
{role !== "owner" &&
 role !== "admin" && (

  <form
    onSubmit={handleSearch}
    className="flex items-center bg-slate-100 rounded-2xl overflow-hidden border border-slate-200"
  >

    <input
      type="text"
      placeholder="Search vehicles..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="flex-1 bg-transparent px-4 py-4 outline-none text-sm"
    />

    <button
      type="submit"
      className="bg-blue-600 text-white px-5 py-4"
    >

      <FaSearch />

    </button>

  </form>

)}
          {/* MOBILE HOME LINK */}
{role !== "owner" && (
  <li>
    <Link
      to="/"
      className="block text-lg font-semibold text-slate-700 p-3 hover:bg-blue-50 rounded-xl transition-colors"
    >
      Home
    </Link>
  </li>
)}

          {contactRef && (
            <li>
              <button onClick={scrollToContact} className="w-full text-left text-lg font-semibold text-slate-700 p-3 hover:bg-blue-50 rounded-xl transition-colors">
                Contact
              </button>
            </li>
          )}

          {isAuthenticated && role === "owner" && (
            <div className="pt-2 space-y-4 border-t border-slate-50">
              <li>
                <Link to="/owner/vehicles" className="block text-lg font-semibold text-slate-700 p-3 hover:bg-blue-50 rounded-xl transition-colors">
                  My Vehicles
                </Link>
              </li>
              <li>
                <Link to="/owner/bookings" className="block text-lg font-semibold text-slate-700 p-3 hover:bg-blue-50 rounded-xl transition-colors">
                  My Bookings
                </Link>
              </li>
            </div>
          )}

          {isAuthenticated && role === "user" && (
  <div className="pt-2 space-y-4 border-t border-slate-50">

    <li>
      <Link
        to="/my-bookings"
        className="block text-lg font-semibold text-slate-700 p-3 hover:bg-blue-50 rounded-xl transition-colors"
      >
        My Bookings
      </Link>
    </li>
  </div>
)}

          <div className="pt-4 border-t border-slate-50">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all"
              >
                Logout Account
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/user-login" className="w-full">
                  <button className="w-full bg-slate-50 text-slate-700 border border-slate-200 py-4 rounded-2xl font-bold active:scale-95 transition-all">
                    Login
                  </button>
                </Link>
                <Link to="/register" className="w-full">
                  <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all">
                    Create Account
                  </button>
                </Link>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;