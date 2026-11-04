import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, colors, RootStackParamList } from '../shared';
import { errMsg, userApi } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

const ITEMS = [
  'I have read and agree to the Privacy Policy.',
  'I agree to follow the Community Guidelines.',
  'I accept the Terms and Conditions.',
];

export default function ConsentScreen({ navigation }: Props) {
  const [checked, setChecked] = useState([false, false, false]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (i: number) =>
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const onContinue = async () => {
    setBusy(true);
    setError('');
    try {
      const me = await userApi.me();
      await userApi.acceptConsent(me.requiredLegalVersion);
      navigation.reset({ index: 0, routes: [{ name: 'Chat' }] });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Before you start</Text>
      <Text style={styles.sub}>
        GUPSHUP gives you a pseudonymous public username. It does not promise complete anonymity.
        Please accept the following to continue.
      </Text>

      {ITEMS.map((label, i) => (
        <TouchableOpacity key={label} style={styles.row} activeOpacity={0.7} onPress={() => toggle(i)}>
          <View style={[styles.box, checked[i] && styles.boxOn]}>
            {checked[i] && <Text style={styles.tick}>✓</Text>}
          </View>
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      ))}

      {!!error && <Text style={styles.error}>{error}</Text>}
      <View style={{ height: 12 }} />
      <AppButton
        title={busy ? 'Please wait...' : 'Continue'}
        onPress={onContinue}
        disabled={busy || !checked.every(Boolean)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 24 },
  sub: { color: colors.subText, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 10,
  },
  box: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tick: { color: colors.text, fontWeight: '800' },
  label: { color: colors.text, fontSize: 15, flex: 1 },
  error: { color: colors.error, fontSize: 13, marginTop: 6 },
});