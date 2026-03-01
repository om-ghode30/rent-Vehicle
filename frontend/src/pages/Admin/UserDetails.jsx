import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserFullDetails } from "../../api/api";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await getUserFullDetails(id);
      const data = res.data?.data || res.data;

      setUser(data?.user || data);
      // support different shapes: bookings array or booking_ids
      setBookings(data?.bookings || data?.booking_ids || []);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  if (!user) return <p>Loading user details...</p>;

  return (
    <div className="space-y-8">

      {/* User Info */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">User Details</h2>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone_number}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Status:</strong> {user.isApproved ? "Approved" : "Pending"}</p>
      </div>

      {/* User Bookings */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">User Bookings</h3>

        {bookings.length === 0 ? (
          <p>No bookings found for this user.</p>
        ) : (
          <ul className="list-disc pl-6 space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id || b}
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => navigate(`/admin/booking/${b.id || b}`)}
              >
                Booking ID: {b.id || b}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
