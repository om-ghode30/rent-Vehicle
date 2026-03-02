import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function HomePages() {
  const navigate = useNavigate();

  // ✅ AUTH + ROLE FROM CONTEXT
  const { isAuthenticated, role } = useContext(DataContext);

  // ✅ ROLE BASED ACTION
  const handlePrimaryAction = () => {
    if (role === "owner") {
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
    <div className="overflow-x-hidden w-full">
      {/* Home Page top content background image */}
      <div className="relative min-h-[500px] md:h-[70vh] w-full flex items-center justify-center">
        <img
          src="/images/img11.jpg"
          alt="CarImages"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-6">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black max-w-4xl leading-[1.1]">
            Explore the Hidden Spots with Rental Cars
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            {/* 🔹 BUTTON LOGIC PRESERVED */}
            <button
              onClick={handlePrimaryAction}
              className="px-6 py-4 rounded-xl bg-zinc-100 text-zinc-900 font-bold hover:bg-white transition-all shadow-lg text-sm md:text-base w-full sm:w-auto"
            >
              {getButtonText()}
            </button>

            <button 
              onClick={() => navigate('/about')}
              className="px-6 py-4 rounded-xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all text-sm md:text-base w-full sm:w-auto"
            >
              About Us
            </button>
          </div>
        </div>
      </div>

      {/* Feature Bar */}
      <div className="bg-yellow-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
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
            <div key={index} className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-green-700 rounded-full p-1.5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={4}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <h3 className="font-extrabold text-lg md:text-xl">{item.title}</h3>
              </div>
              <p className="text-sm md:text-base font-medium opacity-90">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              We are committed to providing fast, reliable, and professional car
              rental services.
            </h1>

            <button
              onClick={handlePrimaryAction}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-lg shadow-green-100"
            >
              {getButtonText()}
            </button>
          </div>

          <div className="w-full h-64 md:h-80 lg:h-96 bg-slate-100 rounded-3xl border border-slate-100 overflow-hidden">
             {/* 

[Image of car rental service]
 */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mobile order change: Text first, then image */}
          <div className="order-2 lg:order-1 relative w-full h-72 md:h-80 lg:h-96 bg-slate-100 rounded-3xl overflow-hidden">
            <div className="absolute bottom-4 left-4 right-4 bg-green-900/95 backdrop-blur-md text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs md:text-sm font-medium text-center sm:text-left">
                No matter the situation, RentalCars is ready to assist.
              </p>
              <span className="bg-lime-400 text-green-900 px-5 py-2 rounded-full text-xs md:text-sm font-black whitespace-nowrap">
                +123 456 7890
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
              Your trusted partner in reliable car rental
            </h2>

            <p className="text-gray-600 text-base md:text-lg">
              We take pride in our fleet and customer experience.
            </p>

            <button
              onClick={handlePrimaryAction}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 transition-all"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="flex flex-col lg:flex-row items-stretch w-full">
        {/* Left Text Section */}
        <div className="bg-zinc-900 text-white p-8 md:p-16 lg:w-1/2 flex flex-col justify-center gap-10">
          <h2 className="text-2xl md:text-4xl font-black border-l-4 border-lime-400 pl-6">
            Rent your car in 3 easy steps
          </h2>

          <div className="space-y-8">
            {[
              { id: '01', title: 'Choose Your Car', desc: 'Find the perfect car that fits your journey.' },
              { id: '02', title: 'Book Online', desc: 'Select date and location in seconds.' },
              { id: '03', title: 'Pick Up & Drive', desc: 'Grab the keys and enjoy your ride.' }
            ].map((step) => (
              <div key={step.id} className="flex gap-5 group">
                <span className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl bg-lime-400 text-black font-black text-lg md:text-xl">
                  {step.id}
                </span>
                <div>
                  <h4 className="font-bold text-lg md:text-xl mb-1">{step.title}</h4>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 h-64 md:h-80 lg:h-auto">
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