import { Booking, ChatMessage, City, Trip } from "../types/models";

export const cities: City[] = ["Islamabad", "Lahore", "Karachi", "Gilgit", "Hunza", "Skardu"];

export const initialTrips: Trip[] = [
  {
    id: "t1",
    driverName: "Ali Raza",
    phoneMasked: "03xx-xxx-1122",
    vehicleType: "Hiace",
    seatsAvailable: 7,
    farePerSeat: 4200,
    departureCity: "Islamabad",
    arrivalCity: "Gilgit",
    departureDate: "2026-05-02",
    departureTime: "07:30",
    notes: "Family-friendly trip, one luggage per seat."
  },
  {
    id: "t2",
    driverName: "Hassan Karim",
    phoneMasked: "03xx-xxx-9988",
    vehicleType: "SUV",
    seatsAvailable: 3,
    farePerSeat: 6800,
    departureCity: "Gilgit",
    arrivalCity: "Islamabad",
    departureDate: "2026-05-03",
    departureTime: "09:00"
  },
  {
    id: "t3",
    driverName: "Imran Shah",
    phoneMasked: "03xx-xxx-5566",
    vehicleType: "Coaster",
    seatsAvailable: 14,
    farePerSeat: 5300,
    departureCity: "Lahore",
    arrivalCity: "Skardu",
    departureDate: "2026-05-05",
    departureTime: "05:45"
  }
];

export const initialBookings: Booking[] = [
  {
    id: "b1",
    tripId: "t1",
    passengerName: "Guest User",
    seats: 2,
    status: "requested",
    createdAt: new Date().toISOString()
  }
];

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    tripId: "t1",
    sender: "driver",
    body: "Assalam o Alaikum, pickup point is Daewoo Terminal Islamabad.",
    sentAt: new Date().toISOString()
  }
];
