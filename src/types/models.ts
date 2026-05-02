export type City = "Islamabad" | "Lahore" | "Karachi" | "Gilgit" | "Hunza" | "Skardu";

export type Trip = {
  id: string;
  driverName: string;
  phoneMasked: string;
  vehicleType: "Coaster" | "Hiace" | "Car" | "SUV";
  seatsAvailable: number;
  farePerSeat: number;
  departureCity: City;
  arrivalCity: City;
  departureDate: string;
  departureTime: string;
  notes?: string;
};

export type BookingStatus = "requested" | "confirmed" | "onboard" | "completed" | "cancelled";

export type Booking = {
  id: string;
  tripId: string;
  passengerName: string;
  seats: number;
  status: BookingStatus;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  tripId: string;
  sender: "user" | "driver";
  body: string;
  sentAt: string;
};
