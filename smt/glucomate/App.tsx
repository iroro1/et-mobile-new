import "react-native-get-random-values";
import React from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/hooks/useAuth";
import { ProfileProvider } from "./src/hooks/useProfile";
import RootNavigator from "./src/navigation";

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <RootNavigator />
        <Toast />
        <StatusBar style="auto" />
      </ProfileProvider>
    </AuthProvider>
  );
}
