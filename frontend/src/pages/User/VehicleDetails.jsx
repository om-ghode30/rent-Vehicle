import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import api, { assetUrl } from "../../api/api";
import Navbar from "../../components/Navbar";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCar,
  FaUser,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaFileImage,
  FaExternalLinkAlt
} from "react-icons/fa";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getVehicleDetails, createBooking } = useData();

  const [driverName, setDriverName] = useState("");

  const [currentImage, setCurrentImage] = useState(0);
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);

const [pickupDatetime, setPickupDatetime] =
  useState(() => {
    const now = new Date();
    const offset =
      now.getTimezoneOffset();

    return new Date(
      now.getTime() -
        offset * 60000
    )
      .toISOString()
      .slice(0, 16);
  });
  const [dropDatetime, setDropDatetime] =
  useState("");

const [bookingType, setBookingType] =
  useState("DAILY");

const [days, setDays] =
  useState(1);

const [license, setLicense] =
  useState(null);

const [aadhar, setAadhar] =
  useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityDates, setAvailabilityDates] =
  useState([]);

  useEffect(() => {
    const loadVehicle = async () => {
      const data = await getVehicleDetails(id);
      setVehicleData(data);

      const availabilityRes =
  await api.get(
    `/booking/vehicles/${id}/availability`
  );

setAvailabilityDates(
  availabilityRes.data.data
);
      setLoading(false);
    };
    loadVehicle();
  }, [id]);

  useEffect(() => {

  if (!pickupDatetime) {

    setDropDatetime("");

    return;

  }

  const pickup =
    new Date(pickupDatetime);

  let drop =
    new Date(pickup);

  // HOURLY
  if (bookingType === "HOURLY") {

    drop.setHours(
      drop.getHours() + 8
    );

  }

  // DAILY
  else {

    drop.setDate(
      drop.getDate() + Number(days)
    );

  }

  setDropDatetime(drop);

}, [
  pickupDatetime,
  bookingType,
  days
]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (
  !pickupDatetime ||
  !driverName ||
  !license ||
  !aadhar
) {

  alert(
    "Please fill all fields"
  );

  return;

}

if (
  bookingType === "DAILY" &&
  (!days || Number(days) < 1)
) {

  alert("Enter valid days");

  return;

}

    try {
      setBookingLoading(true);
      const formData = new FormData();
      formData.append(
  "vehicle_id",
  id
);

formData.append(
  "booking_type",
  bookingType
);

formData.append(
  "pickup_datetime",
  pickupDatetime
);

formData.append(
  "driver_name",
  driverName
);

formData.append(
  "license",
  license
);

formData.append(
  "aadhar",
  aadhar
);

if (bookingType === "DAILY") {

  formData.append(
    "days",
    days
  );

}

      const res = await createBooking(formData);
      if (res.success) {
        alert("Booking successful!");
        navigate("/my-bookings");
      } else {
        alert(res.message || "Booking failed");
      }
    } catch (error) {
      alert(error.message); 
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!vehicleData)
    return <div className="p-10 text-center text-red-500 font-bold">Vehicle not found</div>;

  const { vehicle, owner, images } = vehicleData;

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden"> {/* FIXED: Added overflow-x-hidden to prevent body scroll */}
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-7 w-full max-w-full overflow-hidden space-y-4"> {/* FIXED: Added w-full max-w-full */}
            <div className="relative group bg-white rounded-3xl md:rounded-[2rem] shadow-xl border-2 border-white overflow-hidden aspect-[4/3] md:aspect-video"> 
              <img
                src={assetUrl(images[currentImage])}
                alt="vehicle main"
                // FIXED: Changed h-[300px] to full and h-full to fit within the responsive parent container
                className="w-full h-full object-contain md:object-cover" 
              />
              
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg z-10"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:p-3 rounded-full shadow-lg z-10"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={assetUrl(img)}
                  alt={`thumbnail ${index}`}
                  onClick={() => setCurrentImage(index)}
                  className={`h-16 w-20 md:h-20 md:w-full flex-shrink-0 object-cover rounded-xl cursor-pointer transition-all border-2 ${
                    currentImage === index ? "border-blue-500 scale-95" : "border-white"
                  }`}
                />
              ))}
            </div>
      {/* VEHICLE DETAILS BLOCK */}

<div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 p-5 mt-4">

  {/* TOP HEADER */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

    <div>

      <div className="flex items-center gap-2 mb-2">

        <FaCar className="text-blue-600 text-sm" />

        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">

          Premium Vehicle

        </p>

      </div>

      <h2 className="text-2xl md:text-3xl font-black text-slate-900">

        {vehicle.brand}

        <span className="text-blue-600">

          {" "} {vehicle.model_name}

        </span>

      </h2>

      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">

        {vehicle.vehicle_number}

      </p>

    </div>

    {/* DYNAMIC ACTIVE PRICE */}
    <div
      className={`rounded-2xl px-5 py-4 min-w-[170px] ${
        bookingType === "HOURLY"
          ? "bg-green-50"
          : "bg-blue-50"
      }`}
    >

      <p
        className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
          bookingType === "HOURLY"
            ? "text-green-500"
            : "text-blue-500"
        }`}
      >

        Active Rental Price

      </p>

      <p
        className={`text-3xl font-black ${
          bookingType === "HOURLY"
            ? "text-green-700"
            : "text-blue-700"
        }`}
      >

        ₹{
          bookingType === "HOURLY"
            ? vehicle.hourly_price
            : vehicle.daily_price
        }

      </p>

      <p
        className={`text-[10px] font-black uppercase mt-1 ${
          bookingType === "HOURLY"
            ? "text-green-500"
            : "text-blue-500"
        }`}
      >

        {
          bookingType === "HOURLY"
            ? "8 Hours"
            : "Per Day"
        }

      </p>

    </div>

  </div>

  {/* SMALL INFO CARDS */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">

    {/* DAILY */}
    <div className="bg-slate-50 rounded-2xl p-3">

      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

        Daily

      </p>

      <p className="text-lg font-black text-blue-600">

        ₹{vehicle.daily_price}

      </p>

    </div>

    {/* HOURLY */}
    <div className="bg-slate-50 rounded-2xl p-3">

      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

        Hourly

      </p>

      <p className="text-lg font-black text-green-600">

        ₹{vehicle.hourly_price}

      </p>

    </div>

    {/* OWNER */}
    <div className="bg-slate-50 rounded-2xl p-3">

      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

        Owner

      </p>

      <p className="text-sm font-black text-slate-700 truncate">

        {owner.name}

      </p>

    </div>

    {/* LOCATION */}
    <div className="bg-slate-50 rounded-2xl p-3">

      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">

        Location

      </p>

      <p className="text-sm font-black text-slate-700 truncate">

        {vehicle.pickup_address}

      </p>

    </div>

  </div>

  {/* MAP BUTTON */}
  {vehicle.pickup_map_link && (

    <a
      href={vehicle.pickup_map_link}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
    >

      Open Pickup Map

      <FaExternalLinkAlt className="text-[10px]" />

    </a>

  )}

</div>
          </div>

          {/* ================= RIGHT COLUMN: DETAILS & FORM ================= */}
          <div className="lg:col-span-5 w-full max-w-full space-y-6"> {/* FIXED: Added w-full max-w-full */}
            <div className="bg-white rounded-[2rem] shadow-lg p-5 md:p-8 border border-slate-100">
              
           



              {/* AVAILABILITY BAR */}
<div className="mb-8">

  <div className="flex items-center justify-between mb-3">

    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">

      Booking Availability

    </h3>

    <span className="text-[10px] font-bold text-slate-400">

      Next 5 Days

    </span>

  </div>

  <div className="flex gap-3 overflow-x-auto pb-2">

    {availabilityDates.map(
      (item, index) => {

        const isBooked =
          item.booked;

        return (

          <div
            key={index}
            className={`min-w-[64px] h-[72px] rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
              isBooked
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >

            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isBooked
                  ? "text-red-400"
                  : "text-green-500"
              }`}
            >

              {item.day}

            </span>

            <span
              className={`text-2xl font-black ${
                isBooked
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >

              {item.date}

            </span>

          </div>

        );

      }
    )}

  </div>

</div>

              {/* BOOKING FORM */}

              <form onSubmit={handleBooking} className="space-y-4">
                {/* BOOKING TYPE */}
<div className="space-y-1">

  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">

    Booking Type

  </label>
<div className="grid grid-cols-2 gap-3">

  {/* DAILY */}
  <label
    className={`cursor-pointer border-2 rounded-2xl p-4 flex items-start gap-3 transition-all ${
      bookingType === "DAILY"
        ? "border-blue-600 bg-blue-50"
        : "border-slate-200 bg-white"
    }`}
  >

    <input
      type="radio"
      name="bookingType"
      value="DAILY"
      checked={bookingType === "DAILY"}
      onChange={(e) =>
        setBookingType(e.target.value)
      }
      className="mt-1 accent-blue-600"
    />

    <div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">

        Booking

      </p>

      <p className="text-sm font-black text-slate-800">

        Daily

      </p>

    </div>

  </label>

  {/* HOURLY */}
  <label
    className={`cursor-pointer border-2 rounded-2xl p-4 flex items-start gap-3 transition-all ${
      bookingType === "HOURLY"
        ? "border-blue-600 bg-blue-50"
        : "border-slate-200 bg-white"
    }`}
  >

    <input
      type="radio"
      name="bookingType"
      value="HOURLY"
      checked={bookingType === "HOURLY"}
      onChange={(e) =>
        setBookingType(e.target.value)
      }
      className="mt-1 accent-blue-600"
    />

    <div>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">

        Booking

      </p>

      <p className="text-sm font-black text-slate-800">

        Hourly

      </p>


      <p className="text-[10px] text-blue-600 font-bold mt-1">

        Fixed 8 Hours

      </p>

    </div>

  </label>

</div>

</div>

{/* PICKUP & DROP SECTION */}

<div className="grid md:grid-cols-2 gap-4">

  {/* PICKUP */}
  <div className="space-y-1">

    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">

      Pickup Date & Time

    </label>

    <input
  type="datetime-local"
  value={pickupDatetime}
  min={new Date(
    Date.now() -
      new Date().getTimezoneOffset() *
        60000
  )
    .toISOString()
    .slice(0, 16)}
  onChange={(e) =>
    setPickupDatetime(
      e.target.value
    )
  }
  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
/>

  </div>

  {/* DROP */}
  <div className="space-y-1">

    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">

      Drop Date & Time

    </label>

    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[58px] flex items-center">

      {dropDatetime ? (

        <div>

          <p className="text-sm font-black text-slate-800">

            {
              new Date(
                dropDatetime
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
            }

          </p>

          <p className="text-xs text-slate-500 font-bold mt-1">

            {
              new Date(
                dropDatetime
              ).toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            }

          </p>

        </div>

      ) : (

        <p className="text-xs text-slate-400 font-medium">

          Auto calculated

        </p>

      )}

    </div>

  </div>

</div>

{/* DAYS */}
{bookingType === "DAILY" && (

  <div className="space-y-1">

    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">

      Number Of Days

    </label>

    <input
      type="number"
      min="1"
      value={days}
      onChange={(e) =>
        setDays(e.target.value)
      }
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
    />

  </div>

)}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="Enter driver name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">License Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLicense(e.target.files[0])}
                    className="hidden"
                    id="license-upload"
                  />
                  <label 
                    htmlFor="license-upload"
                    className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 cursor-pointer hover:bg-slate-100"
                  >
                    <FaFileImage className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {license ? license.name : "Click to upload license"}
                    </span>
                  </label>
                </div>

                <div className="space-y-1">

  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">

    Aadhar Photo

  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setAadhar(e.target.files[0])
    }
    className="hidden"
    id="aadhar-upload"
  />

  <label
    htmlFor="aadhar-upload"
    className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 cursor-pointer hover:bg-slate-100"
  >

    <FaFileImage className="text-slate-400" />

    <span className="text-[10px] font-bold text-slate-500 truncate">

      {aadhar
        ? aadhar.name
        : "Upload Aadhar Card"}

    </span>

  </label>

</div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {bookingLoading ? "Processing..." : "Confirm & Book Vehicle"}
                </button>
              </form>
              <p className="text-center text-[9px] text-slate-400 font-bold mt-4 uppercase">Secure Payment & Instant Confirmation</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}