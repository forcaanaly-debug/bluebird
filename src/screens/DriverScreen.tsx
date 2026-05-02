import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BlueBirdLogo } from "../components/BlueBirdLogo";
import { useAppContext } from "../context/AppContext";
import { cities } from "../data/mockData";
import { City, Trip } from "../types/models";
import { color, radius, space, type } from "../theme";

const vehicleTypes: Trip["vehicleType"][] = ["Coaster", "Hiace", "Car", "SUV"];

export function DriverScreen() {
  const { addTrip } = useAppContext();
  const [driverName, setDriverName] = useState("New Driver");
  const [from, setFrom] = useState<City>("Islamabad");
  const [to, setTo] = useState<City>("Gilgit");
  const [vehicleType, setVehicleType] = useState<Trip["vehicleType"]>("Hiace");
  const [seats, setSeats] = useState("6");
  const [fare, setFare] = useState("4500");
  const [date, setDate] = useState("2026-05-06");
  const [time, setTime] = useState("06:30");
  const safeDriverName = (driverName ?? "").trim();

  const submit = () => {
    const seatCount = Number(seats);
    const fareValue = Number(fare);
    if (!safeDriverName || Number.isNaN(seatCount) || Number.isNaN(fareValue)) {
      Alert.alert("Invalid input", "Please complete all required fields correctly.");
      return;
    }
    addTrip({
      driverName: safeDriverName,
      phoneMasked: "03xx-xxx-new",
      vehicleType,
      seatsAvailable: seatCount,
      farePerSeat: fareValue,
      departureCity: from,
      arrivalCity: to,
      departureDate: date,
      departureTime: time,
      notes: "Posted from BlueBird driver MVP."
    });
    Alert.alert("Trip Posted", "Your trip is now visible to riders.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BlueBirdLogo width={110} height={66} />
      <Text style={styles.title}>Driver Posting</Text>
      <Text style={styles.subtitle}>Create ride offers for GB routes.</Text>

      <TextInput style={styles.input} value={driverName} onChangeText={setDriverName} placeholder="Driver name" />
      <SelectLine title="From" value={from} values={cities} onChange={setFrom} />
      <SelectLine title="To" value={to} values={cities} onChange={setTo} />
      <SelectLine title="Vehicle" value={vehicleType} values={vehicleTypes} onChange={setVehicleType} />

      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} value={seats} onChangeText={setSeats} keyboardType="number-pad" placeholder="Seats" />
        <TextInput style={[styles.input, styles.half]} value={fare} onChangeText={setFare} keyboardType="number-pad" placeholder="Fare (PKR)" />
      </View>

      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <TextInput style={[styles.input, styles.half]} value={time} onChangeText={setTime} placeholder="HH:MM" />
      </View>

      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Post Trip</Text>
      </Pressable>
    </ScrollView>
  );
}

function SelectLine<T extends string>({
  title,
  value,
  values,
  onChange
}: {
  title: string;
  value: T;
  values: T[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.selectWrap}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.choiceRow}>
        {values.map((choice) => (
          <Pressable
            key={choice}
            onPress={() => onChange(choice)}
            style={[styles.choice, value === choice ? styles.choiceActive : null]}
          >
            <Text style={[styles.choiceText, value === choice ? styles.choiceTextActive : null]}>{choice}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: 90, backgroundColor: color.bg },
  title: { ...type.title, color: color.ink },
  subtitle: { marginTop: space.sm, marginBottom: space.md, color: color.muted },
  input: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 10,
    backgroundColor: color.surface
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  selectWrap: { marginBottom: 10 },
  label: { fontSize: type.label.fontSize, color: color.muted, marginBottom: 5 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choice: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: color.surface
  },
  choiceActive: { backgroundColor: color.accent, borderColor: color.accent },
  choiceText: { fontSize: 12, color: color.body },
  choiceTextActive: { color: color.onAccent, fontWeight: "700" },
  button: { marginTop: space.sm, backgroundColor: color.accentDark, paddingVertical: space.md, borderRadius: radius.pill },
  buttonText: { color: color.onAccent, fontWeight: "700", textAlign: "center" }
});
