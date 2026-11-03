import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppButton, AppInput, colors, db, digitsOnly, LIMITS, RootStackParamList, validatePin,
} from '../shared';

type Props = NativeStackScreenProps<RootStackParamList, 'Passcode'>;

export default function PasscodeScreen({ navigation, route }: Props) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const onSet = () => {
    const err = validatePin(pin);
    if (err) return setError(err);
    if (pin !== confirm) return setError('PINs do not match');

    db.users.push({ ...route.params, pin });
    Alert.alert('Success', 'Your PIN is set. Please login.', [
      { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your PIN</Text>
      <Text style={styles.sub}>Choose a 4-digit PIN to log in next time.</Text>

      <AppInput
        label="Enter PIN"
        value={pin}
        onChangeText={t => { setPin(digitsOnly(t)); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={LIMITS.pin}
        placeholder="****"
      />
      <AppInput
        label="Confirm PIN"
        value={confirm}
        onChangeText={t => { setConfirm(digitsOnly(t)); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={LIMITS.pin}
        placeholder="****"
        error={error}
      />

      <AppButton title="Set PIN" onPress={onSet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 16 },
  sub: { color: colors.subText, fontSize: 14, marginTop: 6, marginBottom: 24 },
});