# Mobile EAS setup

This guide covers local checks and copy/paste commands for EAS environment variables and Android preview builds.

## 1) Confirm EAS is ready locally

```bash
npx eas --version
npx eas whoami
```

Expected:
- `eas-cli` prints a version.
- `whoami` returns your Expo account.

## 2) Verify project/profile consistency

Current config in this repo:
- EAS build profiles in [`eas.json`](../../eas.json): `development`, `preview`, `production`
- Expo project owner in [`app.json`](../../app.json): `furqanalis-organization`
- Expo Android package in [`app.json`](../../app.json): `com.bluebird.app`
- EAS project ID in [`app.json`](../../app.json): `fab6efa7-cedf-4335-9887-d2ff939150b1`

If you ever change `android.package` or `owner`, make the same change in Expo/EAS dashboard and OAuth clients.

## 3) Set EAS environment variables (preview)

Replace placeholders before running:

```bash
npx eas env:create preview --name EXPO_PUBLIC_API_URL --value "https://api-preview.example.com/api" --scope project --visibility plaintext --non-interactive
npx eas env:create preview --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "<preview-android-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create preview --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "<preview-ios-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create preview --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "<preview-web-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create preview --name EXPO_PUBLIC_GOOGLE_REDIRECT_URI --value "https://auth.expo.io/@furqanalis-organization/bluebird" --scope project --visibility plaintext --non-interactive
```

## 4) Set EAS environment variables (production)

Replace placeholders before running:

```bash
npx eas env:create production --name EXPO_PUBLIC_API_URL --value "https://api.example.com/api" --scope project --visibility plaintext --non-interactive
npx eas env:create production --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "<prod-android-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create production --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "<prod-ios-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create production --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "<prod-web-client-id>.apps.googleusercontent.com" --scope project --visibility sensitive --non-interactive
npx eas env:create production --name EXPO_PUBLIC_GOOGLE_REDIRECT_URI --value "https://auth.expo.io/@furqanalis-organization/bluebird" --scope project --visibility plaintext --non-interactive
```

If a variable already exists, re-run with `--force`.

## 5) Build preview Android

Run the preflight first, then build:

```bash
npm run eas:preflight
npm run eas:build:preview:android
```

Equivalent raw command:

```bash
npx eas build --platform android --profile preview
```

## Troubleshooting: Google OAuth SHA-1 mismatch (release/EAS builds)

Symptom: Google login fails on preview/production APK/AAB, while working on local debug builds.

Checklist:
1. Confirm your Android package is exactly `com.bluebird.app` in Expo config and Google OAuth client.
2. Add **all relevant SHA-1 fingerprints** to the Android OAuth client in Google Cloud Console:
   - EAS/Play app signing certificate SHA-1 (release)
   - Upload key SHA-1 (if applicable)
   - Local debug keystore SHA-1 (for local dev)
3. Wait a few minutes for Google credential propagation.
4. Rebuild with EAS after SHA changes.

Helpful commands for local/dev SHA-1 checks:

```bash
keytool -list -v -keystore "$HOME/.android/debug.keystore" -alias androiddebugkey -storepass android -keypass android | rg "SHA1"
```

To inspect known credentials in EAS:

```bash
npx eas credentials -p android
```

Dashboard/manual steps still required:
- Google Cloud Console: update Android OAuth client fingerprints.
- Google Play Console (if using Play App Signing): retrieve signing SHA-1.
