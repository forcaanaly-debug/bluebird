import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { color, radius, space, type } from "../theme";
import { BlueBirdLogo } from "../components/BlueBirdLogo";
import { api, getApiBaseUrl } from "../lib/api";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as AppleAuthentication from "expo-apple-authentication";
type AuthMode = "login" | "register";

type Props = {
  onAuthenticated: (accessToken: string) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("+92300");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiBase = getApiBaseUrl();

  const ctaText = mode === "login" ? "Continue with" : "Register with";
  const normalizedPhone = (phone ?? "").trim();
  const normalizedOtp = (otp ?? "").trim();

  const socialAuth = async (provider: "google" | "apple", idToken: string) => {
    setIsLoading(true);
    try {
      const result = await api.socialLogin(provider, idToken, mode === "register" ? "BlueBird User" : undefined);
      onAuthenticated(result.access_token);
    } catch (error) {
      Alert.alert("Social login failed", error instanceof Error ? error.message : "Try phone login.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const onGooglePress = async () => {
    setIsLoading(true);
    try {
      // returnUrl uses exp:// so ASWebAuthenticationSession intercepts it directly —
      // no auth.expo.io proxy needed. The backend handles the full OAuth code exchange.
      const returnUrl = Linking.createURL("auth");
      const oauthUrl = `${apiBase}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, returnUrl);

      if (result.type !== "success") return;

      const qs = result.url.split("?")[1] ?? "";
      const token = new URLSearchParams(qs).get("token");
      if (!token) {
        Alert.alert("Google login failed", "No token returned.");
        return;
      }
      onAuthenticated(token);
    } catch (error) {
      Alert.alert("Google login failed", error instanceof Error ? error.message : "Try phone login.");
    } finally {
      setIsLoading(false);
    }
  };

  const onApplePress = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Apple Sign-In", "Apple Sign-In is available on iOS devices.");
      return;
    }
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });
      if (!credential.identityToken) {
        throw new Error("No Apple identity token returned.");
      }
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const result = await api.socialLogin("apple", credential.identityToken, fullName || undefined);
      onAuthenticated(result.access_token);
    } catch (error) {
      Alert.alert("Apple login failed", error instanceof Error ? error.message : "Try phone login.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestCode = async () => {
    if (!normalizedPhone) {
      Alert.alert("Missing phone", "Enter your phone number in +92 format.");
      return;
    }
    setIsLoading(true);
    try {
      await api.requestOtp(normalizedPhone);
      Alert.alert(
        "OTP Sent",
        __DEV__
          ? "Use the code from SMS, or your backend DEV_OTP in local dev."
          : "Enter the verification code sent to your phone."
      );
    } catch (error) {
      Alert.alert("OTP failed", error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!normalizedPhone || !normalizedOtp) {
      Alert.alert("Missing details", "Enter both phone and OTP code.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await api.verifyOtp(
        normalizedPhone,
        normalizedOtp,
        mode === "register" ? "BlueBird User" : undefined
      );
      onAuthenticated(result.access_token);
    } catch (error) {
      Alert.alert("Verification failed", error instanceof Error ? error.message : "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BlueBirdLogo width={250} height={170} />
      <Text style={styles.brand}>BlueBird</Text>
      <Text style={styles.tagline}>Mountain transport made easy</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === "login" ? styles.modeButtonActive : null]}
          onPress={() => setMode("login")}
        >
          <Text style={[styles.modeButtonText, mode === "login" ? styles.modeButtonTextActive : null]}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "register" ? styles.modeButtonActive : null]}
          onPress={() => setMode("register")}
        >
          <Text style={[styles.modeButtonText, mode === "register" ? styles.modeButtonTextActive : null]}>Register</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{ctaText}</Text>
        <Pressable style={[styles.providerButton, isLoading ? styles.disabled : null]} onPress={onGooglePress}>
          <Text style={styles.providerText}>Google</Text>
        </Pressable>
        <Pressable style={[styles.providerButton, isLoading ? styles.disabled : null]} onPress={onApplePress}>
          <Text style={styles.providerText}>Apple</Text>
        </Pressable>
        <View style={styles.phoneBlock}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
            placeholder="+923001234567"
            style={styles.phoneInput}
          />
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholder="Enter OTP"
            style={styles.phoneInput}
          />
          <View style={styles.phoneRow}>
            <Pressable style={[styles.phoneAction, isLoading ? styles.disabled : null]} onPress={requestCode}>
              <Text style={styles.phoneActionText}>Request Code</Text>
            </Pressable>
            <Pressable style={[styles.phoneActionPrimary, isLoading ? styles.disabled : null]} onPress={verifyCode}>
              <Text style={styles.phoneActionPrimaryText}>{mode === "login" ? "Login" : "Register"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    backgroundColor: color.bg
  },
  brand: { ...type.brand, color: color.ink, textAlign: "center" },
  tagline: {
    marginTop: space.xs,
    color: color.muted,
    textAlign: "center",
    fontSize: type.subtitle.fontSize
  },
  modeRow: { flexDirection: "row", marginTop: space.xl, gap: space.sm, alignSelf: "center", width: "100%" },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    paddingVertical: 10
  },
  modeButtonActive: { backgroundColor: color.accentDark, borderColor: color.accentDark },
  modeButtonText: { textAlign: "center", color: color.body, fontWeight: "600" },
  modeButtonTextActive: { color: color.onAccent },
  card: {
    marginTop: space.lg,
    alignSelf: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.lg,
    backgroundColor: color.surfaceCard,
    gap: space.sm
  },
  cardTitle: { ...type.title, fontSize: 20, color: color.ink },
  providerButton: {
    borderWidth: 1,
    borderColor: color.borderMuted,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingVertical: 12
  },
  providerText: { textAlign: "center", color: color.inkSecondary, fontWeight: "600" }
  ,
  phoneBlock: {
    marginTop: space.sm,
    gap: space.sm
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: color.inkSecondary
  },
  phoneRow: { flexDirection: "row", gap: space.sm },
  phoneAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.borderMuted,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingVertical: 11
  },
  phoneActionText: { textAlign: "center", color: color.inkSecondary, fontWeight: "600" },
  phoneActionPrimary: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: color.accentDark,
    paddingVertical: 11
  },
  phoneActionPrimaryText: { textAlign: "center", color: color.onAccent, fontWeight: "700" },
  disabled: { opacity: 0.6 }
});
