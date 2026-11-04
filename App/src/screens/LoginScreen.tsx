import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppButton, AppInput, colors, digitsOnly, LIMITS, RootStackParamList,
  validatePhone, validatePin,
} from '../shared';
import { authApi, errMsg, saveToken, userApi } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({ phone: '', pin: '' });
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    const e = { phone: validatePhone(phone), pin: validatePin(pin) };
    setErrors(e);
    if (e.phone || e.pin) return;

    setBusy(true);
    try {
      const res = await authApi.login(phone, pin);
      await saveToken(res.accessToken);
      const me = await userApi.me();
      navigation.reset({
        index: 0,
        routes: [{ name: me.consentAccepted ? 'Chat' : 'Consent' }],
      });
    } catch (err) {
      setErrors({ phone: '', pin: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.sub}>Login with your mobile number and PIN.</Text>
      <Text style={styles.demo}>Demo user: 9999999999 / PIN 9999</Text>

      <AppInput
        label="Mobile number"
        value={phone}
        onChangeText={t => { setPhone(digitsOnly(t)); setErrors(p => ({ ...p, phone: '' })); }}
        keyboardType="number-pad"
        maxLength={LIMITS.phone}
        error={errors.phone}
        placeholder="10-digit number"
      />
      <AppInput
        label="PIN"
        value={pin}
        onChangeText={t => { setPin(digitsOnly(t)); setErrors(p => ({ ...p, pin: '' })); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={LIMITS.pin}
        error={errors.pin}
        placeholder="****"
      />

      <AppButton title={busy ? 'Signing in...' : 'Login'} onPress={onLogin} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 16 },
  sub: { color: colors.subText, fontSize: 14, marginTop: 6 },
  demo: { color: colors.warning, fontSize: 13, marginTop: 6, marginBottom: 24 },
});