import {
  useNavigate,
} from "react-router-dom";

import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  FaCar,
  FaUserAlt,
  FaTag,
  FaArrowRight,
} from "react-icons/fa";

import { DataContext } from "../context/DataContext";
import { assetUrl } from "../api/api";

function HomePages() {

  const navigate = useNavigate();

  // ================= CONTEXT =================
  const {
    isAuthenticated,
    role,
    approvedVehicles,
    fetchApprovedVehicles,
  } = useContext(DataContext);



  // ================= FETCH VEHICLES =================
  useEffect(() => {

    fetchApprovedVehicles();

  }, []);

  // ================= RANDOM HERO VEHICLES =================
  const shuffledVehicles = [...approvedVehicles]
    .sort(() => 0.5 - Math.random());

  let heroVehicles =
    shuffledVehicles.slice(0, 5);

  // Repeat if less than 5
  while (
    heroVehicles.length < 5 &&
    approvedVehicles.length > 0
  ) {

    heroVehicles.push(
      approvedVehicles[
        heroVehicles.length %
        approvedVehicles.length
      ]
    );

  }

  // Infinite slider
  const sliderVehicles = [
    ...heroVehicles,
    ...heroVehicles,
  ];


  // ================= ROLE ACTION =================
  const handlePrimaryAction = () => {

    if (
      role === "owner" &&
      isAuthenticated
    ) {

      navigate("/owner/vehicles");

      return;

    }

    navigate("/");

  };

  // ================= BUTTON TEXT =================
  const getButtonText = () => {

    if (
      isAuthenticated &&
      role === "owner"
    ) {

      return "Upload Your Vehicle";

    }

    return "Book Your Ride";

  };

  return (

    <div className="overflow-x-hidden w-full bg-slate-50">

      

      {/* ================= HERO SLIDER ================= */}
      <div className="relative z-10 overflow-hidden pt-2 pb-10 md:pb-14 bg-gradient-to-b from-slate-950 via-slate-900 to-black">

        {/* HEADING */}
        <div className="text-center mb-10 px-4">

          <p className="text-slate-400 font-medium">

            Explore Vehicles

          </p>

          <h1 className="text-3xl md:text-5xl font-black text-white mt-3">

            Ride Any Vehicle

          </h1>

        </div>

        {/* SLIDER */}
        <div className="flex gap-6 animate-scroll whitespace-nowrap px-4">

          {sliderVehicles.map((vehicle, index) => (

            <div
              key={`${vehicle.vehicle_id}-${index}`}
              className="relative min-w-[280px] sm:min-w-[320px] md:min-w-[360px] h-[430px] rounded-[2rem] overflow-hidden shadow-2xl group border border-white/10"
            >

              {/* IMAGE */}
              <img
                src={assetUrl(vehicle.image_url)}
                alt={vehicle.brand}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* VERIFIED */}
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg">

                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">

                  Verified

                </span>

              </div>

              {/* CONTENT */}
              <div className="absolute bottom-0 p-6 w-full">

                <h2 className="text-white text-3xl font-black">

                  {vehicle.brand}

                </h2>

                <p className="text-blue-300 text-sm uppercase tracking-widest font-bold mt-1">

                  {vehicle.model_name}

                </p>

                <div className="mt-5 flex items-center justify-between">

                  <div>

                    <p className="text-zinc-300 text-xs uppercase tracking-widest font-bold">

                      Starting At

                    </p>

                    <p className="text-white text-2xl font-black">

                      ₹{vehicle.price_per_day}

                      <span className="text-sm text-zinc-300 font-medium">

                        /day

                      </span>

                    </p>

                  </div>

                  <button
                    onClick={() => {

                      if (!isAuthenticated) {

                        alert(
                          "Please login first"
                        );

                        navigate(
                          "/user-login"
                        );

                        return;

                      }

                      navigate(
                        `/vehicles/${vehicle.vehicle_id}`
                      );

                    }}
                    className="px-5 py-3 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all"
                  >

                    Rent Now

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* SCROLL CSS */}
        <style>
          {`
            @keyframes scroll {

              0% {
                transform: translateX(0);
              }

              100% {
                transform: translateX(-50%);
              }

            }

            .animate-scroll {
              animation: scroll 35s linear infinite;
              width: max-content;
            }
          `}
        </style>

      </div>


      {/* ================= VEHICLE GRID ================= */}
      <div className="bg-slate-50 py-14">

        <div className="max-w-7xl mx-auto px-4">

          {/* EMPTY */}
          {approvedVehicles.length === 0 ? (

            <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[3rem] text-center max-w-2xl mx-auto">

              <FaCar
                className="text-slate-200 mx-auto mb-4"
                size={64}
              />

              <h2 className="text-xl font-bold text-slate-800">

                No matches found

              </h2>

              <p className="text-slate-500 mt-2">

                Try adjusting your filters.

              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

              {approvedVehicles.map((vehicle) => (

                <div
                  key={vehicle.vehicle_id}
                  className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 transform md:hover:-translate-y-2"
                >

                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">

                    <img
                      src={assetUrl(vehicle.image_url)}
                      alt={vehicle.brand}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-100 shadow-sm">

                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">

                        Verified

                      </p>

                    </div>

                  </div>

                  {/* INFO */}
                  <div className="p-6 flex-1 flex flex-col">

                    <h2 className="text-xl font-black text-slate-800 leading-tight">

                      {vehicle.brand}

                      <span className="text-blue-600 font-bold block text-sm uppercase tracking-tighter">

                        {vehicle.model_name}

                      </span>

                    </h2>

                    <div className="mt-4 space-y-3 flex-1">

                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tighter">

                        <FaTag className="text-slate-300" />

                        <span>
                          {vehicle.vehicle_number}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">

                        <FaUserAlt className="text-slate-300" />

                        <span>

                          Host:

                          <span className="text-slate-700 font-bold">

                            {" "}
                            {vehicle.owner_name}

                          </span>

                        </span>

                      </div>

                    </div>

                    {/* PRICE */}
                    <div className="mt-6 pt-5 border-t border-slate-50">

                      <div className="flex justify-between items-end mb-4">

                        <div>

                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">

                            Starting at

                          </p>

                          <p className="text-2xl font-black text-slate-900">

                            ₹{vehicle.price_per_day}

                            <span className="text-xs text-slate-400 font-medium">

                              /day

                            </span>

                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() => {

                          if (!isAuthenticated) {

                            alert(
                              "Please login first"
                            );

                            navigate(
                              "/user-login"
                            );

                            return;

                          }

                          navigate(
                            `/vehicles/${vehicle.vehicle_id}`
                          );

                        }}
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                      >

                        Book Now

                        <FaArrowRight
                          size={12}
                        />

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default HomePages;