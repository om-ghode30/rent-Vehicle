import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
      {/* <Tabs.Screen name="profile" options={{ title: "Profile" }} /> */}
    </Tabs>
  );
}