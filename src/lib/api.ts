import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) {
    return "http://localhost:3000/api";
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri;
  const expoHost = typeof hostUri === "string" ? hostUri.split(":")[0] : "";
  const isLocalhostTarget =
    configured.includes("://localhost:") || configured.includes("://127.0.0.1:");

  // In Expo Go on a real device, localhost points to the device itself.
  if (expoHost && isLocalhostTarget) {
    return configured.replace("localhost", expoHost).replace("127.0.0.1", expoHost);
  }

  return configured;
}

const API_BASE_URL = resolveApiBaseUrl();

type OtpVerifyResponse = {
  access_token: string;
  user: {
    id: string;
    phone: string;
    name: string | null;
    role: string;
  };
};

async function apiRequest<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined)
  };
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  requestOtp(phone: string) {
    return apiRequest<{ ok: true }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone })
    });
  },
  verifyOtp(phone: string, code: string, name?: string) {
    return apiRequest<OtpVerifyResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code, name })
    });
  },
  socialLogin(provider: "google" | "apple", idToken: string, name?: string) {
    return apiRequest<OtpVerifyResponse>("/auth/social", {
      method: "POST",
      body: JSON.stringify({ provider, idToken, name })
    });
  },
  searchTrips(params: { from?: string; to?: string; date?: string }) {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.date) query.set("date", params.date);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<unknown[]>(`/trips/search${suffix}`);
  },
  listRiderBookings(token: string) {
    return apiRequest<unknown[]>("/bookings/as-rider", { token });
  },
  createBooking(token: string, tripId: string, seats: number) {
    return apiRequest<unknown>("/bookings", {
      method: "POST",
      token,
      body: JSON.stringify({ tripId, seats })
    });
  },
  cancelBooking(token: string, bookingId: string) {
    return apiRequest<unknown>(`/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      token
    });
  }
};
