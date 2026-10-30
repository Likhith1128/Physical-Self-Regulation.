# Physical-Self-Regulation.

PSR is a patient companion app for the Physical Self-Regulation (PSR) treatment for jaw muscle pain (mTMD). It runs on **Android, iOS, and the web** from a single [Expo](https://expo.dev) / React Native codebase.

## Features

**Session 1: clenching awareness and stretching**
- Education on parafunctional habits (clenching) and the relaxed jaw position.
- Choose monitoring strategies: a recurring phone alarm, everyday habits as check-in anchors (presets plus custom ones), and tracking of clenching episodes.
- Recurring jaw check-in notifications at a configurable interval during waking hours (Android and iOS). Tapping one opens a quick "Are you clenching?" check-in.
- Three guided stretches for the masseters, neck, and upper back, with step-by-step instructions, a rep/hold/rest timer, and logging toward the **5×/day** goal.
- A "This exercise increases my pain" button that discontinues the exercise and asks the patient to tell their interventionist.

**Session 2: review, breathing, and planning**
- Homework review: stretch adherence, average clenching episodes per day, check-ins, and pain since Session 1, plus a reflection note.
- Diaphragmatic breathing instructions and an animated breathing pacer (4 s in, 6 s out). Sessions default to **15 minutes**, toward a goal of **2 sessions (30 min) per day**.
- Optional twice-daily breathing reminders.
- Treatment planning: a goal checklist and session notes.

**Daily tracking and progress**
- Today dashboard: a clenching-episode counter, jaw check-ins, stretch and breathing progress, and a daily 0–10 pain rating.
- Progress charts over 7, 14, or 30 days, and a shareable text report for the interventionist.
- All data stays on the device (AsyncStorage).

> The exercise descriptions live in `src/lib/content.ts` and can be edited to match the exact instructions given by the research team's physical therapists.

## Running locally

Requires Node.js 20 or later.

```bash
npm install
npm run web       # open in a browser
npm run android   # Android emulator/device (Expo Go or a development build)
npm run ios       # iOS simulator/device (macOS)
```

Scan the QR code from `npx expo start` with Expo Go to try the app on a phone. Scheduled notifications behave best in a development or production build (`npx expo run:android` / `npx expo run:ios`).

## Building for release

Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli@latest build --platform android   # .aab for Google Play
npx eas-cli@latest build --platform ios       # .ipa for the App Store
npm run build:web                             # static site in dist/
```

The `dist/` folder can be deployed to any static host (Netlify, Vercel, GitHub Pages, …).

## Project structure

```
src/app/            Screens (Expo Router)
  (tabs)/           Today, Session 1, Session 2, Progress
  exercise/[id].tsx Guided stretch
  breathing.tsx     Breathing pacer
  checkin.tsx       Jaw check-in
  auth.tsx          Sign up / sign in
src/components/     Shared UI
src/lib/            Content, persisted store, reminders, stats
```

## Checks

```bash
npm run typecheck
npx expo-doctor
```
