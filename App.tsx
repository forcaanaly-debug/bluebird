import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, Pressable, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "./src/context/AppContext";
import { RiderScreen } from "./src/screens/RiderScreen";
import { DriverScreen } from "./src/screens/DriverScreen";
import { BookingsScreen } from "./src/screens/BookingsScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { color, radius, space, type } from "./src/theme";
import { BlueBirdLogo } from "./src/components/BlueBirdLogo";

type RoleKey = "client" | "driver";
type TabKey = "discover" | "bookings" | "chat" | "postTrip" | "requests" | "mode";

const clientTabs: { key: TabKey; label: string }[] = [
  { key: "discover", label: "Discover" },
  { key: "bookings", label: "My Bookings" },
  { key: "chat", label: "Messages" },
  { key: "mode", label: "Mode" }
];

const driverTabs: { key: TabKey; label: string }[] = [
  { key: "postTrip", label: "Post Trip" },
  { key: "requests", label: "Requests" },
  { key: "chat", label: "Messages" },
  { key: "mode", label: "Mode" }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [role, setRole] = useState<RoleKey>("client");
  const [modeChosen, setModeChosen] = useState(false);
  const [showModePicker, setShowModePicker] = useState(true);
  const [tab, setTab] = useState<TabKey>("discover");
  const tabs = role === "client" ? clientTabs : driverTabs;

  return (
    <AppProvider authToken={authToken}>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        {!isAuthenticated ? (
          <AuthScreen
            onAuthenticated={(token) => {
              setAuthToken(token);
              setIsAuthenticated(true);
            }}
          />
        ) : null}
        {isAuthenticated ? (
          <>
        {!modeChosen ? (
          <View style={styles.header}>
            <BlueBirdLogo width={160} height={108} />
            <Text style={styles.brand}>BlueBird</Text>
            <Text style={styles.tagline}>Mountain transport made easy</Text>
          </View>
        ) : null}

        {showModePicker ? (
          <View style={styles.roleBar}>
            <Pressable
              style={[styles.roleButton, role === "client" ? styles.activeRole : null]}
              onPress={() => {
                setRole("client");
                setTab("discover");
                setModeChosen(true);
                setShowModePicker(false);
              }}
            >
              <Text style={[styles.roleText, role === "client" ? styles.activeRoleText : null]}>Client Mode</Text>
            </Pressable>
            <Pressable
              style={[styles.roleButton, role === "driver" ? styles.activeRole : null]}
              onPress={() => {
                setRole("driver");
                setTab("postTrip");
                setModeChosen(true);
                setShowModePicker(false);
              }}
            >
              <Text style={[styles.roleText, role === "driver" ? styles.activeRoleText : null]}>Driver Mode</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.content}>
          {!modeChosen ? (
            <View style={styles.modeHintCard}>
              <Text style={styles.modeHintTitle}>Choose your mode</Text>
              <Text style={styles.modeHintText}>Select Client or Driver to continue.</Text>
            </View>
          ) : (
            <>
              {tab === "discover" ? <RiderScreen /> : null}
              {tab === "postTrip" ? <DriverScreen /> : null}
              {tab === "bookings" ? <BookingsScreen /> : null}
              {tab === "requests" ? <BookingsScreen /> : null}
              {tab === "chat" ? <ChatScreen /> : null}
              {tab === "mode" ? (
                <View style={styles.modeHintCard}>
                  <Text style={styles.modeHintTitle}>Switch mode</Text>
                  <Text style={styles.modeHintText}>Use the button below to change between Client and Driver.</Text>
                  <Pressable
                    style={styles.modeSwitchButton}
                    onPress={() => setShowModePicker(true)}
                  >
                    <Text style={styles.modeSwitchButtonText}>Open Mode Selector</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
        </View>

        {modeChosen ? (
          <View style={styles.tabBar}>
            {tabs.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => {
                  if (item.key === "mode") {
                    setTab("mode");
                    return;
                  }
                  setTab(item.key);
                }}
                style={[styles.tab, tab === item.key ? styles.activeTab : null]}
              >
                <Text style={[styles.tabText, tab === item.key ? styles.activeText : null]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
          </>
        ) : null}
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { paddingHorizontal: space.lg, paddingTop: 6, paddingBottom: 10 },
  brand: { ...type.brand, color: color.ink },
  tagline: { marginTop: space.xs, color: color.muted, fontSize: type.subtitle.fontSize },
  roleBar: { flexDirection: "row", paddingHorizontal: space.lg, gap: space.sm, marginBottom: space.sm },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.borderMuted,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: color.bgElevated
  },
  activeRole: { backgroundColor: color.accent, borderColor: color.accent },
  roleText: { textAlign: "center", color: color.body, fontWeight: "600" },
  activeRoleText: { color: color.onAccent },
  content: { flex: 1 },
  modeHintCard: {
    marginHorizontal: space.lg,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surfaceCard
  },
  modeHintTitle: { ...type.title, color: color.ink, fontSize: 20 },
  modeHintText: { marginTop: space.sm, color: color.body },
  modeSwitchButton: {
    marginTop: space.md,
    borderRadius: radius.pill,
    backgroundColor: color.accentDark,
    paddingVertical: 10
  },
  modeSwitchButtonText: { textAlign: "center", color: color.onAccent, fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: color.borderHairline,
    backgroundColor: color.bgElevated,
    gap: space.sm
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.borderMuted,
    borderRadius: radius.pill,
    paddingVertical: 10
  },
  activeTab: { backgroundColor: color.accentDark, borderColor: color.accentDark },
  tabText: { textAlign: "center", color: color.body, ...type.tab },
  activeText: { color: color.onAccent }
});
