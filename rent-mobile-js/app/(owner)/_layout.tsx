import { Tabs } from "expo-router";

export default function OwnerLayout() {
  return (
    <Tabs>
      {/* ✅ Visible Tabs */}
      {/* <Tabs.Screen name="index" options={{ title: "Dashboard" }} /> */}
     <Tabs.Screen name="index" options={{ title: "Vehicles" }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />

      {/* ❌ Hidden Screens */}
      <Tabs.Screen name="add-vehicle" options={{ href: null }} />
      <Tabs.Screen name="vehicle/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
    </Tabs>
  );
}