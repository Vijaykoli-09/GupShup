import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors } from '../shared';

const TRIGGER = 56; // swipe distance that triggers reply
const MAX = 80;

type Props = { mine: boolean; onSwipeReply: () => void; children: React.ReactNode };

export default function SwipeRow({ mine, onSwipeReply, children }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const latest = useRef(onSwipeReply);
  latest.current = onSwipeReply;

  const back = () => Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();

  const pan = useRef(
    PanResponder.create({
      // Only claim mostly-horizontal right swipes, so vertical scrolling still works.
      onMoveShouldSetPanResponder: (_, g) => g.dx > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(Math.max(0, Math.min(g.dx, MAX))),
      onPanResponderRelease: (_, g) => {
        if (g.dx >= TRIGGER) latest.current();
        back();
      },
      onPanResponderTerminate: back,
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.icon,
          { opacity: x.interpolate({ inputRange: [0, TRIGGER], outputRange: [0, 1], extrapolate: 'clamp' }) },
        ]}>
        <Text style={styles.iconText}>↩</Text>
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        style={[styles.row, mine ? styles.mine : styles.other, { transform: [{ translateX: x }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 10, justifyContent: 'center' },
  row: { flexDirection: 'row' },
  mine: { justifyContent: 'flex-end' },
  other: { justifyContent: 'flex-start' },
  icon: {
    position: 'absolute', left: 6, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  iconText: { color: colors.lavender, fontSize: 18 },
});