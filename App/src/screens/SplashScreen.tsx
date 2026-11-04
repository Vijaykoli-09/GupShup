import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, RootStackParamList } from '../shared';
import { loadToken, userApi } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const lines = ['Your town.', 'Your conversations.', 'Real people. Local talk.'];

type Target = 'Welcome' | 'Consent' | 'Chat';

const decideTarget = async (): Promise<Target> => {
  const token = await loadToken();
  if (!token) return 'Welcome';
  try {
    const me = await userApi.me();
    return me.consentAccepted ? 'Chat' : 'Consent';
  } catch {
    return 'Welcome';
  }
};

export default function SplashScreen({ navigation }: Props) {
  const nameAnim = useRef(new Animated.Value(0)).current;
  const lineAnims = useRef(lines.map(() => new Animated.Value(0))).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatIn = (v: Animated.Value) =>
      Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: true });

    Animated.sequence([
      floatIn(nameAnim),
      Animated.stagger(350, lineAnims.map(floatIn)),
      Animated.delay(300),
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    let cancelled = false;
    const run = async () => {
      const [target] = await Promise.all([
        decideTarget(),
        new Promise<void>(resolve => setTimeout(resolve, 3000)),
      ]);
      if (!cancelled) navigation.replace(target as 'Welcome');
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const floatStyle = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeOut, alignItems: 'center' }}>
        <Animated.Text style={[styles.name, floatStyle(nameAnim)]}>GUPSHUP</Animated.Text>
        {lines.map((l, i) => (
          <Animated.Text key={l} style={[styles.line, floatStyle(lineAnims[i])]}>
            {l}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.primary, fontSize: 44, fontWeight: '800', letterSpacing: 4, marginBottom: 16 },
  line: { color: colors.subText, fontSize: 16, marginTop: 6 },
});