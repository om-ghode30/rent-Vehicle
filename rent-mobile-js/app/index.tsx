import { useAuth } from "../src/context/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.role === "owner") {
    return <Redirect href="/(owner)" />;
  }

  return <Redirect href="/(tabs)" />;
}