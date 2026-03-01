import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBooking } from "../../api/api";

export default function BookingDetails() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBooking(id);
      setBooking(res.data?.data || res.data);
    } catch (err) {
      console.error("Booking fetch error:", err);
    }
  };

  if (!booking) return <p>Loading booking details...</p>;

  return (
    <div className="bg-white p-8 rounded shadow space-y-4">

      <h2 className="text-2xl font-bold mb-6">Booking Details</h2>

      <p><strong>Booking ID:</strong> {booking.id}</p>
      <p><strong>User ID:</strong> {booking.user_id}</p>
      <p><strong>Vehicle ID:</strong> {booking.vehicle_id}</p>
  <p><strong>Start Date:</strong> {booking.start_datetime}</p>
  <p><strong>End Date:</strong> {booking.end_datetime}</p>
  <p><strong>Total Amount:</strong> ₹{booking.total_price}</p>
      <p><strong>Status:</strong> {booking.status}</p>

    </div>
  );
}