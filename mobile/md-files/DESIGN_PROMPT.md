# Wrap Mobile — Claude Code Design Prompt

Paste this entire document at the start of any Claude Code session that involves building or modifying UI in the Wrap mobile app. It gives the model everything it needs to produce consistent, premium output without needing correction.

---

## 0. What You Are Building

**Wrap** is a private neighbourhood community app for managed estates, gated complexes, and residential parks. It replaces fragmented WhatsApp group chats with a structured, permanent home for neighbourhood information.

**Three core features:**
1. **Community Feed** — a noticeboard for residents to post time-sensitive neighbourhood updates (road closures, load-shedding, events, safety alerts). Committee members can pin critical posts.
2. **Issue Reporting** — residents log infrastructure faults (potholes, water leaks, electrical, waste) and track their status through `REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED`.
3. **Profile & Roles** — three tiers: `RESIDENT` (read/post/support), `COMMITTEE` (manage issues, pin posts), `ADMIN` (full control).

**The emotional register:** Warm, trustworthy, immediate. A resident opening the app should feel like checking in on their neighbourhood — not using enterprise software. The design must feel premium but neighbourly, never cold or corporate.

**The user:** Non-technical adults who use WhatsApp daily. The UI must be completely self-evident. Every action should require zero learning.

---

## 1. Tech Stack & Hard Constraints

```
Expo SDK:        ~54.0.8
React Native:    0.81.5
React:           19.1.0
Navigation:      @react-navigation/native v7 + @react-navigation/bottom-tabs + @react-navigation/stack
Data fetching:   @tanstack/react-query v5
Forms:           react-hook-form + zod
State:           zustand
Icons:           @expo/vector-icons (Ionicons ONLY)
Styling:         React Native StyleSheet (no styled-components, no Tailwind)
```

**What is NOT installed — do not use or suggest:**
- `expo-linear-gradient` — no gradient library available
- `expo-blur` — no blur library available
- `react-native-reanimated` — use `Animated` from `react-native` only
- `react-native-svg` — no SVG support
- `expo-image` — use the built-in `Image` from `react-native`
- Any other package not listed above

**You must achieve premium visual quality using only:** `View`, `Text`, `Image`, `Pressable`, `Animated`, `StyleSheet`, `Platform`, `FlatList`, `ScrollView`, `RefreshControl`, `ActivityIndicator`, and `Ionicons`.

---

## 2. File & Import Conventions

```js
// Path aliases — always use these, never relative paths like ../../
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { scrollContentBelowHeader, scrollViewStyle } from "@/theme/screenLayout";
import { SCREENS } from "@/navigation/params";
import { Screen } from "@/components/Screen/Screen";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
```

---

## 3. The Theme System

### 3.1 useTheme() — the only way to access design tokens

```js
const { colors, semantic, isDark, scheme, preference, setPreference } = useTheme();
```

| Property | Type | Description |
|---|---|---|
| `colors` | object | All theme colour tokens |
| `semantic` | object | Context-specific colour overrides |
| `isDark` | boolean | `true` when dark mode is active |
| `scheme` | `"light" \| "dark"` | Resolved colour scheme |
| `preference` | `"system" \| "light" \| "dark"` | User's explicit preference |
| `setPreference` | function | Change the user's theme preference |

### 3.2 colours — exact hex values

| Token | Light | Dark |
|---|---|---|
| `colors.primary` | `#FF8A08` | `#FF8A08` |
| `colors.background` | `#FFFFFF` | `#111827` |
| `colors.surface` | `#F5F5F5` | `#1F2937` |
| `colors.text` | `#222831` | `#F9FAFB` |
| `colors.textMuted` | `#6B7280` | `#9CA3AF` |
| `colors.border` | `#E5E7EB` | `#374151` |
| `colors.danger` | `#DC2626` | `#F87171` |
| `colors.success` | `#16A34A` | `#4ADE80` |

### 3.3 semantic — context-specific overrides

These are the **only** cases where you should use a raw hex instead of a theme token. They are pre-computed and live in `@/theme/semantic.js`.

| Token | Light | Dark | Use in |
|---|---|---|---|
| `semantic.feedListBackground` | `#F5F7FB` | `#111827` | FlatList screen background (cooler than pure white) |
| `semantic.cardBackground` | `#FFFFFF` | `#1A2236` | Elevated card background (deeper than `surface` in dark) |
| `semantic.postBodyText` | `#374151` | `#B8C4D8` | Long-form body text (lower contrast for comfortable reading) |
| `semantic.footerDivider` | `#F0F2F6` | `#2A3450` | 1px divider inside white/dark cards |
| `semantic.heroBackground` | `#FFF7ED` | `#1F2937` | Warm tinted section backgrounds |
| `semantic.emptyStateRing` | `#FFF7ED` | `#1F2937` | Outermost ring in empty state icon containers |

**Rule:** If a colour you need is not in `colors.*` or `semantic.*`, add it to `semantic.js` and document it there before using it. Never scatter raw hex values in component files.

---

## 4. Design Tokens

### 4.1 Spacing

```js
import { spacing } from "@/theme/spacing";
// xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
```

**Derived values** — use these constants, not magic numbers:
```js
const H_PAD = spacing.md + 4;  // 20px — standard horizontal card padding
const CARD_RADIUS = 22;         // canonical large card border radius
```

Never use a raw number for padding/margin/gap unless it is one of the derived values above or documented in this file.

### 4.2 Typography scale

```js
import { typography } from "@/theme/typography";
// typography.title:    { fontSize: 24, fontWeight: "700" }
// typography.subtitle: { fontSize: 18, fontWeight: "600" }
// typography.body:     { fontSize: 16, fontWeight: "400" }
// typography.caption:  { fontSize: 14, fontWeight: "400" }
```

**Extended scale** (when the base tokens are too coarse):

| Use | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Community / page heading | 26 | 800 | -0.8 | 32 |
| Section title | 20 | 800 | -0.4 | — |
| Post title | 18 | 800 | -0.6 | 26 |
| Author name | 15 | 700 | -0.1 | — |
| CTA button text | 16 | 700 | -0.2 | — |
| Eyebrow / category label | 11.5 | 700 | +1.0 | — |
| Timestamp / meta | 12.5 | 500 | — | — |
| Pinned badge | 11 | 700 | +0.8 | — |
| Post body (long-form) | 15 | 400 | +0.1 | 23 |
| Stat value | 14 | 700 | -0.2 | — |

**Rules:**
- Eyebrow labels: always `textTransform: "uppercase"`, `letterSpacing: 1`
- Pinned badges: always `textTransform: "uppercase"`, `letterSpacing: 0.8`
- Long-form text always has explicit `lineHeight`
- `fontWeight` values allowed: `"400"`, `"500"`, `"600"`, `"700"`, `"800"` only

### 4.3 Border radius

| Value | Use |
|---|---|
| 8 | Inputs, skeleton bones, small tags |
| 10 | IssueCard, compact content cards |
| 17 | Icon badges in headers |
| 22 | `CARD_RADIUS` — FeedPostCard and all major content cards |
| 25 | Avatar outer ring (half of 50px) |
| 30 | FAB (half of 60px) |
| 31 | Empty state icon circle (half of 62px) |
| 999 | All pill shapes — category chips, stat rows, CTA buttons |

**Rule:** `borderRadius: 999` is the ONLY correct pill shape. Never use 50, 100, or any other large number for pills.

### 4.4 Shadows & elevation

**Card shadow (standard):**
```js
...Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
  },
  android: { elevation: 3 },
}),
```

**FAB shadow (strong, coloured glow):**
```js
// Set shadowColor to colors.primary for orange glow
shadowColor: colors.primary,
...Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  android: { elevation: 10 },
}),
```

---

## 5. Critical Patterns

### 5.1 The Shadow Wrapper Pattern — MANDATORY for cards

`overflow: "hidden"` clips iOS shadows. Every card that needs **both a visible shadow AND clipped internal content** (e.g. a full-bleed strip, a banner image) MUST use this two-layer structure:

```jsx
{/* Layer 1 — shadow caster. No overflow. backgroundColor must match card. */}
<View style={[styles.shadow, { shadowColor, backgroundColor: cardBg }]}>
  {/* Layer 2 — content clipper. overflow:hidden clips children to borderRadius. */}
  <Pressable onPressIn={onPressIn} onPressOut={onPressOut}
    style={[styles.card, { backgroundColor: cardBg }]}
  >
    {/* Full-bleed content (pinned strip, banner image) goes here and is clipped cleanly */}
    {/* Padded content goes here */}
  </Pressable>
</View>

// Styles:
shadow: {
  borderRadius: CARD_RADIUS,        // same radius as card
  // iOS shadow props here
},
card: {
  borderRadius: CARD_RADIUS,
  overflow: "hidden",               // clips children
},
```

**backgroundColor must be identical on both layers.** They appear as a single surface.

### 5.2 Spring Press Animation — MANDATORY for interactive cards

```js
import { useRef, useCallback } from "react";
import { Animated } from "react-native";

const scale = useRef(new Animated.Value(1)).current;

const onPressIn = useCallback(() => {
  Animated.spring(scale, {
    toValue: 0.982,
    useNativeDriver: true,
    tension: 400,
    friction: 20,
  }).start();
}, [scale]);

const onPressOut = useCallback(() => {
  Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
    tension: 400,
    friction: 20,
  }).start();
}, [scale]);
```

```jsx
<Animated.View style={{ transform: [{ scale }] }}>
  {/* shadow wrapper + card content */}
</Animated.View>
```

**Do not change:** `toValue: 0.982`, `tension: 400`, `friction: 20`. These are calibrated. Changes require visual review.

### 5.3 Skeleton Pulse Animation

```js
function usePulse() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

// Usage in a skeleton bone:
const bg = pulse.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
<Animated.View style={[styles.bone, { backgroundColor: bg }, style]} />

// Bone colours:
const from = isDark ? "#232F45" : "#E8ECF2";
const to   = isDark ? "#2E3F5C" : "#F4F6FA";
```

`useNativeDriver: false` is required — `backgroundColor` cannot run on the native thread.

### 5.4 Avatar Ring

```jsx
const avatarBg = getAvatarColor(String(author?.id ?? name));

<View style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}>
  <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
    <Text style={styles.initials}>
      {getInitials(author?.firstName, author?.lastName)}
    </Text>
  </View>
</View>

// Styles:
avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2,
              alignItems: "center", justifyContent: "center" },
avatar:     { width: 44, height: 44, borderRadius: 22,
              alignItems: "center", justifyContent: "center" },
initials:   { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: -0.3 },
```

Import from `@/lib/formatRelativeTime`. Always pass `String(user.id)` as the seed — IDs are stable, names are not.

### 5.5 Layered Ring Empty State

```jsx
<View style={styles.iconContainer}>
  <View style={[styles.ring3, { backgroundColor: semantic.emptyStateRing }]} />
  <View style={[styles.ring2, { backgroundColor: isDark ? "#243347" : "#FDDEBF" }]} />
  <View style={[styles.ring1, { backgroundColor: `${colors.primary}22` }]} />
  <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
    <Ionicons name="chatbubbles" size={34} color="#FFF" />
  </View>
</View>

iconContainer: { width: 128, height: 128, alignItems: "center", justifyContent: "center" },
ring3:  { position: "absolute", width: 128, height: 128, borderRadius: 64 },
ring2:  { position: "absolute", width: 100, height: 100, borderRadius: 50 },
ring1:  { position: "absolute", width: 78,  height: 78,  borderRadius: 39 },
iconCircle: { width: 62, height: 62, borderRadius: 31,
              alignItems: "center", justifyContent: "center" },
```

### 5.6 Pill CTA Button (empty state / standalone)

```jsx
<Pressable
  onPress={onPress}
  style={({ pressed }) => [
    styles.cta,
    { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
  ]}
>
  <Ionicons name="create-outline" size={18} color="#FFF" />
  <Text style={styles.ctaText}>Action label</Text>
</Pressable>

cta:     { flexDirection: "row", alignItems: "center", gap: 8,
           paddingHorizontal: spacing.xl + 4, paddingVertical: spacing.md,
           borderRadius: 999 },
ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
```

### 5.7 Category / Status Chip Selector

```jsx
{OPTIONS.map((opt) => (
  <Pressable
    key={opt.value}
    onPress={() => setSelected(opt.value)}
    style={[
      styles.chip,
      {
        backgroundColor: selected === opt.value ? colors.primary : colors.surface,
        borderColor:     selected === opt.value ? colors.primary : colors.border,
      },
    ]}
  >
    <Text style={[styles.chipText, { color: selected === opt.value ? "#FFF" : colors.text }]}>
      {opt.label}
    </Text>
  </Pressable>
))}

chip:     { paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
            borderRadius: 999, borderWidth: 1 },
chipText: { fontSize: 14, fontWeight: "600" },
```

### 5.8 FAB (Floating Action Button)

```jsx
<Pressable
  onPress={onPress}
  style={({ pressed }) => [
    styles.fab,
    {
      backgroundColor: colors.primary,
      bottom: tabBarHeight + spacing.md,
      shadowColor: colors.primary,   // orange glow
    },
    pressed && styles.fabPressed,
  ]}
  accessibilityRole="button"
  accessibilityLabel="Write a new post"
>
  <Ionicons name="create" size={26} color="#FFFFFF" />
</Pressable>

fab: {
  position: "absolute", right: spacing.md,
  width: 60, height: 60, borderRadius: 30,
  alignItems: "center", justifyContent: "center",
  ...Platform.select({
    ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24 },
    android: { elevation: 10 },
  }),
},
fabPressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
```

---

## 6. Screen Structure

### 6.1 All screens — mandatory wrapper

```jsx
import { Screen } from "@/components/Screen/Screen";

// List/feed screen:
<Screen edges={["top"]} padded={false} backgroundColor={semantic.feedListBackground}>

// Form screen under stack header:
<Screen edges={[]} padded={false}>
  <ScrollView style={scrollViewStyle} contentContainerStyle={scrollContentBelowHeader}>
    {/* FormField components */}
  </ScrollView>
</Screen>

// Auth screen (vertically centred):
<Screen edges={["top", "bottom"]} padded={false}>
  <ScrollView style={scrollViewStyle} contentContainerStyle={scrollContentFullScreen}>
    {/* form */}
  </ScrollView>
</Screen>
```

**Never** use `<SafeAreaView>` directly — always use `<Screen>`.

### 6.2 Feed / list screen anatomy

```
Screen (edges=["top"], padded=false, backgroundColor=semantic.feedListBackground)
└── View (flex:1)
    ├── FlatList
    │   ├── ListHeaderComponent
    │   │   ├── PageHeader (community name, eyebrow, stats)
    │   │   └── SectionRow (title + optional "Updating…" indicator)
    │   ├── renderItem → Card component
    │   ├── ItemSeparatorComponent → <View style={{ height: spacing.md }} />
    │   ├── ListEmptyComponent → EmptyState component
    │   ├── contentContainerStyle → paddingHorizontal: spacing.md, paddingBottom: tabBarHeight + 72
    │   └── RefreshControl (tintColor: colors.primary)
    └── FAB (position: absolute, right: spacing.md, bottom: tabBarHeight + spacing.md)
```

### 6.3 Section row (above list items)

```jsx
<View style={styles.sectionRow}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest</Text>
  {isFetching && !isRefetching
    ? <Text style={[styles.syncing, { color: colors.textMuted }]}>Updating…</Text>
    : null}
</View>

sectionRow:   { flexDirection: "row", alignItems: "center",
                justifyContent: "space-between", marginBottom: spacing.sm + 2,
                paddingHorizontal: spacing.xs },
sectionTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4, color: colors.text },
syncing:      { fontSize: 12.5, fontWeight: "600", color: colors.textMuted },
```

---

## 7. State Handling Rules

These determine what the user sees. Follow the decision tree exactly — never deviate.

```
Data loading for the first time (isLoading && items.length === 0)?
  → Show the Skeleton component (not ActivityIndicator)

Loading failed with no cached data (!!error && items.length === 0)?
  → Show <ErrorView message={...} onRetry={refetch} /> inside a <Screen>

Loaded list is empty?
  → Show the EmptyState component via ListEmptyComponent

Pull-to-refresh running (isRefetching)?
  → RefreshControl handles it. Do NOT swap list for skeleton.

Background refetch (isFetching && !isRefetching)?
  → Show "Updating…" text in the section row. Do NOT show skeleton.

Mutation in flight?
  → Disable the submit button. Change label to "Saving…".
```

---

## 8. Icons

**Library:** Ionicons from `@expo/vector-icons`. No other icon sets.

```js
import { Ionicons } from "@expo/vector-icons";
```

**Size reference:**

| Size | Context |
|---|---|
| 11–12 | Inline badge icons |
| 14 | Stat row, metadata |
| 17–19 | Card footer actions |
| 20 | Header icon badges, tab bar |
| 22–24 | Tab bar active state, main actions |
| 26 | FAB |
| 34–36 | Empty state feature icon |

**Colour reference:**

| Colour | Use |
|---|---|
| `colors.primary` | Active tab, accent icons, CTA icons |
| `colors.textMuted` | Footer actions, stats, metadata |
| `"#FFFFFF"` | Icons on orange or dark backgrounds |

**Active vs inactive:** Filled icon (`"newspaper"`) for active/selected. Outline (`"newspaper-outline"`) for inactive/secondary.

---

## 9. Dark Mode — Non-Negotiable Rules

1. Every component must work correctly in both modes.
2. Use `colors.*` tokens for all standard surfaces, text, and borders.
3. Use `semantic.*` tokens for the six documented override cases.
4. Use `isDark` only to switch between the two values of a semantic token inline.
5. Hard-coded hex values in component files are a bug unless they are `"#FFFFFF"` (on a coloured background) or initials text colours.

**Checklist before submitting any component:**
- [ ] All backgrounds: `colors.background`, `colors.surface`, or `semantic.*`
- [ ] All text: `colors.text` or `colors.textMuted`
- [ ] All borders: `colors.border` or `semantic.footerDivider`
- [ ] Icons: `colors.primary`, `colors.textMuted`, or `"#FFFFFF"`
- [ ] Tested in simulator with dark mode toggled on

---

## 10. Design Philosophy in Practice

### What "premium" means for Wrap specifically

**Premium is not:** Gradients, glassmorphism, complex animations, heavy use of the brand colour, decorative elements.

**Premium is:** Precise whitespace, confident typography hierarchy, subtle shadows, physics-based interactions, and every element earning its place.

Apply these five principles to every screen:

**1. Content hierarchy is everything.**
A resident scanning the feed should know within 0.5 seconds which post is most important. Achieve this through size contrast (large title vs small body), weight contrast (800 vs 400), and colour contrast (text vs textMuted) — not colour or decoration.

**2. Orange is a signal, not decoration.**
`colors.primary` should appear 2–3 times per screen maximum: the active tab, the FAB, and one key accent. When orange appears everywhere, it appears nowhere.

**3. Whitespace is a design element.**
Cards need breathing room. The gap between the card edge and the content inside it (H_PAD = 20px) feels generous on purpose. Resist the urge to fill space.

**4. Every interaction must be felt.**
Every tappable surface gets a spring press animation or an opacity press state. A UI that doesn't respond to touch feels broken, even if it technically works. No silent taps.

**5. Dark mode is not an afterthought.**
The dark theme uses `#1A2236` for cards (deeper than `#1F2937` surface) specifically to create the same depth contrast as the light theme's white cards on `#F5F7FB`. If you just invert colours, you lose the depth. Use `semantic.cardBackground` always.

---

## 11. Anti-patterns — Never Do These

### Visual anti-patterns

```js
// ❌ Hard-coded hex in a component
backgroundColor: "#FFFFFF"

// ✓ Use the semantic token
backgroundColor: semantic.cardBackground

// ❌ Inconsistent pill radius
borderRadius: 50

// ✓ The only correct pill
borderRadius: 999

// ❌ Orange used decoratively
<View style={{ backgroundColor: colors.primary }}>  // non-CTA element
  <Text style={{ color: colors.primary }}>Welcome</Text>

// ✓ Orange on CTAs and key accents only
<Pressable style={{ backgroundColor: colors.primary }}>  // button or FAB

// ❌ Arbitrary spacing
marginTop: 12

// ✓ Token-based
marginTop: spacing.sm  // or spacing.md, etc.
```

### Shadow anti-patterns

```js
// ❌ overflow:hidden on the shadow view (clips iOS shadow)
shadow: {
  borderRadius: 22,
  overflow: "hidden",       // BUG — shadow is clipped
  shadowOpacity: 0.07,
}

// ✓ overflow:hidden ONLY on the inner content layer
shadow: { borderRadius: 22, shadowOpacity: 0.07 },      // outer
card:   { borderRadius: 22, overflow: "hidden" },        // inner

// ❌ Same shadow weight for everything
elevation: 3  // used on FAB

// ✓ Differentiated depth
// Cards: elevation 3 / shadowOpacity 0.07
// FAB:   elevation 10 / shadowOpacity 0.4
```

### Animation anti-patterns

```js
// ❌ Timing animation for press (feels mechanical)
Animated.timing(scale, { toValue: 0.95, duration: 100 }).start()

// ✓ Spring animation (feels physical)
Animated.spring(scale, { toValue: 0.982, tension: 400, friction: 20, useNativeDriver: true }).start()

// ❌ Animating backgroundColor on native thread
Animated.timing(bg, { toValue: 1, useNativeDriver: true })  // will crash

// ✓ useNativeDriver: false for color animations
Animated.timing(bg, { toValue: 1, useNativeDriver: false })

// ❌ Creating Animated.Value inside the render function
// (recreated on every render — animation breaks)
style={{ transform: [{ scale: new Animated.Value(1) }] }}

// ✓ useRef — created once
const scale = useRef(new Animated.Value(1)).current;
```

### Typography anti-patterns

```js
// ❌ Invented font sizes
fontSize: 13  // not in the scale

// ✓ Use documented extended scale values

// ❌ Positive letter-spacing on large headings
fontSize: 26, letterSpacing: 0.5  // looks cheap

// ✓ Negative letter-spacing on large headings
fontSize: 26, letterSpacing: -0.8

// ❌ Missing lineHeight on body text
fontSize: 15  // text will be cramped

// ✓ Explicit lineHeight for body
fontSize: 15, lineHeight: 23
```

### State anti-patterns

```js
// ❌ ActivityIndicator for list loading
{isLoading && <ActivityIndicator />}

// ✓ Skeleton for first load
{isLoading && posts.length === 0 && <FeedSkeleton />}

// ❌ Replacing the list with skeleton on refresh
{isRefetching ? <FeedSkeleton /> : <FlatList ... />}

// ✓ RefreshControl handles pull-to-refresh
<FlatList refreshControl={<RefreshControl refreshing={isRefetching} />} />

// ❌ Enable submit button during loading (allows double submit)
<Button onPress={submit} />

// ✓ Disable during loading
<Button onPress={submit} disabled={isLoading} title={isLoading ? "Saving…" : "Save"} />
```

---

## 12. Step-by-Step Process for Any New Screen or Component

Follow these steps in order. Do not skip.

**Step 1 — Understand the user's job-to-be-done.**
What decision or action does this screen enable? Who is doing it (RESIDENT / COMMITTEE / ADMIN)? How urgent is it? This shapes the visual hierarchy.

**Step 2 — Identify the screen type.**
- List/feed screen → `Screen` + `FlatList` + `FAB`
- Form screen → `Screen` + `ScrollView` + `scrollContentBelowHeader`
- Auth screen → `Screen` + `ScrollView` + `scrollContentFullScreen`
- Detail screen → `Screen` + `ScrollView` with custom header section

**Step 3 — Define the component tree before writing styles.**
Sketch the hierarchy: what wraps what, what data flows where.

**Step 4 — Apply the shadow wrapper pattern to every elevated card.**
Check: does this card have any full-bleed content (strip, image) that needs clipping? If yes, mandatory two-layer structure.

**Step 5 — Wire interactions before styling.**
Add spring press animation. Add `hitSlop` to small touch targets. Add `accessibilityRole` and `accessibilityLabel` to Pressables.

**Step 6 — Apply tokens bottom-up.**
Spacing first, then typography, then colour. Never start with colour — it distracts from structure decisions.

**Step 7 — Dark mode audit.**
Toggle dark mode in the simulator. Check every surface, text, border, and icon.

**Step 8 — Loading/error/empty states.**
Every screen that fetches data needs all three states designed before the task is complete.

---

## 13. Complete Component Reference

| Component | Location | Key props |
|---|---|---|
| `Screen` | `@/components/Screen/Screen` | `edges`, `padded`, `backgroundColor` |
| `Button` | `@/components/Button/Button` | `title`, `onPress`, `variant`, `disabled` |
| `TextInput` | `@/components/TextInput/TextInput` | `label`, `error`, `value`, `onChangeText` |
| `FormField` | `@/components/FormField/FormField` | `control`, `name`, `label`, `errors` |
| `Loading` | `@/components/Loading/Loading` | none — fullscreen spinner |
| `ErrorView` | `@/components/ErrorView/ErrorView` | `message`, `onRetry` |
| `ErrorBoundary` | `@/components/ErrorBoundary/ErrorBoundary` | wraps app root only |
| `FeedPostCard` | `@/components/FeedPostCard/FeedPostCard` | `post`, `onPress`, `onLike`, `onComment` |
| `FeedSkeleton` | `@/components/FeedSkeleton/FeedSkeleton` | none |
| `IssueCard` | `@/components/IssueCard/IssueCard` | `issue`, `onPress` |
| `StatusTimeline` | `@/components/StatusTimeline/StatusTimeline` | `updates` |

---

## 14. Data Fetching Pattern

```js
const { data, isLoading, error, refetch, isRefetching, isFetching } = useQuery({
  queryKey: ["resource-name"],
  queryFn: api.listResource,
  staleTime: 1000 * 60,  // 1 min default; 5 min for slow-changing data
});

const items = data?.items ?? [];
const showSkeleton = isLoading && items.length === 0;
const showError    = !!error && items.length === 0 && !showSkeleton;
```

After mutations, invalidate the query:
```js
const queryClient = useQueryClient();
await queryClient.invalidateQueries({ queryKey: ["resource-name"] });
```

---

*Reference: `mobile/md-files/DESIGN_SYSTEM.md` for the full design system and `mobile/md-files/FRONTEND_ARCHITECTURE.md` for architecture decisions.*
