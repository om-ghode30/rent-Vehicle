import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function HomePages() {
  const navigate = useNavigate();

  // ✅ AUTH + ROLE FROM CONTEXT
  const { isAuthenticated, role } = useContext(DataContext);

  // ✅ ROLE BASED ACTION
  const handlePrimaryAction = () => {
    if (role === "owner"){
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }

    if (role === "owner") {
      navigate("/owner/vehicles");
    } else {
      navigate("/vehicles");
    }
  };

  // ✅ ROLE BASED BUTTON TEXT
  const getButtonText = () => {
    if (isAuthenticated && role === "owner") {
      return "Upload Your Rental Vehicle";
    }
    return "Reserve Your Car";
  };

  return (
    <div>
      {/* Home Page top content background image */}
      <div className="relative h-[70vh] w-full">
        <img
          src="/images/img11.jpg"
          alt="CarImages"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-white text-3xl sm:text-5xl font-bold">
            Explore the Hidden Spots with Rental Cars
          </h1>

          <div className="mt-6 flex gap-4">
            {/* 🔹 ONLY THIS BUTTON LOGIC CHANGED */}
            <button
              onClick={handlePrimaryAction}
              className="px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white transition"
            >
              {getButtonText()}
            </button>

            <button 
             onClick={() => navigate('/about')}
            className="px-6 py-3 rounded-xl border border-white text-white hover:bg-white hover:text-black transition">
              About Us
            </button>
          </div>
        </div>
      </div>
      {/* END */}

      {/* Feature Bar */}
      <div className="bg-yellow-400 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
          {[
            {
              title: "Well maintained vehicles",
              desc: "All our cars are thoroughly inspected and maintained for smooth, reliable driving.",
            },
            {
              title: "Affordable pricing",
              desc: "Enjoy transparent pricing with no hidden fees. Great cars at great rates.",
            },
            {
              title: "Excellent support",
              desc: "We're here whenever you need us. Friendly service and peace of mind.",
            },
          ].map((item, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-green-700 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <h3 className="font-bold text-lg">{item.title}</h3>
              </div>
              <p className="text-sm max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* END */}

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              We are committed to providing fast, reliable, and professional car
              rental services.
            </h1>

            {/* 🔹 SAME ROLE BASED ACTION */}
            <button
              onClick={handlePrimaryAction}
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-medium rounded-full hover:bg-green-800 transition"
            >
              {getButtonText()}
            </button>
          </div>

          <div className="w-full h-64 lg:h-80 bg-gray-200 rounded-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-80 bg-gray-200 rounded-xl overflow-hidden">
            <div className="absolute bottom-4 left-4 right-4 bg-green-800 text-white p-4 rounded-xl flex items-center justify-between">
              <p className="text-sm">
                No matter the situation, RentalCars is fast, friendly, and always
                ready to assist.
              </p>
              <span className="bg-lime-400 text-green-900 px-4 py-2 rounded-full text-sm font-semibold">
                +123 456 7890
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Your trusted partner in reliable car rental
            </h2>

            <p className="text-gray-600">
              We take pride in our fleet and customer experience.
            </p>

            {/* 🔹 SAME ROLE BASED ACTION */}
            <button
              onClick={handlePrimaryAction}
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-medium rounded-full hover:bg-green-800 transition"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row items-stretch w-full">
        {/* Left Text Section */}
        <div className="bg-black text-white p-10 lg:w-1/2 flex flex-col justify-center gap-6">
          <h2 className="text-3xl font-bold">
            Rent your car in 3 easy steps
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-lime-400 text-black font-semibold">
                01
              </span>
              <div>
                <h4 className="font-semibold">Choose Your Car</h4>
                <p className="text-sm text-gray-300">
                  Find the perfect car that fits your journey.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-lime-400 text-black font-semibold">
                02
              </span>
              <div>
                <h4 className="font-semibold">Book Online</h4>
                <p className="text-sm text-gray-300">
                  Select date and location in seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-lime-400 text-black font-semibold">
                03
              </span>
              <div>
                <h4 className="font-semibold">Pick Up & Drive</h4>
                <p className="text-sm text-gray-300">
                  Grab the keys and enjoy your ride.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="lg:w-1/2">
          <img
            src="/images/img11.jpg"
            alt="Car"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}

export default HomePages;
