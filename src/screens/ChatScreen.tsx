import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BlueBirdLogo } from "../components/BlueBirdLogo";
import { useAppContext } from "../context/AppContext";
import { color, radius, space, type } from "../theme";

type ChatMode = "driver" | "passenger_1" | "passenger_2" | "trip";
type ChatTarget = { id: ChatMode; label: string; bubble: string };

const chatTargets: ChatTarget[] = [
  { id: "driver", label: "Driver", bubble: "DR" },
  { id: "passenger_1", label: "Passenger A", bubble: "PA" },
  { id: "passenger_2", label: "Passenger B", bubble: "PB" },
  { id: "trip", label: "Trip Chat", bubble: "TC" }
];

export function ChatScreen() {
  const { bookings, messages, trips, sendMessage } = useAppContext();
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState<ChatMode | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const activeTripId = bookings[0]?.tripId;
  const activeTrip = trips.find((trip) => trip.id === activeTripId);

  const conversation = useMemo(
    () => messages.filter((message) => message.tripId === activeTripId),
    [messages, activeTripId]
  );

  return (
    <View style={styles.container}>
      {!activeChat ? (
        <>
          <BlueBirdLogo width={96} height={58} />
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {activeTrip ? `${activeTrip.departureCity} → ${activeTrip.arrivalCity}` : "Create a booking to start chat"}
          </Text>

          <View style={styles.chatListCard}>
            {chatTargets.map((target) => (
              <Pressable key={target.id} style={styles.chatListItem} onPress={() => setActiveChat(target.id)}>
                <View style={styles.avatarBubble}>
                  <Text style={styles.avatarText}>{target.bubble}</Text>
                </View>
                <Text style={styles.chatName}>{target.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.chatHeaderRow}>
            <Pressable onPress={() => setActiveChat(null)}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.chatHeaderTitle}>
              {chatTargets.find((item) => item.id === activeChat)?.label ?? "Chat"}
            </Text>
            <Pressable style={styles.callTopButton} onPress={() => Alert.alert("Calling", "Starting call...")}>
              <Text style={styles.callTopButtonText}>Call</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.messages}>
            {conversation.map((message) => (
              <View
                key={message.id}
                style={[styles.bubble, message.sender === "user" ? styles.userBubble : styles.driverBubble]}
              >
                <Text style={styles.bubbleText}>{message.body}</Text>
              </View>
            ))}
          </ScrollView>

          {actionsOpen ? (
            <View style={styles.expandedActions}>
              <Pressable
                style={styles.expandItem}
                onPress={() => {
                  if (!activeTripId) return;
                  sendMessage(activeTripId, "[Shared Location] Live Google location");
                  setActionsOpen(false);
                }}
              >
                <Text style={styles.expandItemText}>Share Location</Text>
              </Pressable>
              <Pressable
                style={styles.expandItem}
                onPress={() => {
                  if (!activeTripId) return;
                  sendMessage(activeTripId, "[Voice Note] 00:18");
                  setActionsOpen(false);
                }}
              >
                <Text style={styles.expandItemText}>Voice Note</Text>
              </Pressable>
              <Pressable
                style={styles.expandItem}
                onPress={() => {
                  if (!activeTripId) return;
                  sendMessage(activeTripId, "[Image] Shared a photo");
                  setActionsOpen(false);
                }}
              >
                <Text style={styles.expandItemText}>Send Image</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.row}>
            <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type your message..." />
            <Pressable style={styles.expandButton} onPress={() => setActionsOpen((prev) => !prev)}>
              <Text style={styles.expandButtonText}>{actionsOpen ? "Close" : "+"}</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => {
                if (!activeTripId) return;
                sendMessage(activeTripId, input);
                setInput("");
              }}
            >
              <Text style={styles.buttonText}>Send</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.lg, paddingBottom: space.xl, backgroundColor: color.bg },
  title: { ...type.title, color: color.ink },
  subtitle: { marginTop: space.sm, marginBottom: space.md, color: color.muted },
  chatListCard: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceCard,
    padding: space.md,
    gap: space.sm
  },
  chatListItem: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm },
  avatarBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.accentDark
  },
  avatarText: { color: color.onAccent, fontWeight: "700" },
  chatName: { color: color.inkSecondary, fontSize: 16, fontWeight: "600" },
  chatHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.sm },
  backText: { color: color.body, fontWeight: "600" },
  chatHeaderTitle: { ...type.title, color: color.ink, fontSize: 20 },
  callTopButton: {
    borderWidth: 1,
    borderColor: color.accentDark,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  callTopButtonText: { color: color.accentDark, fontWeight: "700" },
  messages: { flex: 1, marginBottom: 10 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: radius.md, marginBottom: space.sm },
  userBubble: { alignSelf: "flex-end", backgroundColor: color.accent },
  driverBubble: { alignSelf: "flex-start", backgroundColor: color.clay },
  bubbleText: { color: color.ink },
  expandedActions: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceCard,
    padding: space.sm,
    marginBottom: space.sm,
    gap: space.sm
  },
  expandItem: {
    borderWidth: 1,
    borderColor: color.borderMuted,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingVertical: 10
  },
  expandItemText: { textAlign: "center", color: color.inkSecondary, fontWeight: "600" },
  row: { flexDirection: "row", gap: space.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: color.surface
  },
  expandButton: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderMuted,
    borderRadius: radius.md
  },
  expandButtonText: { color: color.inkSecondary, fontWeight: "700", fontSize: 18 },
  button: { backgroundColor: color.accentDark, borderRadius: radius.pill, paddingHorizontal: 14, justifyContent: "center" },
  buttonText: { color: color.onAccent, fontWeight: "700" }
});
