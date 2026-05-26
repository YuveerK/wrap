# Wrap Mobile — Design System

This document is the single source of truth for all visual and interaction decisions in the Wrap mobile app. Every new screen, component, and pattern should reference and conform to these guidelines.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing](#4-spacing)
5. [Border Radius](#5-border-radius)
6. [Shadows & Elevation](#6-shadows--elevation)
7. [Iconography](#7-iconography)
8. [Avatar System](#8-avatar-system)
9. [Animation & Interaction](#9-animation--interaction)
10. [Dark Mode](#10-dark-mode)
11. [Layout & Screen Anatomy](#11-layout--screen-anatomy)
12. [Core Components](#12-core-components)
13. [Feed Components](#13-feed-components)
14. [Community / Issues Components](#14-community--issues-components)
15. [Form Components](#15-form-components)
16. [Feedback & State Components](#16-feedback--state-components)
17. [Navigation Patterns](#17-navigation-patterns)
18. [Issue & Status System](#18-issue--status-system)
19. [Utility Functions](#19-utility-functions)
20. [Do & Don't](#20-do--dont)

---

## 1. Design Philosophy

**Premium, purposeful, neighbourhood-first.**

The Wrap app connects real neighbours. Every design decision should feel warm, trustworthy, and easy to act on quickly — even for non-technical users. Concretely:

- **Clarity over decoration.** Whitespace and hierarchy earn more than gradients or decorative elements.
- **Content is king.** Cards exist to serve the content inside them, not to show off the design.
- **Consistent physics.** All interactions use spring animations so the app feels alive and responsive.
- **One brand colour.** Orange (`#FF8A08`) is used only for primary actions, key accents, and status indicators. Overusing it dilutes its signal value.
- **Dark mode is a first-class citizen.** Every token has an explicit dark-mode counterpart. Hard-coded hex values that do not adapt are a bug.

---

## 2. Color System

### 2.1 Theme Tokens

Access colours exclusively via `useTheme()`. Never reach for a raw hex value inside a component unless it is documented as an intentional override below.

```js
import { useTheme } from "@/theme";
const { colors, scheme } = useTheme();
```

| Token         | Light           | Dark      | Usage |
|---------------|-----------------|-----------|-------|
| `primary`     | `#FF8A08`       | `#FF8A08` | CTAs, FABs, active tabs, accent highlights |
| `background`  | `#FFFFFF`       | `#111827` | Screen/page background |
| `surface`     | `#F5F5F5`       | `#1F2937` | Cards, inputs, secondary containers |
| `text`        | `#222831`       | `#F9FAFB` | Primary body & heading text |
| `textMuted`   | `#6B7280`       | `#9CA3AF` | Labels, timestamps, secondary info |
| `border`      | `#E5E7EB`       | `#374151` | Dividers, input borders, separator lines |
| `danger`      | `#DC2626`       | `#F87171` | Errors, destructive actions |
| `success`     | `#16A34A`       | `#4ADE80` | Confirmation, resolved states |

### 2.2 Semantic Overrides (intentional raw values)

These are documented exceptions where a raw hex is acceptable because they must remain constant across both colour schemes or don't map to a theme token.

| Context | Value | Reason |
|---|---|---|
| Feed list background (light) | `#F5F7FB` | Slightly cooler than `background` to contrast white cards |
| Card background (dark) | `#1A2236` | Deeper than `surface` for stronger card depth in dark mode |
| Post body text (light) | `#374151` | Slightly softer than `text` for long-form reading comfort |
| Post body text (dark) | `#B8C4D8` | Lower contrast than `text` for comfortable dark-mode reading |
| Pinned strip background | `` `${colors.primary}12` `` | 7% opacity orange tint — always relative to primary |
| Avatar ring border | `` `${avatarBg}50` `` | 31% opacity of the avatar's own colour — always relative |
| Footer divider (dark) | `#2A3450` | Between `surface` and card bg — no theme token for this depth |
| Footer divider (light) | `#F0F2F6` | Subtler than `border` inside white cards |

### 2.3 Avatar Colour Palette

Seven deterministic colours used by the avatar system (§8). These are fixed and must not be changed arbitrarily — existing users already have assigned colours.

```
#FF8A08  Orange  (primary)
#2563EB  Blue
#7C3AED  Purple
#DB2777  Pink
#059669  Green
#D97706  Amber
#0891B2  Cyan
```

### 2.4 Issue Status Colours

Fixed semantic colours that are independent of the theme (§18).

```
REPORTED      #6B7280  Gray
ACKNOWLEDGED  #2563EB  Blue
IN_PROGRESS   #D97706  Amber
RESOLVED      #16A34A  Green
CLOSED        #374151  Dark gray
```

---

## 3. Typography

### 3.1 Scale

Defined in `src/theme/typography.js`. Import with:

```js
import { typography } from "@/theme";
```

| Token | Size | Weight | Use |
|---|---|---|---|
| `title` | 24 px | 700 | Screen headings |
| `subtitle` | 18 px | 600 | Section headings, card titles |
| `body` | 16 px | 400 | Default body copy |
| `caption` | 14 px | 400 | Labels, meta info |

### 3.2 Extended Scale (in-component)

When the token scale is insufficient, use these documented extensions. Do not invent new values without adding them here.

| Use | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Community name (header) | 26 px | 800 | −0.8 | 32 |
| Post title | 18 px | 800 | −0.6 | 26 |
| Section title | 20 px | 800 | −0.4 | — |
| Author name | 15 px | 700 | −0.1 | — |
| Eyebrow / label | 11.5 px | 700 | +1.0 | — |
| Timestamp | 12.5 px | 500 | — | — |
| Pinned badge text | 11 px | 700 | +0.8 | — |
| Stat value | 14 px | 700 | −0.2 | — |
| Post body | 15 px | 400 | +0.1 | 23 |
| CTA button text | 16 px | 700 | −0.2 | — |

### 3.3 Rules

- **Eyebrow labels** are always `textTransform: "uppercase"` with `letterSpacing: 1`.
- **Pinned badges** are always `textTransform: "uppercase"` with `letterSpacing: 0.8`.
- **Never** use a `fontWeight` outside of: `"400"`, `"500"`, `"600"`, `"700"`, `"800"`.
- **Never** set `fontSize` to an odd value unless it matches a value in the extended scale above.
- Long-form content (post body, descriptions) always sets `lineHeight` explicitly.

---

## 4. Spacing

Defined in `src/theme/spacing.js`. Import with:

```js
import { spacing } from "@/theme";
```

| Token | Value | Common uses |
|---|---|---|
| `xs` | 4 px | Icon-to-text gap, tight internal gaps |
| `sm` | 8 px | Stack gap between related elements, list item separators |
| `md` | 16 px | Default horizontal screen padding, card internal padding |
| `lg` | 24 px | Section bottom padding, large vertical breathing room |
| `xl` | 32 px | Between major sections, empty state gaps |
| `xxl` | 48 px | Top padding of empty/error states |

### Derived Values

Some components use arithmetic on the base scale. Document these, never guess:

| Context | Value | Formula |
|---|---|---|
| Card horizontal padding | 20 px | `spacing.md + 4` |
| FAB from bottom | `tabBarHeight + spacing.md` | Dynamic — always relative to tab bar |
| List bottom padding | `tabBarHeight + 72` | Accounts for FAB clearance |
| Section title margin bottom | 10 px | `spacing.sm + 2` |

---

## 5. Border Radius

| Value | Usage |
|---|---|
| 8 px | Inputs, skeleton bones, small UI chips |
| 10 px | IssueCard, small content cards |
| 14 px | Status timeline dots area, small icon badges |
| 17 px | Community icon badge in FeedHeader |
| 22 px | FeedPostCard (the canonical large card radius) |
| 25 px | Avatar outer ring (half of 50 px diameter) |
| 30 px | FAB (half of 60 px diameter) |
| 31 px | Empty state icon circle (half of 62 px diameter) |
| 999 px | Pill buttons, stat chips, category selector chips |

**Rule:** `borderRadius: 999` is the canonical "pill" shape. Never use an arbitrarily large number like `100` or `50` for pill shapes — use `999`.

---

## 6. Shadows & Elevation

### 6.1 Card Shadow (standard)

Used by FeedPostCard and any elevated content card.

```js
...Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
  },
  android: {
    elevation: 3,
  },
}),
```

### 6.2 FAB Shadow (strong)

Used by the Floating Action Button. The `shadowColor` is set to `colors.primary` to create a warm orange glow.

```js
...Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  android: {
    elevation: 10,
  },
}),
// In the component:
shadowColor: colors.primary,
```

### 6.3 The Shadow Wrapper Pattern

**Critical for iOS:** `overflow: "hidden"` clips iOS shadows. Use a two-layer structure whenever a card needs both a visible shadow AND internal content that must be clipped to the border radius (e.g., a full-bleed strip inside a rounded card).

```jsx
{/* Outer: casts the shadow, no overflow clipping */}
<View style={[styles.shadow, { shadowColor, backgroundColor: cardBg }]}>
  {/* Inner: clips children to border radius */}
  <Pressable style={[styles.card, { backgroundColor: cardBg }]}>
    {/* content */}
  </Pressable>
</View>
```

```js
shadow: {
  borderRadius: CARD_RADIUS,
  // shadow styles here
},
card: {
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
},
```

The `backgroundColor` must be set on **both** layers so they appear as a single surface.

---

## 7. Iconography

**Library:** `@expo/vector-icons` — `Ionicons` set exclusively.

```js
import { Ionicons } from "@expo/vector-icons";
```

### 7.1 Standard Icon Sizes

| Size | Context |
|---|---|
| 11–12 px | Inline badges (pinned label icon) |
| 14 px | Stat row icons, small metadata |
| 17–19 px | Footer action icons |
| 20 px | Header icon badge, tab icons (inactive) |
| 22–24 px | Tab icons (active), main action icons |
| 26 px | FAB icon |
| 34–36 px | Empty state feature icon |
| 40 px | Large feature icons (inside ring containers) |

### 7.2 Standard Icon Colours

| Colour | Use |
|---|---|
| `colors.primary` | Active tab, accent/pinned icons, eyebrow icon |
| `colors.textMuted` | Footer actions, stat icons, secondary metadata |
| `"#FFFFFF"` | Icons on coloured backgrounds (FAB, avatar, icon badges) |

### 7.3 Icon Reference

| Icon name | Where used |
|---|---|
| `home` | Community header icon badge |
| `people` / `people-outline` | Member count stat |
| `document-text-outline` | Post count stat |
| `newspaper` / `newspaper-outline` | Feed tab |
| `alert-circle` / `alert-circle-outline` | Issues tab |
| `person` / `person-outline` | Profile tab |
| `pin` | Pinned post badge |
| `heart-outline` | Post like action |
| `chatbubble-outline` | Post comment action |
| `share-social-outline` | Post share action |
| `create` | FAB (compose) |
| `create-outline` | Empty state CTA |
| `chatbubbles` | Feed empty state feature icon |

Always use the `outline` variant for non-active/secondary states and the filled variant for active/primary states (matching the tab bar pattern).

---

## 8. Avatar System

User avatars are generated deterministically — no image uploads, no network requests.

### 8.1 Colour Assignment

```js
import { getAvatarColor } from "@/lib/formatRelativeTime";
const seed = String(author?.id ?? name); // prefer numeric ID for stability
const avatarBg = getAvatarColor(seed);
```

The function hashes the seed string to deterministically pick one of the 7 avatar colours (§2.3). The same user always gets the same colour.

### 8.2 Initials Extraction

```js
import { getInitials } from "@/lib/formatRelativeTime";
const initials = getInitials(author?.firstName, author?.lastName);
// Returns "?" when both are undefined/null
```

### 8.3 Avatar Ring (standard — FeedPostCard)

```jsx
<View style={[styles.avatarRing, { borderColor: `${avatarBg}50` }]}>
  <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
    <Text style={styles.initials}>{initials}</Text>
  </View>
</View>
```

```js
avatarRing: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderWidth: 2,
  alignItems: "center",
  justifyContent: "center",
},
avatar: {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
},
initials: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "800",
  letterSpacing: -0.3,
},
```

The ring border colour is the avatar background at 31% opacity (`${avatarBg}50` is hex alpha — `50` = ~31%). This creates a subtle halo effect without being heavy.

### 8.4 Fallback Name

```js
const name =
  [author?.firstName, author?.lastName].filter(Boolean).join(" ") ||
  "Neighbor";
```

Always fall back to `"Neighbor"` — never an empty string or `"Unknown"`.

---

## 9. Animation & Interaction

### 9.1 Spring Press Scale

Applied to any interactive card or pressable surface. Uses `Animated.spring` for a physical, snappy feel.

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
  <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
    {/* ... */}
  </Pressable>
</Animated.View>
```

**Parameters:**
- `toValue: 0.982` — subtle 1.8% shrink. Feels tactile without being dramatic.
- `tension: 400` — stiff spring for fast response.
- `friction: 20` — enough damping to prevent bounce.
- `useNativeDriver: true` — mandatory for `transform`.

### 9.2 FAB Press State

The FAB uses a `Pressable` `pressed` state rather than `Animated.spring`, because the shadow wrapper pattern is not needed here.

```jsx
<Pressable
  style={({ pressed }) => [
    styles.fab,
    pressed && styles.fabPressed,
    { backgroundColor: colors.primary, shadowColor: colors.primary },
  ]}
>
```

```js
fabPressed: {
  transform: [{ scale: 0.94 }],
  opacity: 0.9,
},
```

### 9.3 Skeleton Pulse Animation

Used in `FeedSkeleton`. A looping opacity interpolation between two bone colours.

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
```

`useNativeDriver: false` is required because we interpolate `backgroundColor` (a non-transform property).

### 9.4 Opacity Feedback (simple pressables)

For pressables that don't need a scale animation (e.g., the empty-state CTA):

```jsx
<Pressable
  style={({ pressed }) => [
    styles.cta,
    { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
  ]}
>
```

### 9.5 Rules

- **Always** use `useNativeDriver: true` for `transform` and `opacity` animations.
- **Never** animate `backgroundColor` with `useNativeDriver: true` — use `false` and accept the JS thread cost.
- **Never** use `setNativeProps` or direct state mutation for animations — use `Animated.Value`.
- Spring parameters (`tension: 400, friction: 20`) are the app standard. Only change them with strong visual justification.

---

## 10. Dark Mode

### 10.1 Accessing the Current Scheme

```js
const { colors, scheme } = useTheme();
const isDark = scheme === "dark";
```

### 10.2 Rules

1. **Never hard-code a colour** inside a component that is visible in both modes unless it is one of the documented semantic overrides in §2.2.
2. Use `colors.*` tokens for all standard surfaces, text, and borders.
3. Use `isDark` only for the documented semantic override cases (card bg, body text colour, divider colours inside cards).
4. All `borderColor`, `backgroundColor`, and `color` props should resolve to either a theme token or a documented override.

### 10.3 Checklist for New Components

- [ ] Card/container background uses `colors.surface` or documented override
- [ ] All text uses `colors.text` or `colors.textMuted`
- [ ] All borders use `colors.border` or documented override
- [ ] Icon colours are from the standard icon colour list (§7.2)
- [ ] Tested by toggling system dark mode in the simulator

---

## 11. Layout & Screen Anatomy

### 11.1 Screen Wrapper

Every screen uses the `Screen` component as its root:

```jsx
import { Screen } from "@/components/Screen/Screen";

<Screen edges={["top"]} padded={false} backgroundColor={listBg}>
  {/* content */}
</Screen>
```

| Prop | Default | Notes |
|---|---|---|
| `edges` | — | Pass `["top"]` for screens with a custom header; pass `["top", "bottom"]` for full safe area. |
| `padded` | `true` | Set `false` for full-bleed lists; handle padding per-section. |
| `backgroundColor` | `colors.background` | Override for screens that need a different background (e.g., feed list). |

### 11.2 Feed / List Screen Layout

```
┌─────────────────────────────────┐
│ [Safe area top]                 │
│                                 │
│  FeedHeader                     │
│  ─────────────────────────────  │
│  Section title         Syncing… │
│                                 │
│  ┌──────────────────────────┐   │
│  │  FeedPostCard            │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │  FeedPostCard            │   │
│  └──────────────────────────┘   │
│                                 │
│                      [ FAB  ]   │
│ [Tab bar]                       │
└─────────────────────────────────┘
```

- List horizontal padding: `spacing.md` (16 px)
- Card separator: `spacing.md` (16 px) — a plain `<View style={{ height: spacing.md }} />`
- Bottom list padding: `tabBarHeight + 72` so the last card is not hidden behind the FAB
- FAB position: `bottom: tabBarHeight + spacing.md`

### 11.3 Form Screen Layout (scrollable)

Used by CreatePost, CreateIssue, Register, etc.

```js
import { screenLayout } from "@/theme/screenLayout";
// scrollContentBelowHeader:
{
  paddingHorizontal: spacing.md,  // 16
  paddingTop: spacing.sm,         // 8
  paddingBottom: spacing.xl,      // 32
  gap: spacing.md,                // 16
  flexGrow: 1,
}
```

### 11.4 Auth Screen Layout (centered)

Used by Login, ForgotPassword, etc.

```js
// scrollContentFullScreen:
{
  ...scrollContentBelowHeader,
  justifyContent: "center",
}
```

---

## 12. Core Components

### 12.1 `Button`

**Location:** `src/components/Button/Button.js`

```jsx
<Button
  title="Save changes"
  onPress={handleSave}
  variant="primary"     // "primary" | "secondary" — default: "primary"
  disabled={false}
/>
```

| Variant | Background | Text colour | Border |
|---|---|---|---|
| `primary` | `colors.primary` | `#FFFFFF` | None |
| `secondary` | `colors.surface` | `colors.text` | 1 px `colors.border` |

- Border radius: 8 px
- Padding: 12 px vertical, 20 px horizontal
- Font: 16 px / 600 weight
- Pressed: opacity 0.85
- Disabled: opacity 0.5

### 12.2 `Screen`

**Location:** `src/components/Screen/Screen.js`

The mandatory root wrapper for all screens. Handles safe-area insets via `react-native-safe-area-context`.

```jsx
<Screen
  edges={["top"]}
  padded={false}
  backgroundColor={isDark ? colors.background : "#F5F7FB"}
>
```

### 12.3 `TextInput`

**Location:** `src/components/TextInput/TextInput.js`

```jsx
<TextInput
  label="Email address"
  value={email}
  onChangeText={setEmail}
  error="Invalid email"   // optional — shows below input in danger colour
  keyboardType="email-address"
  // all standard RN TextInput props are forwarded
/>
```

- Border radius: 8 px
- Border: 1 px `colors.border`, switches to `colors.danger` on error
- Background: `colors.surface`
- Padding: 10 px vertical, 16 px horizontal
- Label: 14 px / 500 weight / `colors.text`
- Error: 13 px / `colors.danger`

### 12.4 `FormField`

**Location:** `src/components/FormField/FormField.js`

Wraps `TextInput` with React Hook Form integration.

```jsx
<FormField
  control={control}
  name="email"
  label="Email address"
  errors={errors}
  keyboardType="email-address"
/>
```

Always use `FormField` (not bare `TextInput`) inside `react-hook-form` forms.

---

## 13. Feed Components

### 13.1 `FeedHeader`

**Location:** `src/screens/FeedScreen/components/FeedHeader.js`

Displays the community identity and aggregate stats. Used as the `ListHeaderComponent` in the feed.

```jsx
<FeedHeader
  communityName="Riverside Estate"
  postCount={24}
  memberCount={156}
/>
```

**Anatomy:**
1. Brand row: 54×54 px orange icon badge (border radius 17) + eyebrow + community name
2. Divider line (1 px, `borderTopColor` semantic override)
3. Stats row: `[icon] [number] [label]` pairs separated by a 1×14 px vertical rule

### 13.2 `FeedPostCard`

**Location:** `src/components/FeedPostCard/FeedPostCard.js`

The primary content surface of the app.

```jsx
<FeedPostCard post={post} />
```

**Post object shape:**
```ts
{
  id: number,
  author: { id: number, firstName: string, lastName: string },
  title?: string,
  body: string,
  pinned: boolean,
  createdAt: string, // ISO date string
}
```

**Anatomy (top to bottom):**
1. **Pinned strip** (conditional): full-bleed tinted row with pin icon + "Pinned post" label
2. **Author row**: avatar ring → initials circle → author name + timestamp
3. **Content**: optional title → body (5-line clamp)
4. **Footer divider** (1 px)
5. **Action row**: heart, comment, share icons with `hitSlop: 10`

**Structure rules:**
- Uses the shadow wrapper pattern (§6.3)
- `overflow: "hidden"` is on the inner `Pressable`, not the shadow `View`
- All content padding is `H_PAD = spacing.md + 4 = 20 px` (defined as a constant)
- Card border radius: 22 px (`CARD_RADIUS`)

### 13.3 `FeedSkeleton`

**Location:** `src/components/FeedSkeleton/FeedSkeleton.js`

Shown during initial load. Renders 3 skeleton cards that structurally mirror `FeedPostCard`.

```jsx
<FeedSkeleton />
```

Uses the `usePulse` hook (§9.3) for animated bone shimmer. Colours adapt to the current colour scheme.

### 13.4 `FeedEmptyState`

**Location:** `src/screens/FeedScreen/components/FeedEmptyState.js`

```jsx
<FeedEmptyState onCompose={goToCompose} />
```

**Anatomy:**
- Layered concentric rings (128 → 100 → 78 px) with increasing orange tint
- 62 px solid orange icon circle at centre
- 24 px / 800 weight heading
- 15.5 px body copy
- Pill CTA button

---

## 14. Community / Issues Components

### 14.1 `IssueCard`

**Location:** `src/components/IssueCard/IssueCard.js`

```jsx
<IssueCard issue={issue} onPress={() => navigate(SCREENS.IssueDetail, { issueId: issue.id })} />
```

- Border radius: 10 px
- Border: 1 px `colors.border`
- Background: `colors.surface`
- Pressed: opacity 0.9

**Displays:** category label, status badge (coloured per §18), title, meta info.

### 14.2 `StatusTimeline`

**Location:** `src/components/StatusTimeline/StatusTimeline.js`

```jsx
<StatusTimeline updates={issue.updates} />
```

Renders a vertical timeline of issue status changes.

- Timeline dot: 10×10 px circle, `colors.primary` fill
- Connecting line: 2 px wide, `colors.border` colour
- Item spacing: `spacing.md` (16 px)
- Each item shows: timestamp, author name, new status, optional moderator note

### 14.3 Category Chip Selector

Used in `CreateIssueScreen` and `IssueDetailScreen`. Not an extracted component — implemented inline.

```jsx
<Pressable
  key={cat}
  onPress={() => setCategory(cat)}
  style={[
    styles.chip,
    {
      backgroundColor: selected === cat ? colors.primary : colors.surface,
      borderColor: selected === cat ? colors.primary : colors.border,
    },
  ]}
>
  <Text style={{ color: selected === cat ? "#FFFFFF" : colors.text }}>
    {CATEGORY_LABELS[cat]}
  </Text>
</Pressable>
```

- Border radius: 999 px (pill)
- Border: 1 px
- Selected: `colors.primary` background + white text
- Unselected: `colors.surface` background + `colors.text`

---

## 15. Form Components

### 15.1 Pattern

All user input forms follow this structure:

```jsx
const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

<FormField control={control} name="title" label="Title" errors={errors} />
<FormField control={control} name="body" label="Description" errors={errors} multiline numberOfLines={4} />
<Button title="Submit" onPress={handleSubmit(onSubmit)} disabled={isLoading} />
```

### 15.2 Validation

Use `zod` for all form schemas:

```js
import { z } from "zod";
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(10, "Description must be at least 10 characters"),
});
```

### 15.3 Submission State

```jsx
<Button
  title={isLoading ? "Saving…" : "Save"}
  onPress={handleSubmit(onSubmit)}
  disabled={isLoading}
/>
```

Always disable the submit button during loading. Never show two loading indicators simultaneously.

---

## 16. Feedback & State Components

### 16.1 `Loading`

**Location:** `src/components/Loading/Loading.js`

Fullscreen centred `ActivityIndicator` in `colors.primary`.

```jsx
<Loading />
```

Use for full-screen loading (e.g., auth check on app start). For in-list loading, use `FeedSkeleton`.

### 16.2 `ErrorView`

**Location:** `src/components/ErrorView/ErrorView.js`

```jsx
<ErrorView
  message="Failed to load posts"
  onRetry={() => refetch()}   // optional
/>
```

Renders centred message text and an optional "Retry" button. Spacing: `spacing.md` gap.

### 16.3 `ErrorBoundary`

**Location:** `src/components/ErrorBoundary/ErrorBoundary.js`

Class component wrapping the entire app (in `App.js`). Catches unhandled render errors and shows a recovery UI.

Do not add additional `ErrorBoundary` instances in individual screens — the global one is sufficient.

### 16.4 State Decision Tree

```
Is data loading for the first time?
  → showSkeleton = isLoading && data.length === 0
  → Show skeleton component (not ActivityIndicator)

Did loading fail with no cached data?
  → showError = !!error && data.length === 0 && !showSkeleton
  → Show ErrorView inside a Screen

Is the loaded list empty?
  → Show the appropriate EmptyState component

Is data being refreshed (pull-to-refresh)?
  → Show RefreshControl spinner on the list
  → Do NOT replace list with skeleton

Is a background refetch running (stale-while-revalidate)?
  → Show small "Updating…" text in section header
  → Do NOT show skeleton or replace the list
```

---

## 17. Navigation Patterns

### 17.1 Stack Headers

Auth stack screens use a system header with a back button. Feed and issues stack screens:

- **Feed:** No header on `FeedScreen` (community name is shown inline). `CreatePost` gets header title "New post".
- **Issues:** `IssuesList` has header "Issues" with a "Report" right button. `IssueDetail` has header "Issue". `CreateIssue` has header "Report issue".

Never show a system header on a screen that has its own custom header section.

### 17.2 Tab Icons

Follow the filled/outline convention:

```jsx
tabBarIcon: ({ focused }) => (
  <Ionicons
    name={focused ? "newspaper" : "newspaper-outline"}
    size={focused ? 24 : 22}
    color={focused ? colors.primary : colors.textMuted}
  />
)
```

Active: filled icon, `colors.primary`, 24 px.
Inactive: outline icon, `colors.textMuted`, 22 px.

### 17.3 Navigation Constants

Always use `SCREENS` from `@/navigation/params`:

```js
import { SCREENS } from "@/navigation/params";
navigation.navigate(SCREENS.CreatePost);
navigation.navigate(SCREENS.IssueDetail, { issueId: id });
```

Never use raw string route names.

### 17.4 Deep Link Routes

| URL path | Screen |
|---|---|
| `/feed` | FeedScreen |
| `/feed/new` | CreatePostScreen |
| `/issues` | IssuesListScreen |
| `/issues/:issueId` | IssueDetailScreen |
| `/issues/new` | CreateIssueScreen |
| `/login` | LoginScreen |
| `/register` | RegisterScreen |
| `/forgot-password` | ForgotPasswordScreen |
| `/reset-password/:token` | ResetPasswordScreen |

---

## 18. Issue & Status System

### 18.1 Issue Statuses

| Status | Colour | Meaning |
|---|---|---|
| `REPORTED` | `#6B7280` | Submitted by resident, not yet reviewed |
| `ACKNOWLEDGED` | `#2563EB` | Seen by committee |
| `IN_PROGRESS` | `#D97706` | Actively being worked on |
| `RESOLVED` | `#16A34A` | Completed |
| `CLOSED` | `#374151` | Closed without resolution |

### 18.2 Issue Categories

```
POTHOLE     → "Pothole"
ELECTRICITY → "Electricity"
WATER       → "Water/leak"
ROADS       → "Roads"
WASTE       → "Waste"
OTHER       → "Other"
```

Import labels from `@/lib/issues`.

### 18.3 User Roles

| Role | Capabilities |
|---|---|
| `RESIDENT` | View feed, create posts, view & support issues |
| `COMMITTEE` | All resident capabilities + update issue status + add notes |
| `ADMIN` | All committee capabilities + user management |

Moderator-only UI (status chip selector, note input) is shown when `user.role === "COMMITTEE" || user.role === "ADMIN"`.

---

## 19. Utility Functions

### 19.1 `formatRelativeTime(dateString)`

```js
import { formatRelativeTime } from "@/lib/formatRelativeTime";
formatRelativeTime(post.createdAt); // → "Just now", "3m ago", "2h ago", "Yesterday", "3d ago", "Mar 12"
```

### 19.2 `getAvatarColor(seed)`

```js
import { getAvatarColor } from "@/lib/formatRelativeTime";
const bg = getAvatarColor(String(user.id)); // deterministic hex colour string
```

Always pass `String(user.id)` when available, not the user's name — IDs are stable, names are not.

### 19.3 `getInitials(firstName, lastName)`

```js
import { getInitials } from "@/lib/formatRelativeTime";
const initials = getInitials(user.firstName, user.lastName); // → "YK", "A", "?"
```

Returns `"?"` when both arguments are falsy.

### 19.4 API Client

All API calls go through `@/api/client` which handles:
- Auth token injection
- Token refresh on 401
- JSON serialisation

Never use `fetch` directly — always use the client or an API module in `@/api/`.

### 19.5 Data Fetching Convention

Use TanStack React Query for all server state:

```js
const { data, isLoading, error, refetch, isRefetching, isFetching } = useQuery({
  queryKey: ["posts"],
  queryFn: postsApi.listPosts,
  staleTime: 1000 * 60, // 1 minute default; 5 minutes for community data
});
```

- `staleTime` for community/profile data: `1000 * 60 * 5` (5 min)
- `staleTime` for feed/issues: omit (default 60 s from QueryClient)
- After a mutation, invalidate the relevant query key so the list refreshes

---

## 20. Do & Don't

### Typography

| Do | Don't |
|---|---|
| Use tokens from §3 | Invent new `fontSize` values mid-component |
| Set `lineHeight` for body text | Leave `lineHeight` unset on text longer than one line |
| Use `fontWeight: "800"` for headings | Use `fontWeight: "900"` (rarely renders differently on iOS) |
| Use `letterSpacing: -0.6` for large headings | Use positive letter-spacing on large headings |

### Colour

| Do | Don't |
|---|---|
| Access colour via `useTheme()` | Hard-code `#FFFFFF` as a text colour on a card |
| Use `colors.primary` only for CTAs and key accents | Use orange as a general decoration colour |
| Use the documented semantic overrides | Add new raw hex values without documenting them in §2.2 |

### Layout

| Do | Don't |
|---|---|
| Use `spacing.*` tokens for all margins and gaps | Use arbitrary numbers like `margin: 12` |
| Account for tab bar height in scroll padding | Let content hide behind the tab bar |
| Use `H_PAD = spacing.md + 4` inside cards | Mix different horizontal padding values inside one card |

### Shadows

| Do | Don't |
|---|---|
| Use the shadow wrapper pattern for cards with clipped content | Put `overflow: "hidden"` on the same view that has iOS shadow props |
| Set `shadowColor` on the shadow wrapper layer | Set `shadowColor` on the inner clipped view |
| Use `elevation: 3` for cards, `elevation: 10` for FAB | Use the same elevation level for everything |

### Interactions

| Do | Don't |
|---|---|
| Use `Animated.spring` with `tension: 400, friction: 20` | Use `Animated.timing` for press animations |
| Set `useNativeDriver: true` for transform/opacity | Animate `backgroundColor` with `useNativeDriver: true` |
| Give small icon buttons `hitSlop={10}` | Leave small touch targets without hit slop |

### Icons

| Do | Don't |
|---|---|
| Use `Ionicons` exclusively | Mix icon libraries (FontAwesome, MaterialIcons, etc.) |
| Use `outline` variant for secondary/inactive states | Use filled icons for secondary states |
| Colour icons with `colors.primary` or `colors.textMuted` | Use custom hex colours for icon tint |

### Dark Mode

| Do | Don't |
|---|---|
| Test every new component in both light and dark mode | Only test in one mode |
| Use `isDark` only for the documented semantic overrides | Branch on `isDark` for colours that have theme tokens |
| Use `colors.background` for screen backgrounds | Hard-code `"#FFFFFF"` as a screen background |

---

*Last updated: May 2026. Update this document whenever a new token, component, or pattern is introduced.*
