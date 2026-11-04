import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppButton, AppInput, colors, DEMO_OTP, digitsOnly, LIMITS, RootStackParamList,
} from '../shared';
import { authApi, errMsg } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const onVerify = async () => {
    if (!otp) return setError('OTP is required');
    if (!/^\d{6}$/.test(otp)) return setError('OTP must be exactly 6 digits');

    setBusy(true);
    try {
      const res = await authApi.verifyOtp(phone, otp);
      navigation.navigate('Passcode', { phone, registrationToken: res.registrationToken });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setOtp('');
    setError('');
    try {
      await authApi.register(route.params); // sends a new OTP
      setSeconds(30);
    } catch (e) {
      setError(errMsg(e));
    }
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

      <AppButton title={busy ? 'Verifying...' : 'Verify'} onPress={onVerify} disabled={busy} />

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