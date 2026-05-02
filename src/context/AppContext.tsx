import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialBookings, initialMessages, initialTrips } from "../data/mockData";
import { Booking, ChatMessage, Trip } from "../types/models";
import { api } from "../lib/api";

type SearchFilter = {
  from?: Trip["departureCity"];
  to?: Trip["arrivalCity"];
};

type AppContextValue = {
  trips: Trip[];
  bookings: Booking[];
  messages: ChatMessage[];
  filter: SearchFilter;
  setFilter: (filter: SearchFilter) => void;
  addTrip: (trip: Omit<Trip, "id">) => void;
  requestBooking: (tripId: string, seats: number, passengerName: string) => void;
  cancelBooking: (bookingId: string) => void;
  sendMessage: (tripId: string, body?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function mapTrip(row: any): Trip {
  const departureDateRaw = String(row.departureDate ?? "");
  const departureDate = departureDateRaw.includes("T") ? departureDateRaw.split("T")[0] : departureDateRaw;
  return {
    id: row.id,
    driverName: row.driverProfile?.user?.name ?? "Driver",
    phoneMasked: row.driverProfile?.user?.phone ? maskPhone(row.driverProfile.user.phone) : "03xx-xxx-xxxx",
    vehicleType: row.vehicleType ?? "Car",
    seatsAvailable: Number(row.seatsAvailable ?? 0),
    farePerSeat: Number(row.farePerSeat ?? 0),
    departureCity: row.departureCity,
    arrivalCity: row.arrivalCity,
    departureDate,
    departureTime: row.departureTime ?? "",
    notes: row.notes ?? undefined
  };
}

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    tripId: row.tripId,
    passengerName: "You",
    seats: Number(row.seats ?? 1),
    status: String(row.status ?? "requested").toLowerCase(),
    createdAt: row.createdAt ?? new Date().toISOString()
  } as Booking;
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return `${phone.slice(0, 4)}-xxx-${phone.slice(-4)}`;
}

export function AppProvider({
  children,
  authToken
}: {
  children: React.ReactNode;
  authToken?: string | null;
}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [filter, setFilter] = useState<SearchFilter>({});

  useEffect(() => {
    if (!authToken) return;
    let cancelled = false;

    const sync = async () => {
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          api.searchTrips({}),
          api.listRiderBookings(authToken)
        ]);
        if (cancelled) return;
        setTrips(tripsRes.map(mapTrip));
        setBookings(bookingsRes.map(mapBooking));
      } catch {
        // Keep mock data if API is unavailable.
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const addTrip = (trip: Omit<Trip, "id">) => {
    setTrips((prev) => [{ ...trip, id: `t${Date.now()}` }, ...prev]);
  };

  const requestBooking = (tripId: string, seats: number, passengerName: string) => {
    if (authToken) {
      void api
        .createBooking(authToken, tripId, seats)
        .then(() => api.listRiderBookings(authToken))
        .then((rows) => setBookings(rows.map(mapBooking)))
        .catch(() => undefined);
    }
    setBookings((prev) => [
      {
        id: `b${Date.now()}`,
        tripId,
        passengerName,
        seats,
        status: "requested",
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const cancelBooking = (bookingId: string) => {
    if (authToken) {
      void api.cancelBooking(authToken, bookingId).catch(() => undefined);
    }
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId && booking.status !== "completed"
          ? { ...booking, status: "cancelled" }
          : booking
      )
    );
  };

  const sendMessage = (tripId: string, body?: string) => {
    const safeBody = (body ?? "").trim();
    if (!safeBody) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        tripId,
        sender: "user",
        body: safeBody,
        sentAt: new Date().toISOString()
      }
    ]);
  };

  const value = useMemo(
    () => ({ trips, bookings, messages, filter, setFilter, addTrip, requestBooking, cancelBooking, sendMessage }),
    [trips, bookings, messages, filter]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return ctx;
}
