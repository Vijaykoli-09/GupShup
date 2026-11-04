import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, colors, RootStackParamList } from '../shared';
import { clearToken, errMsg, Me, userApi } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function SettingsScreen({ navigation }: Props) {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setMe(await userApi.me());
      setError('');
    } catch (e) {
      setError(errMsg(e));
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const doChangeUsername = async () => {
    setBusy(true);
    try {
      const res = await userApi.changeUsername();
      await load();
      Alert.alert('Done', `Your new username is ${res.username}.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const onChangeUsername = () =>
    Alert.alert(
      'Generate new username?',
      'Your public username will change. Your previous messages will appear under your new username.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: doChangeUsername },
      ],
    );

  const onLogout = () =>
    Alert.alert('Logout?', 'You will need your mobile number and PIN to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.section}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Public username</Text>
        <Text style={styles.value}>{me?.publicUsername ?? '...'}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Registered mobile</Text>
        <Text style={styles.value}>{me ? `+91 ${me.maskedPhone}` : '...'}</Text>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <AppButton
        title={busy ? 'Please wait...' : 'Generate New Username'}
        onPress={onChangeUsername}
        disabled={busy || !me || !me.canChangeUsername}
      />
      {me && !me.canChangeUsername && me.nextUsernameChangeAt && (
        <Text style={styles.note}>
          You can change your username again on {fmt(me.nextUsernameChangeAt)}.
        </Text>
      )}

      <View style={{ height: 32 }} />
      <AppButton title="Logout" variant="outline" onPress={onLogout} />

      <Text style={styles.footer}>GUPSHUP v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: { color: colors.subText, fontSize: 13, marginBottom: 8, textTransform: 'uppercase' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginBottom: 16,
  },
  label: { color: colors.subText, fontSize: 12 },
  value: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  note: { color: colors.warning, fontSize: 13, marginTop: 10, lineHeight: 18 },
  footer: { color: colors.subText, fontSize: 12, textAlign: 'center', marginTop: 32 },
});