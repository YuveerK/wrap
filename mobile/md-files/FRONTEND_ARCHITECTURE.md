# Mobile Best Practices

A practical guide for this Expo app (`expo ~54.0.8`, `react-native 0.81.5`, `react 19.1.0`, `@react-navigation/native 7.2.4`, `@react-navigation/stack 7.9.2`).

Adapted to your specific stack — Expo SDK 54, React Native 0.81 on the New Architecture by default, React 19, and a manually-configured React Navigation setup (not Expo Router).

---

## Table of Contents

1. [The Big-Picture Decision: Expo Router vs React Navigation](#1-the-big-picture-decision-expo-router-vs-react-navigation)
2. [Project Structure](#2-project-structure)
3. [Navigation (React Navigation v7)](#3-navigation-react-navigation-v7)
4. [Data Fetching & API Calls](#4-data-fetching--api-calls)
5. [State Management](#5-state-management)
6. [Styling](#6-styling)
7. [Forms & Validation](#7-forms--validation)
8. [Performance](#8-performance)
9. [Error Handling & Crash Reporting](#9-error-handling--crash-reporting)
10. [Storage & Secure Secrets](#10-storage--secure-secrets)
11. [Environment Variables & Config](#11-environment-variables--config)
12. [Building & Releasing](#12-building--releasing)
13. [Testing](#13-testing)
14. [Recommended Additions to package.json](#14-recommended-additions-to-packagejson)

---

## 1. The Big-Picture Decision: Expo Router vs React Navigation

Worth raising up front because you've made an unusual choice for a brand-new Expo SDK 54 project.

You're using **manual React Navigation** (`@react-navigation/native` + `@react-navigation/stack`). That's the React Native default for years and still completely valid — React Navigation v7 is actively maintained and Expo Router is literally built on top of it. But for a new Expo project in 2026, the community default has shifted to Expo Router (file-based routing, like Next.js App Router).

**The honest tradeoff:**

|              | React Navigation (your setup)                      | Expo Router                                                |
| ------------ | -------------------------------------------------- | ---------------------------------------------------------- |
| Routing      | Imperative — you wire up `Stack.Screen` components | File-based — `app/profile.js` becomes the `/profile` route |
| Deep linking | Manual `linking` config                            | Automatic from file paths                                  |
| Auth flows   | Conditionally render whole navigator trees         | Route groups: `(auth)/`, `(app)/`                          |
| Web parity   | Possible but rough                                 | First-class                                                |
| Boilerplate  | More                                               | Less                                                       |
| Control      | Maximum                                            | Convention-led                                             |

**Should you switch?** If you've already built screens, no — it's not worth the migration. React Navigation will be supported for years. But if you're early enough that there's nothing meaningful yet, consider running `npx create-expo-app` with the default template and porting your work — you'd save yourself a lot of plumbing later, especially for deep links and auth.

> **Note on imports**: Starting SDK 55 / Expo Router v6, the Expo team forked the bits of React Navigation they depend on into `expo-router` directly. The runtime API didn't change, but if you do migrate later, imports like `@react-navigation/native-stack` shift to `expo-router`. Your current `@react-navigation/stack` imports are fine — they're the legacy JS stack and still work.

The rest of this guide assumes you're sticking with manual React Navigation. Most of it applies either way.

---

## 2. Project Structure

You don't have one yet. Here's a structure that scales from "5 screens" to "50 screens" without being painful to refactor:

```
mobile/
├── app.json
├── index.js
├── babel.config.js
├── jsconfig.json
├── .env
├── .env.example
├── src/
│   ├── App.js                     # root: providers, navigation container
│   ├── screens/                   # one folder per screen
│   │   ├── HomeScreen/
│   │   │   ├── HomeScreen.js
│   │   │   ├── HomeScreen.styles.js
│   │   │   └── components/        # screen-local components
│   │   ├── ProfileScreen/
│   │   └── LoginScreen/
│   ├── navigation/
│   │   ├── RootNavigator.js       # stack definitions
│   │   ├── AuthNavigator.js
│   │   ├── AppNavigator.js
│   │   └── linking.js             # deep link config
│   ├── components/                # shared, reusable UI
│   │   ├── Button/
│   │   ├── TextInput/
│   │   └── Screen/
│   ├── api/                       # all network calls
│   │   ├── client.js              # fetch wrapper
│   │   ├── users.js
│   │   └── jobs.js
│   ├── hooks/                     # custom hooks
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   ├── store/                     # global state (zustand/context)
│   ├── theme/                     # colors, spacing, typography
│   │   ├── colors.js
│   │   ├── spacing.js
│   │   └── typography.js
│   ├── lib/                       # utilities, not react
│   │   ├── format.js
│   │   └── storage.js
│   └── constants/
│       └── config.js              # parsed env vars
└── assets/                        # images, fonts
```

**Two rules that prevent most messes:**

1. **A component lives where it's used.** If only `HomeScreen` uses `WelcomeBanner`, put it in `screens/HomeScreen/components/`. Only promote to `src/components/` when a second screen needs it.
2. **No `import '../../../components/Button'`.** Set up path aliases — see section 2.1.

### 2.1 Path aliases

Resolves the `../../../../` nightmare. Without TypeScript, the setup is just Babel + a `jsconfig.json` for editor IntelliSense.

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: { "@": "./src" },
        },
      ],
    ],
  };
};
```

```json
// jsconfig.json — for VS Code IntelliSense
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

```bash
npm i -D babel-plugin-module-resolver
```

Now `import { Button } from '@/components/Button'` works from anywhere, and VS Code autocompletes the paths.

### 2.2 Type hints with JSDoc (optional, but worth it)

Since the backend is JS, keeping the mobile JS too means consistency for you. You can still get a lot of TS's benefits without the build complexity by using JSDoc comments — VS Code reads them and gives you autocomplete + inline errors.

```js
/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {number} salary
 */

/**
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export async function fetchJob(jobId) {
  return apiClient.get(`/jobs/${jobId}`);
}
```

You can even enable `"checkJs": true` in `jsconfig.json` to get type errors in JS files. Strong recommend for navigation params specifically (see section 3.1) — typed `route.params` is the single biggest source of bugs in untyped RN apps.

---

## 3. Navigation (React Navigation v7)

### 3.1 Document your navigation params with JSDoc

Without TypeScript you lose the strong typing of navigators, but you can still get autocomplete and avoid silent bugs by documenting params with JSDoc and being disciplined about it.

```js
// src/navigation/params.js
/**
 * Central reference for navigation params.
 * Every screen should match the shape declared here.
 *
 * @typedef {Object} ScreenParams
 * @property {undefined} Home
 * @property {{ userId: string }} Profile
 * @property {{ jobId: string, from?: 'search' | 'list' }} JobDetail
 * @property {undefined} Login
 */
export const SCREENS = /** @type {const} */ ({
  Home: "Home",
  Profile: "Profile",
  JobDetail: "JobDetail",
  Login: "Login",
});
```

```js
// src/screens/ProfileScreen/ProfileScreen.js
import { useRoute } from "@react-navigation/native";

/**
 * @typedef {Object} ProfileRouteParams
 * @property {string} userId
 */

export function ProfileScreen() {
  /** @type {{ params: ProfileRouteParams }} */
  const route = useRoute();
  const { userId } = route.params;
  // ...
}
```

It's not as airtight as TS, but a single JSDoc comment per screen catches most of the bugs that matter (typos in param names, forgetting required params). Add `"checkJs": true` to your `jsconfig.json` and the editor will flag mismatches.

If this discipline doesn't hold across the team, just be defensive in screens:

```js
export function ProfileScreen({ route }) {
  const userId = route?.params?.userId;
  if (!userId) {
    // navigate back, show error, etc.
    return <ErrorView message="Missing user ID" />;
  }
  // ...
}
```

### 3.2 You're using `@react-navigation/stack` — a few things to know

The JS stack is fine and a deliberate choice. It's more customizable than `native-stack` (custom transitions, fine-grained gesture control, easier per-screen header tweaks) at the cost of running animations on the JS thread.

A few things that matter specifically for the JS stack:

**Enable native screens.** This is the single biggest performance win without switching libraries — `react-native-screens` (already in your deps) optimizes memory by letting native handle screen unmounting:

```js
// At the top of your entry file (index.js or App.js)
import { enableScreens } from "react-native-screens";
enableScreens();
```

In Expo SDK 54 this is enabled by default, but worth confirming. Without it, all your screens stay in memory forever.

**Use `gestureEnabled` thoughtfully.** Swipe-back is on by default, which is great on iOS. On Android it can conflict with custom gestures — disable per-screen where needed:

```js
<Stack.Screen
  name="Checkout"
  component={CheckoutScreen}
  options={{ gestureEnabled: false }}
/>
```

**For heavy lists or animation-heavy screens**, watch frame rates in dev — the JS thread is shared with your animation logic. If you hit performance issues, `native-stack` is an escape hatch. But premature switching is premature optimization.

### 3.3 Wrap NavigationContainer with providers in the right order

Order matters. Gesture handler must be outermost. Safe area provider should be high in the tree.

```jsx
// src/App.js
import "react-native-gesture-handler"; // MUST be first import
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### 3.4 Split auth and app navigators

Don't conditionally render screens inside one stack. Render entirely different navigator trees based on auth state. This avoids leaking authenticated screens into the back stack after logout.

```jsx
// src/navigation/RootNavigator.js
export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return user ? <AppNavigator /> : <AuthNavigator />;
}
```

### 3.5 Set up deep linking explicitly

Even with React Navigation (no auto-routing), deep links are easy and you should configure them now. Otherwise you'll be retrofitting when marketing asks for "open the app to the user profile from an email link."

```js
// src/navigation/linking.js
export const linking = {
  prefixes: ["myapp://", "https://myapp.example.com"],
  config: {
    screens: {
      Home: "",
      Profile: "user/:userId",
      JobDetail: "jobs/:jobId",
      Login: "login",
    },
  },
};
```

```jsx
<NavigationContainer linking={linking}>
```

### 3.6 Always use `SafeAreaView` from `react-native-safe-area-context`

Not the one from `react-native`. Yours is already correctly listed. Wrap every screen:

```jsx
import { SafeAreaView } from "react-native-safe-area-context";

export function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      {/* content */}
    </SafeAreaView>
  );
}
```

For Android 16 / SDK 54, **edge-to-edge is now mandatory** — you cannot disable it. So safe area handling matters more than ever.

---

## 4. Data Fetching & API Calls

### 4.1 Don't fetch in `useEffect` by hand. Use TanStack Query.

The single most impactful library to add to a React Native app. Caching, retries, refetching on focus, loading/error states, pagination — all handled.

```bash
npx expo install @tanstack/react-query
```

```jsx
// src/App.js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false, // mobile doesn't have "window focus"
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>;
```

```js
// src/api/jobs.js
import { apiClient } from "./client";

export async function fetchJob(jobId) {
  return apiClient.get(`/jobs/${jobId}`);
}
```

```jsx
// in a screen
import { useQuery } from "@tanstack/react-query";

function JobDetailScreen({ route }) {
  const { jobId } = route.params;
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(jobId),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorView error={error} />;
  return <JobView job={job} />;
}
```

Refetching when the screen regains focus is one line:

```js
import { useFocusEffect } from "@react-navigation/native";

useFocusEffect(
  useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
  }, []),
);
```

### 4.2 One central API client

Don't sprinkle `fetch()` calls everywhere. One client, one place to add auth headers, one place to handle errors.

```js
// src/api/client.js
import { config } from "@/constants/config";
import { getAuthToken } from "@/lib/auth";

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, init = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? res.statusText,
    );
  }
  return res.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { ApiError };
```

This mirrors the error shape from the backend guide (`{ error: { code, message } }`) — keep them consistent.

### 4.3 Handle network failures gracefully

Mobile networks fail. Constantly. Every screen that fetches needs a "no connection" path. TanStack Query gives you `error` for free — render it.

```bash
npx expo install @react-native-community/netinfo
```

```js
import NetInfo from "@react-native-community/netinfo";

const unsubscribe = NetInfo.addEventListener((state) => {
  if (!state.isConnected) {
    // show a banner
  }
});
```

---

## 5. State Management

### 5.1 Reach for state libraries last, not first

The biggest mistake in React Native apps is reaching for Redux/Zustand/Jotai on day one. The hierarchy:

1. **Local state** (`useState`) — almost everything starts here
2. **Server state** (TanStack Query) — anything that came from the API
3. **Lifted state / Context** — when 2-3 components need the same local value
4. **Global state library** — only when context becomes unwieldy

Most of what people put in Redux is actually server state, which belongs in TanStack Query (with refetching and cache invalidation), not in a global store.

### 5.2 If you need global state, pick Zustand

You're already on Zustand at Jobox, so this is muscle memory. It works identically in React Native.

```bash
npm i zustand
```

```js
// src/store/auth.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

Avoid Redux unless you have a specific reason — for a fresh app it's pure overhead.

### 5.3 Don't put auth tokens in state. Put them in SecureStore.

State is in memory and rebuilds on hot reload. Use `expo-secure-store` for tokens — see section 10.

---

## 6. Styling

### 6.1 Define a theme. Don't sprinkle hex codes.

```js
// src/theme/colors.js
export const colors = {
  primary: "#FF8A08", // Jobox orange, sticking with what you know
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#222831",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  danger: "#DC2626",
  success: "#16A34A",
};
```

```js
// src/theme/spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

Reference these everywhere. When the designer changes the primary color, you change one line.

### 6.2 Pick a styling approach and stick to it

Three reasonable options for SDK 54:

- **StyleSheet (built-in)** — zero deps, works everywhere, verbose. Fine for small apps.
- **NativeWind v4** — Tailwind for React Native. Best DX if you like Tailwind. Universal (web + native).
- **Unistyles** — gaining traction in 2026, great theme/variant support, no compile step.

Avoid `styled-components` for new apps — performance is worse than alternatives and the community has largely moved on.

```bash
# If you want NativeWind:
npm install nativewind tailwindcss
```

### 6.3 Dark mode from day one

Even if you don't ship it day one, the structure should support it. Use `useColorScheme()` and pass the theme down. Retrofitting dark mode later is painful.

```js
import { useColorScheme } from "react-native";

const scheme = useColorScheme(); // 'light' | 'dark' | null
const themedColors = scheme === "dark" ? darkColors : lightColors;
```

For SDK 54+, also set `userInterfaceStyle` in `app.json`:

```json
{
  "expo": {
    "userInterfaceStyle": "automatic"
  }
}
```

### 6.4 Use `Pressable`, not `TouchableOpacity`

`TouchableOpacity` is legacy. `Pressable` is the modern primitive with proper press state, hit slop, and accessibility.

```jsx
<Pressable
  onPress={handlePress}
  hitSlop={8}
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
>
  <Text>Tap me</Text>
</Pressable>
```

---

## 7. Forms & Validation

### 7.1 Use react-hook-form + zod

Hand-rolling forms with `useState` for each field becomes painful past 3 fields. `react-hook-form` is the standard, and `zod` for validation matches what we set up on the backend.

```bash
npm i react-hook-form zod @hookform/resolvers
```

```jsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
});

function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}
      <Pressable disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
        <Text>Log in</Text>
      </Pressable>
    </>
  );
}
```

### 7.2 Always configure the keyboard properly

Tiny details users notice without knowing why:

```jsx
<TextInput
  keyboardType="email-address"      // shows email keyboard
  autoCapitalize="none"             // emails aren't capitalized
  autoCorrect={false}               // turn off autocorrect for emails, names, passwords
  autoComplete="email"              // OS suggests saved emails
  textContentType="emailAddress"    // iOS-specific autofill hint
  returnKeyType="next"              // "next" button on keyboard
/>

<TextInput
  secureTextEntry
  autoComplete="password"
  textContentType="password"
  returnKeyType="done"
/>
```

### 7.3 Handle the keyboard

The keyboard covers inputs by default. Use `KeyboardAvoidingView` or, better, [`react-native-keyboard-controller`](https://github.com/kirillzyusko/react-native-keyboard-controller) for production-grade handling.

```bash
npx expo install react-native-keyboard-controller
```

---

## 8. Performance

### 8.1 You're on the New Architecture — keep it that way

SDK 54 enables Fabric + TurboModules by default. **SDK 55 removes the legacy architecture entirely** — there is no opt-out. Don't disable it. Check dependency compatibility with:

```bash
npx expo-doctor
```

This integrates with React Native Directory and flags any libraries that are incompatible or untested with the new architecture.

### 8.2 FlatList, not ScrollView, for lists

For anything longer than a screen height. ScrollView renders every child upfront — fine for 10 items, terrible for 1000.

```jsx
<FlatList
  data={jobs}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <JobCard job={item} />}
  // these flags meaningfully improve performance:
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  // for big lists, FlashList is dramatically better — see 8.3
/>
```

### 8.3 For long lists, use FlashList

Shopify's drop-in replacement. Often 5–10x faster than FlatList for complex rows.

```bash
npx expo install @shopify/flash-list
```

```jsx
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={jobs}
  renderItem={({ item }) => <JobCard job={item} />}
  estimatedItemSize={120}
/>;
```

### 8.4 Memoize list items, not everything

`React.memo` everywhere is cargo-culting. But list item components are the one place it's almost always worth it — they re-render every time the parent list changes.

```jsx
export const JobCard = React.memo(function JobCard({ job }) {
  return ( /* ... */ );
});
```

And memoize the `renderItem` callback:

```js
const renderItem = useCallback(({ item }) => <JobCard job={item} />, []);
```

### 8.5 Use `react-native-reanimated` for animations

The built-in `Animated` API runs on the JS thread and stutters under load. Reanimated runs animations on the UI thread.

```bash
npx expo install react-native-reanimated
```

(Note: `react-native-gesture-handler` — already in your deps — pairs with it.)

### 8.6 Image performance

The built-in `Image` is slow for many images at once. Use `expo-image` instead — it has caching, blurhash placeholders, and is significantly faster.

```bash
npx expo install expo-image
```

```jsx
import { Image } from "expo-image";

<Image
  source={{ uri: profilePicUrl }}
  placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>;
```

### 8.7 Avoid inline functions/objects in render where it matters

A `style={{ ... }}` object inline is fine for one-off components. For list items rendering 1000 times, it creates 1000 new objects per render. Move it to `StyleSheet.create()` or memoize.

### 8.8 Don't measure performance in dev mode

Dev mode runs the JS bundle un-minified with extra checks. Always benchmark in a release build:

```bash
npx expo run:ios --configuration Release
npx expo run:android --variant release
```

---

## 9. Error Handling & Crash Reporting

### 9.1 An error boundary at the top of the tree

Otherwise an uncaught render error gives users a blank white screen with no recourse.

```jsx
// src/components/ErrorBoundary.js
import React from "react";
import { View, Text, Button } from "react-native";

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // report to Sentry / crash reporter
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong.</Text>
          <Button
            title="Try again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }
    return this.props.children;
  }
}
```

Wrap your `<App>` and optionally individual screens.

### 9.2 Add crash reporting

You cannot debug what you can't see. Sentry is the standard.

```bash
npx expo install @sentry/react-native
```

```js
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/123",
  enableAutoSessionTracking: true,
  // don't send in dev
  enabled: !__DEV__,
});

export default Sentry.wrap(App);
```

Sentry's `wrap` HOC adds error boundary + performance monitoring + navigation breadcrumbs.

### 9.3 Differentiate "expected" from "unexpected" errors

Just like on the backend. An API returning 404 is expected — show "Not found". A `TypeError` is unexpected — log to Sentry, show a generic error.

```js
if (error instanceof ApiError && error.status === 404) {
  return <EmptyState message="Not found" />;
}
// Unexpected — log it
Sentry.captureException(error);
return <ErrorState />;
```

---

## 10. Storage & Secure Secrets

Three storage options, with strict rules about what goes in which:

| Library                                     | Use for                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| `expo-secure-store`                         | Auth tokens, refresh tokens, anything secret               |
| `@react-native-async-storage/async-storage` | Non-sensitive user prefs, cached data                      |
| `react-native-mmkv`                         | High-performance KV storage (10x faster than AsyncStorage) |

```bash
npx expo install expo-secure-store @react-native-async-storage/async-storage
```

### 10.1 Tokens go in SecureStore — always

```js
// src/lib/auth.js
import * as SecureStore from "expo-secure-store";

export async function saveAuthToken(token) {
  await SecureStore.setItemAsync("authToken", token);
}

export async function getAuthToken() {
  return SecureStore.getItemAsync("authToken");
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync("authToken");
}
```

SecureStore uses iOS Keychain and Android Keystore — encrypted at rest.

### 10.2 Never use AsyncStorage for secrets

It's plaintext on disk and easily readable on jailbroken devices.

---

## 11. Environment Variables & Config

### 11.1 Use the right prefix

Expo only exposes env vars prefixed with `EXPO_PUBLIC_` to the client. **Anything not prefixed isn't bundled.** This is the right default — but it also means anything prefixed is **public** and shipped in the app bundle.

```
# .env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SENTRY_DSN=https://...
```

**Do not put secrets in `EXPO_PUBLIC_*` vars** — they're decompilable from the shipped app. If something must be secret, it belongs on the backend, not the mobile app.

### 11.2 Centralize config access

```js
// src/constants/config.js
function required(name, value) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const config = {
  apiUrl: required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL),
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  isDev: __DEV__,
};
```

### 11.3 Multiple environments via app variants

For dev / staging / prod with different API URLs and bundle IDs, use Expo's app variant pattern in `app.config.js`:

```js
// app.config.js
const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

module.exports = {
  name: IS_DEV ? "MyApp (Dev)" : IS_PREVIEW ? "MyApp (Preview)" : "MyApp",
  slug: "myapp",
  ios: {
    bundleIdentifier: IS_DEV
      ? "com.yuveer.myapp.dev"
      : IS_PREVIEW
        ? "com.yuveer.myapp.preview"
        : "com.yuveer.myapp",
  },
  android: {
    package: IS_DEV
      ? "com.yuveer.myapp.dev"
      : IS_PREVIEW
        ? "com.yuveer.myapp.preview"
        : "com.yuveer.myapp",
  },
};
```

This lets you install dev + prod side-by-side on the same device.

---

## 12. Building & Releasing

### 12.1 Move to development builds, away from Expo Go

Expo Go is great for learning but is a dead-end for production apps. The official guidance is to move to **development builds** as soon as you need any native module not in the Expo Go bundle (which is most non-trivial apps — including SecureStore in some flows, BLE, custom native code, etc.).

```bash
npm install -g eas-cli
eas init
eas build:configure
eas build --profile development --platform ios
eas build --profile development --platform android
```

A development build is your own custom version of Expo Go with whatever native modules your app actually needs. You install it once on your device and then `expo start` connects to it the same way Expo Go does.

### 12.2 EAS Build for everything

Stop trying to build locally with Xcode/Android Studio. EAS builds in the cloud, handles signing, and integrates with the stores.

```jsonc
// eas.json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_VARIANT": "development" },
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_VARIANT": "preview" },
    },
    "production": {
      "env": { "APP_VARIANT": "production" },
    },
  },
  "submit": {
    "production": {},
  },
}
```

### 12.3 Use EAS Update for OTA fixes

For JS-only fixes, EAS Update lets you push updates without a store submission. Configure once, ship in minutes.

```bash
npx expo install expo-updates
eas update:configure
eas update --branch production --message "Fix login error"
```

Critical caveat: **You cannot OTA-update native code.** If you change `app.json`, add a native module, or upgrade SDK version, you need a new binary.

### 12.4 Pin your SDK version

You're on `expo ~54.0.8` — the `~` allows patch updates, which is fine. But upgrade SDK versions **one at a time**: 54 → 55 → 56, not 54 → 56. The Expo team explicitly recommends this because cross-version compatibility issues compound.

When you upgrade, run:

```bash
npx expo install --check       # checks all expo packages are SDK-compatible
npx expo-doctor                # validates dependencies
```

### 12.5 Edge-to-edge is now mandatory on Android

SDK 54 forces edge-to-edge on all Android apps. Your screens will draw behind the status bar and navigation bar by default. Test on Android — you'll likely need to add `SafeAreaView` to screens that didn't need it before.

---

## 13. Testing

### 13.1 Three layers, in order of ROI

1. **Linting** — ESLint with `eslint-config-expo`. Catches a lot of common bugs cheaply.
2. **Component tests** — `@testing-library/react-native` + Jest. Test screens by simulating taps and assertions on what users see.
3. **E2E tests** — Maestro (modern, YAML-based) or Detox (older but battle-tested). Slow to write, slow to run, but catches the bugs that matter most.

### 13.2 Set up Jest + RNTL

```bash
npx expo install jest jest-expo @testing-library/react-native
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

```jsx
// src/screens/LoginScreen/LoginScreen.test.js
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "./LoginScreen";

test("shows error on empty submit", async () => {
  const { getByText, findByText } = render(<LoginScreen />);
  fireEvent.press(getByText("Log in"));
  expect(await findByText("Invalid email")).toBeTruthy();
});
```

### 13.3 E2E: Maestro is the easier option in 2026

Detox works but is fiddly to set up. Maestro is a YAML script:

```yaml
# .maestro/login.yaml
appId: com.yuveer.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Log in"
- assertVisible: "Welcome"
```

```bash
brew install maestro
maestro test .maestro/login.yaml
```

---

## 14. Recommended Additions to `package.json`

```json
{
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "doctor": "npx expo-doctor"
  },
  "dependencies": {
    "@react-navigation/native": "^7.2.4",
    "@react-navigation/stack": "^7.9.2",
    "@react-native-async-storage/async-storage": "*",
    "@react-native-community/netinfo": "*",
    "@sentry/react-native": "*",
    "@shopify/flash-list": "*",
    "@tanstack/react-query": "^5.0.0",
    "expo": "~54.0.8",
    "expo-image": "*",
    "expo-secure-store": "*",
    "expo-status-bar": "~3.0.9",
    "expo-updates": "*",
    "react": "19.1.0",
    "react-hook-form": "^7.0.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "*",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "*",
    "babel-plugin-module-resolver": "^5.0.0",
    "eslint": "^9.0.0",
    "eslint-config-expo": "*",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.0.0",
    "jest-expo": "*",
    "prettier": "^3.0.0"
  }
}
```

Use `npx expo install` (not `npm install`) for any package that needs an SDK-specific version — it picks the version compatible with your SDK 54.

Keeping `@react-navigation/stack` is fine. It's a deliberate choice for more transition/gesture customization, and SDK 54's New Architecture + `react-native-screens` integration means the perf gap to `native-stack` is narrower than it used to be.

---

## Priority Order if You're Just Starting

1. **Project structure with `src/` and path aliases** (sections 2, 2.1)
2. **JSDoc typing for navigation params + split auth/app navigators** (sections 3.1, 3.4)
3. **API client + TanStack Query** (sections 4.1, 4.2)
4. **SecureStore for tokens, env var hygiene** (sections 10.1, 11)
5. **Error boundary + Sentry** (sections 9.1, 9.2)
6. **Theme + design system primitives** (section 6)
7. **Use `Pressable` everywhere** (section 6.4)
8. **EAS Build + development build** (section 12.1)
9. **Tests** — once you've shipped something to break

Everything else is incremental.

---

## A Few Things to Know About Your Current SDK

- **SDK 54 is the last release with the legacy architecture.** New architecture is on by default. SDK 55 removes the legacy option entirely.
- **iOS builds are ~10x faster** in SDK 54 thanks to precompiled XCFrameworks. Good time to be starting.
- **Android is edge-to-edge mandatory.** Plan safe-area handling on every screen.
- **Expo Go for SDK 55 was delayed** by Apple review in May 2026. Default `create-expo-app` will keep using SDK 54 for a while. You're on a fine version.
- **`expo-av` is deprecated** — `expo-video` and `expo-audio` replace it. Doesn't affect you yet but worth knowing if you add media features.
