import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomePages from "../components/HomePages";
import { useData } from "../context/DataContext";

import "../index.css";

export default function Home() {
  const { isAuthenticated, role, loading } = useData();
  const navigate = useNavigate();
  const contactRef = useRef(null);

  useEffect(() => {
    if (!loading && isAuthenticated && String(role).toLowerCase() === "admin") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, role, loading, navigate]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white bg-opacity-80 backdrop-blur-md shadow-md">
        <Navbar contactRef={contactRef} />
      </div>

      <div className="pb-10">
        <HomePages />
      </div>

      <div className="bottom-0 pb-6 left-0 w-full bg-[#101828] shadow z-10">
        <Footer contactRef={contactRef} />
      </div>
    </>
  );
}