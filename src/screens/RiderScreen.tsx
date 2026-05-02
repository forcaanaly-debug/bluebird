import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TripCard } from "../components/TripCard";
import { BlueBirdLogo } from "../components/BlueBirdLogo";
import { useAppContext } from "../context/AppContext";
import { cities } from "../data/mockData";
import { City } from "../types/models";
import { color, radius, space, type } from "../theme";

export function RiderScreen() {
  const { trips, requestBooking } = useAppContext();
  const [mode, setMode] = useState<"search" | "create" | null>(null);
  const [from, setFrom] = useState<City | undefined>();
  const [to, setTo] = useState<City | undefined>();
  const [bookingDate, setBookingDate] = useState("");
  const [passengerName, setPassengerName] = useState("Guest User");
  const [seats, setSeats] = useState("1");

  const safeDateFilter = (bookingDate ?? "").trim().toLowerCase();
  const safePassengerName = (passengerName ?? "").trim();

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const fromPass = from ? trip.departureCity === from : true;
        const toPass = to ? trip.arrivalCity === to : true;
        const datePass = safeDateFilter
          ? trip.departureDate.toLowerCase().includes(safeDateFilter)
          : true;
        return fromPass && toPass && datePass;
      }),
    [trips, from, to, safeDateFilter]
  );

  const onBookTrip = (tripId: string) => {
    const seatCount = Number(seats);
    if (!safePassengerName || Number.isNaN(seatCount) || seatCount < 1) {
      Alert.alert("Invalid Details", "Please provide a valid name and seat count.");
      return;
    }
    requestBooking(tripId, seatCount, safePassengerName);
    Alert.alert("Booking Requested", "Your request was sent to the driver.");
  };

  const onCreateRequest = () => {
    const seatCount = Number(seats);
    if (!safePassengerName || Number.isNaN(seatCount) || seatCount < 1) {
      Alert.alert("Invalid Details", "Please provide a valid name and seat count.");
      return;
    }
    const matchedTrip = filteredTrips[0];
    if (!matchedTrip) {
      Alert.alert("No Driver Offer Found", "Try another day/time or route and search available offers.");
      return;
    }
    requestBooking(matchedTrip.id, seatCount, safePassengerName);
    Alert.alert("Booking Created", "Your booking request has been sent.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BlueBirdLogo width={120} height={72} />
      <Text style={styles.title}>BlueBird</Text>
      <Text style={styles.subtitle}>Mountain transport made easy.</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === "create" ? styles.modeButtonActive : null]}
          onPress={() => setMode("create")}
        >
          <Text style={[styles.modeButtonText, mode === "create" ? styles.modeButtonTextActive : null]}>Create Booking</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "search" ? styles.modeButtonActive : null]}
          onPress={() => setMode("search")}
        >
          <Text style={[styles.modeButtonText, mode === "search" ? styles.modeButtonTextActive : null]}>Search Booking</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <SelectCity label="From" value={from} onSelect={setFrom} />
        <SelectCity label="To" value={to} onSelect={setTo} />
      </View>

      <View style={styles.bookingInputRow}>
        <TextInput value={bookingDate} onChangeText={setBookingDate} placeholder="Date (YYYY-MM-DD)" style={styles.input} />
      </View>

      {mode === "create" ? (
        <View style={styles.createCard}>
          <TextInput value={passengerName} onChangeText={setPassengerName} placeholder="Passenger name" style={styles.input} />
          <TextInput value={seats} onChangeText={setSeats} placeholder="Seats" keyboardType="number-pad" style={styles.smallInput} />
          <Pressable style={styles.createButton} onPress={onCreateRequest}>
            <Text style={styles.createButtonText}>Create Booking Request</Text>
          </Pressable>
        </View>
      ) : null}

      {mode === "search" ? (
        <>
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onBook={() => onBookTrip(trip.id)} />
          ))}
          {filteredTrips.length === 0 ? <Text style={styles.empty}>No driver offers for selected day/date.</Text> : null}
        </>
      ) : null}

      {!mode ? <Text style={styles.empty}>Choose Create Booking or Search Booking to continue.</Text> : null}
    </ScrollView>
  );
}

function SelectCity({
  label,
  value,
  onSelect
}: {
  label: string;
  value?: City;
  onSelect: (city?: City) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.selectBox}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Pressable style={styles.selectTrigger} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.selectText}>{value ?? "Any"}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          <Pressable onPress={() => { onSelect(undefined); setOpen(false); }}>
            <Text style={styles.option}>Any</Text>
          </Pressable>
          {cities.map((city) => (
            <Pressable key={city} onPress={() => { onSelect(city); setOpen(false); }}>
              <Text style={styles.option}>{city}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: 90, backgroundColor: color.bg },
  title: { ...type.title, color: color.ink },
  subtitle: { marginTop: space.sm, marginBottom: space.md, color: color.muted },
  modeRow: { flexDirection: "row", gap: 10, marginBottom: space.md },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingVertical: 10,
    backgroundColor: color.surface
  },
  modeButtonActive: { backgroundColor: color.accentDark, borderColor: color.accentDark },
  modeButtonText: { textAlign: "center", color: color.body, fontWeight: "600" },
  modeButtonTextActive: { color: color.onAccent },
  filterRow: { flexDirection: "row", gap: 10, zIndex: 5 },
  bookingInputRow: { flexDirection: "row", marginVertical: space.md, gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: color.surface
  },
  smallInput: {
    width: 140,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: color.surface
  },
  empty: { marginTop: space.sm, color: color.subtle },
  createCard: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.md,
    backgroundColor: color.surfaceCard,
    gap: space.sm
  },
  createButton: {
    backgroundColor: color.accentDark,
    borderRadius: radius.pill,
    paddingVertical: 11
  },
  createButtonText: { textAlign: "center", color: color.onAccent, fontWeight: "700" },
  selectBox: { flex: 1 },
  selectLabel: { fontSize: type.label.fontSize, color: color.muted, marginBottom: 5 },
  selectTrigger: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: space.sm,
    backgroundColor: color.surface
  },
  selectText: { color: color.inkSecondary },
  dropdown: {
    marginTop: space.xs,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    padding: space.sm,
    backgroundColor: color.surface
  },
  option: { paddingVertical: 5, color: color.body }
});
