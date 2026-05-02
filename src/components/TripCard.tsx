import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Trip } from "../types/models";
import { color, radius, space } from "../theme";

type Props = {
  trip: Trip;
  onBook: () => void;
};

export function TripCard({ trip, onBook }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.route}>
        {trip.departureCity} {"->"} {trip.arrivalCity}
      </Text>
      <Text style={styles.meta}>
        {trip.departureDate} at {trip.departureTime} | {trip.vehicleType}
      </Text>
      <Text style={styles.meta}>
        Driver: {trip.driverName} ({trip.phoneMasked})
      </Text>
      <Text style={styles.meta}>
        Seats: {trip.seatsAvailable} | PKR {trip.farePerSeat}/seat
      </Text>
      {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}
      <Pressable style={styles.button} onPress={onBook}>
        <Text style={styles.buttonText}>Request Booking</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.md + 2,
    marginBottom: space.md,
    backgroundColor: color.surfaceCard
  },
  route: {
    fontSize: 16,
    fontWeight: "700",
    color: color.inkSecondary
  },
  meta: {
    fontSize: 13,
    color: color.body,
    marginTop: space.xs
  },
  notes: {
    marginTop: space.sm,
    color: color.body,
    fontSize: 12
  },
  button: {
    marginTop: 10,
    backgroundColor: color.accent,
    paddingVertical: 10,
    borderRadius: radius.pill
  },
  buttonText: {
    color: color.onAccent,
    fontWeight: "700",
    textAlign: "center"
  }
});
