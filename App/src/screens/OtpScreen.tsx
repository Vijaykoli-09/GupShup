import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppButton, AppInput, colors, DEMO_OTP, digitsOnly, LIMITS, RootStackParamList, validateOtp,
} from '../shared';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const onVerify = () => {
    const err = validateOtp(otp);
    setError(err);
    if (err) return;
    navigation.navigate('Passcode', route.params);
  };

  const onResend = () => {
    setSeconds(30);
    setOtp('');
    setError('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.sub}>Enter the 6-digit code sent to +91 {phone}</Text>
      <Text style={styles.hint}>Demo OTP: {DEMO_OTP}</Text>

      <AppInput
        label="OTP"
        value={otp}
        onChangeText={t => { setOtp(digitsOnly(t)); setError(''); }}
        keyboardType="number-pad"
        maxLength={LIMITS.otp}
        error={error}
        placeholder="------"
      />

      <AppButton title="Verify" onPress={onVerify} />

      <TouchableOpacity
        disabled={seconds > 0}
        onPress={onResend}
        style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: seconds > 0 ? colors.subText : colors.lavender, fontSize: 14 }}>
          {seconds > 0 ? `Resend OTP in ${seconds}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 16 },
  sub: { color: colors.subText, fontSize: 14, marginTop: 6 },
  hint: { color: colors.warning, fontSize: 13, marginTop: 6, marginBottom: 24 },
});