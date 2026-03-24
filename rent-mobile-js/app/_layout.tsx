import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { DataProvider } from "../src/context/DataContext";
import { View, Text } from "react-native";

function RootNavigation() {
  const { loading } = useAuth();

  // 🔄 Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ✅ ALWAYS render Stack
  return <Stack screenOptions={{ headerShown: false }} />;
}

// ================= MAIN LAYOUT =================
export default function Layout() {
  return (
    <AuthProvider>
      <DataProvider>
        <RootNavigation />
      </DataProvider>
    </AuthProvider>
  );
}