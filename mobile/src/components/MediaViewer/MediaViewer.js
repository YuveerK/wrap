import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");
const CLOSE_Y  = 90;
const CLOSE_VY = 800;

// ─────────────────────────────────────────────────────────────────────────────
// ZoomableImage
// ─────────────────────────────────────────────────────────────────────────────
function ZoomableImage({ uri, onDragProgress, onClose, onSpringBack, onZoomChange, onTap }) {
  // React state drives gesture rebuild when zoom boundary crosses 1×
  const [isZoomed, setIsZoomed] = useState(false);

  // Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const panX  = useRef(new Animated.Value(0)).current;
  const panY  = useRef(new Animated.Value(0)).current;

  // JS refs — persist between gestures without causing re-renders
  const startScale   = useRef(1); // scale at start of current pinch
  const savedScale   = useRef(1); // committed scale after each pinch ends
  const liveScale    = useRef(1); // current scale during an active pinch (real-time)
  const savedX       = useRef(0);
  const savedY       = useRef(0);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const commitZoom = (next) => {
    savedScale.current = next;
    liveScale.current  = next;
    scale.setValue(next);
    const zoomed = next > 1;
    setIsZoomed(zoomed);
    onZoomChange?.(zoomed);
  };

  const resetTransform = (animated) => {
    savedScale.current = 1;
    liveScale.current  = 1;
    savedX.current     = 0;
    savedY.current     = 0;
    if (animated) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 350, friction: 25 }),
        Animated.spring(panX,  { toValue: 0, useNativeDriver: true, tension: 400, friction: 30 }),
        Animated.spring(panY,  { toValue: 0, useNativeDriver: true, tension: 400, friction: 30 }),
      ]).start();
    } else {
      scale.setValue(1);
      panX.setValue(0);
      panY.setValue(0);
    }
    setIsZoomed(false);
    onZoomChange?.(false);
  };

  // ── Pinch ──────────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.current = savedScale.current;
    })
    .onUpdate((e) => {
      const next = Math.max(1, Math.min(6, startScale.current * e.scale));
      liveScale.current = next;
      scale.setValue(next);
    })
    .onEnd((e, success) => {
      const raw  = startScale.current * (success ? e.scale : 1);
      const next = Math.max(1, Math.min(6, raw));
      if (next <= 1.05) {
        resetTransform(true);
      } else {
        commitZoom(next);
      }
    });

  // ── Pan ────────────────────────────────────────────────────────────────────
  // Two separate gesture objects are intentional — RNGH config methods mutate
  // the gesture instance, so reusing one object with conditional .failOffsetX
  // would permanently apply the constraint even when zoomed.
  //
  // pullDownPan  – not zoomed: activates only after 5 px of vertical movement
  //                (activeOffsetY), then fails if horizontal drift exceeds 30 px
  //                so the ScrollView pager can claim horizontal swipes.
  //                Once activeOffsetY fires, failOffsetX no longer cancels the
  //                gesture, so normal downward drift is handled correctly.
  //
  // freePan      – zoomed: no offset constraints; translates freely.
  //
  // liveScale is checked (not savedScale) so that pull-down isn't triggered
  // during an active pinch that is still scaling up.
  const onPanUpdate = (e) => {
    if (liveScale.current > 1) {
      panX.setValue(savedX.current + e.translationX);
      panY.setValue(savedY.current + e.translationY);
    } else {
      panX.setValue(0);
      panY.setValue(Math.max(0, e.translationY));
      if (e.translationY > 0) {
        onDragProgress?.(e.translationY / (SH * 0.45));
      }
    }
  };

  const onPanEnd = (e) => {
    if (liveScale.current <= 1) {
      // Filter out tiny movements that are artefacts of a double-tap
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      if (dist < 12) {
        panX.setValue(0);
        panY.setValue(0);
        onDragProgress?.(0);
        return;
      }
      if (e.translationY > CLOSE_Y || e.velocityY > CLOSE_VY) {
        Animated.timing(panY, {
          toValue: SH,
          duration: 210,
          useNativeDriver: true,
        }).start(() => onClose());
      } else {
        panX.setValue(0);
        panY.setValue(0);
        onSpringBack?.();
      }
    } else {
      savedX.current += e.translationX;
      savedY.current += e.translationY;
      panX.setValue(savedX.current);
      panY.setValue(savedY.current);
    }
  };

  const pullDownPan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .activeOffsetY(5)
    .failOffsetX([-30, 30])
    .onUpdate(onPanUpdate)
    .onEnd(onPanEnd);

  const freePan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onUpdate(onPanUpdate)
    .onEnd(onPanEnd);

  const panGesture = isZoomed ? freePan : pullDownPan;

  // ── Double-tap ─────────────────────────────────────────────────────────────
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((_, success) => {
      if (!success) return;
      if (savedScale.current > 1) {
        resetTransform(true);
      } else {
        const target = 2.5;
        savedScale.current = target;
        liveScale.current  = target;
        Animated.spring(scale, {
          toValue: target,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }).start();
        setIsZoomed(true);
        onZoomChange?.(true);
      }
    });

  // ── Single-tap (UI toggle) ──────────────────────────────────────────────────
  // Wrapped in Exclusive(doubleTap, singleTap) so singleTap only fires after
  // the double-tap window (~300 ms) expires without a second tap.
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd((_, success) => {
      if (!success) return;
      onTap?.();
    });

  // ── Composition ────────────────────────────────────────────────────────────
  // pinch + pan run simultaneously alongside the tap pair.
  // pan artefacts from a double-tap are filtered by the `dist < 12` check in onPanEnd.
  const composed = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture),
  );

  return (
    <View style={styles.slide}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX: panX }, { translateY: panY }, { scale }] },
          ]}
        >
          <Image source={{ uri }} style={styles.slideImage} resizeMode="contain" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MediaViewer
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   images: { uri: string }[],
 *   initialIndex?: number,
 *   visible: boolean,
 *   onClose: () => void,
 * }} props
 */
export function MediaViewer({ images, initialIndex = 0, visible, onClose }) {
  const insets         = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed,     setIsZoomed]     = useState(false);
  const [showUI,       setShowUI]       = useState(true);
  const scrollRef      = useRef(null);
  const viewerOpacity  = useRef(new Animated.Value(0)).current;
  const uiOpacity      = useRef(new Animated.Value(1)).current;
  const showUIRef      = useRef(true);

  useEffect(() => {
    if (!visible) return;
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
    showUIRef.current = true;
    setShowUI(true);
    uiOpacity.setValue(1);
    viewerOpacity.setValue(0);
    Animated.timing(viewerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: initialIndex * SW, animated: false });
    }, 0);
  }, [visible, initialIndex]);

  const toggleUI = () => {
    if (isZoomed) return;
    const next = !showUIRef.current;
    showUIRef.current = next;
    setShowUI(next);
    StatusBar.setHidden(!next, 'fade');
    Animated.timing(uiOpacity, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleDragProgress = (progress) => {
    viewerOpacity.setValue(Math.max(0.08, 1 - progress * 0.8));
  };

  const handleClose = () => {
    Animated.timing(viewerOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSpringBack = () => {
    Animated.spring(viewerOpacity, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 22,
    }).start();
  };

  if (!visible || !images?.length) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar hidden={!showUI} />
      <GestureHandlerRootView style={styles.rootView}>
        <Animated.View style={[styles.container, { opacity: viewerOpacity }]}>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={!isZoomed}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setCurrentIndex(idx);
              setIsZoomed(false);
            }}
          >
            {images.map((img, i) => (
              <ZoomableImage
                key={i}
                uri={img.uri}
                onDragProgress={handleDragProgress}
                onClose={handleClose}
                onSpringBack={handleSpringBack}
                onZoomChange={setIsZoomed}
                onTap={toggleUI}
              />
            ))}
          </ScrollView>

          <Animated.View
            style={[styles.topBar, { paddingTop: insets.top + 6, opacity: uiOpacity }]}
            pointerEvents={showUI ? "box-none" : "none"}
          >
            <Pressable onPress={handleClose} hitSlop={12} style={styles.iconBtn}>
              <View style={styles.iconBg}>
                <Ionicons name="close" size={20} color="#FFF" />
              </View>
            </Pressable>

            {images.length > 1 ? (
              <View style={styles.counter}>
                <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.iconBtn} />
          </Animated.View>

        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slide: {
    width: SW,
    height: SH,
  },
  slideImage: {
    width: SW,
    height: SH,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  counterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
