import { Stack, useRouter, useSegments } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [darkMode, setDarkMode] = useState(false);

  // Screens that hide the NavBar/Header
  const hideNavBar =
    segments.length === 0 ||
    ["Signin", "CreateAccount", "ForgotPassword"].includes(segments[0]);

  // Check if currently on Home
  const isHome = segments.length === 0 || segments[0] === "Home";

  // Load theme from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((storedTheme) =>
      setDarkMode(storedTheme === "true")
    );
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem("darkMode", newMode.toString());
  };

  // Determine header icon
  const headerIconName = isHome ? "notifications-outline" : "arrow-back";
  const headerIconColor = darkMode ? "white" : "black";

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Top Header (hidden on Signin, etc.) */}
      {!hideNavBar && (
        <View style={[styles.header, darkMode && styles.darkHeader]}>
          {/* Left: Notification or Back */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => (isHome ? console.log("Open Notifications") : router.back())}
          >
            <Ionicons name={headerIconName} size={25} color={headerIconColor} />
          </TouchableOpacity>

          {/* Center: Title */}
          <Text style={[styles.headerText, darkMode && styles.darkText]}>
            Naga <Text style={[styles.med, darkMode && styles.darkMed]}>Med</Text>
          </Text>

          {/* Right: Dark Mode Toggle (Simple) */}
          <TouchableOpacity style={styles.toggleContainer} onPress={toggleDarkMode}>
            <View style={[styles.toggleSwitch, darkMode && styles.toggleSwitchDark]}>
              <Text style={styles.toggleText}>{darkMode ? "🌞" : "🌚"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content (Stack) */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Signin" />
          <Stack.Screen name="Home" />
          <Stack.Screen name="Profile" />
          <Stack.Screen name="Appointment" />
          <Stack.Screen name="Doctors" />
          <Stack.Screen name="Status" />
        </Stack>
      </View>

      {/* Bottom NavBar */}
      {!hideNavBar && (
        <View style={[styles.navBar, darkMode && styles.darkNavBar]}>
          {["Home", "Appointment", "Doctors", "Status", "Profile"].map((screen, index) => {
            // Check if current screen is active
            const isActive = segments[0] === screen;
            // Icons for each screen
            const iconName = ["home", "calendar-alt", "user-md", "chart-line", "user"][index];
            // Dynamic icon color (highlight if active)
            const iconColor = isActive ? "#0288D1" : darkMode ? "white" : "#333";

            return (
              <TouchableOpacity
                key={index}
                style={styles.navButton}
                onPress={() => router.push(`/${screen}`)}
              >
                <FontAwesome5 name={iconName} size={20} color={iconColor} />
                <Text
                  style={[
                    styles.navText,
                    darkMode && styles.darkText,
                    isActive && { color: "#0288D1" },
                  ]}
                >
                  {screen}
                </Text>
                {isActive && (
                  <View
                    style={{
                      marginTop: 2,
                      width: 20,
                      height: 2,
                      backgroundColor: "#0288D1",
                      alignSelf: "center",
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* =============== STYLES =============== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#222" },
  content: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  darkHeader: { backgroundColor: "#333" },
  headerText: { fontSize: 25, fontWeight: "800", color: "#007bff" },
  med: { fontSize: 25, fontWeight: "800", color: "#28a745" },
  darkMed: { color: "#6ee7b7" },
  darkText: { color: "white" },
  iconButton: { padding: 10 },

  /* Dark Mode Toggle */
  toggleContainer: {
    width: 55,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    padding: 2,
    position: "relative",
  },
  toggleSwitch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 2,
    top: 2,
  },
  toggleSwitchDark: { left: 28, backgroundColor: "black" },
  toggleText: { fontSize: 14 },

  /* Bottom NavBar */
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#82C45C",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  darkNavBar: { backgroundColor: "#444", borderTopColor: "#666" },
  navButton: { alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 15 },
  navText: { fontSize: 10, fontWeight: "bold", color: "#333" },
});
