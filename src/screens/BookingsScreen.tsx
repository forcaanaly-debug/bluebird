import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BlueBirdLogo } from "../components/BlueBirdLogo";
import { useAppContext } from "../context/AppContext";
import { color, radius, space, type } from "../theme";

export function BookingsScreen() {
  const { bookings, trips, cancelBooking } = useAppContext();
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const safeDateFilter = (dateFilter ?? "").trim().toLowerCase();
  const safeTimeFilter = (timeFilter ?? "").trim().toLowerCase();

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const trip = trips.find((item) => item.id === booking.tripId);
        if (!trip) return false;
        const datePass = safeDateFilter
          ? trip.departureDate.toLowerCase().includes(safeDateFilter)
          : true;
        const timePass = safeTimeFilter
          ? trip.departureTime.toLowerCase().includes(safeTimeFilter)
          : true;
        return datePass && timePass;
      }),
    [bookings, trips, safeDateFilter, safeTimeFilter]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BlueBirdLogo width={100} height={60} />
      <Text style={styles.title}>My Bookings</Text>

      <View style={styles.filterRow}>
        <TextInput
          value={dateFilter}
          onChangeText={setDateFilter}
          placeholder="Date (YYYY-MM-DD)"
          style={styles.filterInput}
        />
        <TextInput
          value={timeFilter}
          onChangeText={setTimeFilter}
          placeholder="Time (HH:MM)"
          style={styles.filterInput}
        />
      </View>

      {filteredBookings.map((booking) => {
        const trip = trips.find((item) => item.id === booking.tripId);
        if (!trip) return null;
        return (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.route}>
              {trip.departureCity} {"->"} {trip.arrivalCity}
            </Text>
            <Text style={styles.line}>Passenger: {booking.passengerName}</Text>
            <Text style={styles.line}>Seats: {booking.seats}</Text>
            <Text style={styles.line}>Status: {booking.status}</Text>
            <Text style={styles.line}>
              Departure: {trip.departureDate} {trip.departureTime}
            </Text>
            {booking.status !== "cancelled" && booking.status !== "completed" ? (
              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  Alert.alert("Cancel booking?", "This will mark your booking as cancelled.", [
                    { text: "Keep", style: "cancel" },
                    {
                      text: "Cancel booking",
                      style: "destructive",
                      onPress: () => cancelBooking(booking.id)
                    }
                  ])
                }
              >
                <Text style={styles.cancelButtonText}>Cancel booking</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
      {filteredBookings.length === 0 ? <Text style={styles.empty}>No bookings for selected date/time.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: 90, backgroundColor: color.bg },
  title: { ...type.title, color: color.ink, marginBottom: space.md },
  card: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    backgroundColor: color.surfaceCard
  },
  route: { fontSize: 16, fontWeight: "700", color: color.inkSecondary, marginBottom: 6 },
  line: { color: color.body, marginBottom: 2 },
  filterRow: { marginBottom: space.md, gap: space.sm },
  filterInput: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: color.surface
  },
  cancelButton: {
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: color.error,
    borderRadius: radius.pill,
    paddingVertical: 9
  },
  cancelButtonText: {
    textAlign: "center",
    color: color.error,
    fontWeight: "700"
  },
  empty: { color: color.subtle }
});
