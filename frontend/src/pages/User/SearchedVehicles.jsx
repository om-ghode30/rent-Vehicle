import {
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowRight,
  FaCar,
  FaSlidersH,
} from "react-icons/fa";

import Navbar from "../../components/Navbar";

import {
  DataContext,
} from "../../context/DataContext";

import {
  assetUrl,
} from "../../api/api";

export default function SearchedVehicles() {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    approvedVehicles,
    fetchApprovedVehicles,
    isAuthenticated,
  } = useContext(DataContext);

  const searchParams =
    new URLSearchParams(
      location.search
    );

  const query =
    searchParams
      .get("search")
      ?.toLowerCase() || "";

      const [sortBy, setSortBy] =
  useState("");

const [maxPrice, setMaxPrice] =
  useState(5000);

  useEffect(() => {

    fetchApprovedVehicles();

  }, []);

  const filteredVehicles =
  useMemo(() => {

    let filtered =
      approvedVehicles.filter(
        (v) => {

          const matchSearch =

            v.brand
              .toLowerCase()
              .includes(query) ||

            v.model_name
              .toLowerCase()
              .includes(query);

          const matchPrice =

            Number(
              v.price_per_day
            ) <= Number(maxPrice);

          return (
            matchSearch &&
            matchPrice
          );

        }
      );

    // SORTING
    if (sortBy === "lowToHigh") {

      filtered.sort(
        (a, b) =>
          Number(a.price_per_day) -
          Number(b.price_per_day)
      );

    }

    if (sortBy === "highToLow") {

      filtered.sort(
        (a, b) =>
          Number(b.price_per_day) -
          Number(a.price_per_day)
      );

    }

    return filtered;

  }, [
    approvedVehicles,
    query,
    sortBy,
    maxPrice,
  ]);

  return (

    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <div className="max-w-7xl mx-auto">

        <div className="mb-4">

          <p className="text-slate-500 mt-2">

            Showing results for:

            <span className="font-bold text-blue-600">

              {" "} {query}

            </span>

          </p>

        </div>

{/* COMPACT FILTER BAR */}
<div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-8">

  <div className="flex flex-col md:flex-row md:items-center gap-4">

    {/* FILTER TITLE */}
    <div className="flex items-center gap-2 shrink-0">

      <FaSlidersH className="text-blue-600 text-sm" />

      <h2 className="text-sm font-black text-slate-800">

        Filters

      </h2>

    </div>

    {/* SORT */}
    <div className="flex items-center gap-3 w-full md:w-auto">

      <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">

        Sort

      </label>

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none min-w-[170px]"
      >

        <option value="">
          Default
        </option>

        <option value="lowToHigh">
          Price: Low → High
        </option>

        <option value="highToLow">
          Price: High → Low
        </option>

      </select>

    </div>

    {/* PRICE */}
    <div className="flex-1">

      <div className="flex justify-between items-center mb-1">

        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">

          Max Price

        </label>

        <span className="text-sm font-black text-blue-600">

          ₹{maxPrice}

        </span>

      </div>

      <input
        type="range"
        min="500"
        max="5000"
        step="100"
        value={maxPrice}
        onChange={(e) =>
          setMaxPrice(
            e.target.value
          )
        }
        className="w-full accent-blue-600 h-2"
      />

    </div>

  </div>

</div>

        {filteredVehicles.length === 0 ? (

          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">

            <FaCar
              size={60}
              className="mx-auto text-slate-200 mb-5"
            />

            <h2 className="text-2xl font-black text-slate-700">

              No Vehicles Found

            </h2>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

            {filteredVehicles.map(
              (vehicle) => (

                <div
                  key={
                    vehicle.vehicle_id
                  }
                  className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm"
                >

                  <img
                    src={assetUrl(
                      vehicle.image_url
                    )}
                    alt={vehicle.brand}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">

                    <h2 className="text-xl font-black text-slate-800">

                      {vehicle.brand}

                    </h2>

                    <p className="text-blue-600 font-bold uppercase text-sm">

                      {vehicle.model_name}

                    </p>

                    <div className="mt-5 flex justify-between items-center">

                      <div>

                        <p className="text-xs text-slate-400 font-bold uppercase">

                          Price

                        </p>

                        <p className="text-2xl font-black">

                          ₹{
                            vehicle.price_per_day
                          }

                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() => {

                        if (
                          !isAuthenticated
                        ) {

                          navigate(
                            "/user-login"
                          );

                          return;

                        }

                        navigate(
                          `/vehicles/${vehicle.vehicle_id}`
                        );

                      }}
                      className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3"
                    >

                      Book Now

                      <FaArrowRight />

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}