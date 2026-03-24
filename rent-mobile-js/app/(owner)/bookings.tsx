import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";
import { getOwnerBookings } from "../../src/api/api";
import { router } from "expo-router";

export default function Bookings() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getOwnerBookings().then(res => setData(res.data.data));
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <TouchableOpacity
       onPress={() => router.push(`/booking/${item.booking_id}`)}
        >
          <Text>{item.vehicle_number} - {item.status}</Text>
        </TouchableOpacity>
      )}
    />
  );
}