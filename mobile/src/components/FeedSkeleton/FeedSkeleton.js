import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const CARD_RADIUS = 22;
const H_PAD = spacing.md + 4;

function usePulse() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

function Bone({ style, pulse, from, to }) {
  const bg = pulse.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  return <Animated.View style={[styles.bone, { backgroundColor: bg }, style]} />;
}

function SkeletonCard({ pulse, from, to, cardBg }) {
  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.authorRow}>
        <Bone style={styles.avatar} pulse={pulse} from={from} to={to} />
        <View style={styles.authorText}>
          <Bone style={styles.nameLine} pulse={pulse} from={from} to={to} />
          <Bone style={styles.timeLine} pulse={pulse} from={from} to={to} />
        </View>
      </View>
      <Bone style={styles.titleLine} pulse={pulse} from={from} to={to} />
      <Bone
        style={[styles.bodyLine, { width: "100%" }]}
        pulse={pulse}
        from={from}
        to={to}
      />
      <Bone
        style={[styles.bodyLine, { width: "87%" }]}
        pulse={pulse}
        from={from}
        to={to}
      />
      <Bone
        style={[styles.bodyLine, { width: "66%" }]}
        pulse={pulse}
        from={from}
        to={to}
      />
      <View style={[styles.footerPlaceholder, { borderTopColor: from }]}>
        <Bone style={styles.footerIcon} pulse={pulse} from={from} to={to} />
        <Bone style={styles.footerIcon} pulse={pulse} from={from} to={to} />
      </View>
    </View>
  );
}

export function FeedSkeleton() {
  const { isDark, semantic } = useTheme();
  const pulse = usePulse();

  const from = isDark ? "#232F45" : "#E8ECF2";
  const to = isDark ? "#2E3F5C" : "#F4F6FA";
  const cardBg = semantic.cardBackground;

  return (
    <View style={styles.list}>
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} pulse={pulse} from={from} to={to} cardBg={cardBg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  card: {
    borderRadius: CARD_RADIUS,
    paddingTop: spacing.md + 2,
    overflow: "hidden",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  authorText: {
    flex: 1,
    gap: 8,
  },
  nameLine: {
    height: 14,
    width: "42%",
    borderRadius: 7,
  },
  timeLine: {
    height: 11,
    width: "26%",
    borderRadius: 5.5,
  },
  titleLine: {
    height: 20,
    width: "70%",
    borderRadius: 8,
    marginHorizontal: H_PAD,
    marginBottom: 10,
  },
  bodyLine: {
    height: 13,
    borderRadius: 6,
    marginHorizontal: H_PAD,
    marginBottom: 8,
  },
  footerPlaceholder: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: H_PAD - 6,
    paddingVertical: 14,
    marginTop: 4,
  },
  footerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  bone: {
    borderRadius: 8,
  },
});
