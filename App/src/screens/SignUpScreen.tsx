import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppButton, AppInput, colors, digitsOnly, LIMITS, RootStackParamList,
  validateCity, validateName, validatePhone,
} from '../shared';
import { ApiError, authApi, errMsg } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const clear = (key: string) => {
    setErrors(prev => ({ ...prev, [key]: '' }));
    setFormError('');
  };

  const onRegister = async () => {
    const e: Record<string, string> = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateName(lastName, 'Last name'),
      phone: validatePhone(phone),
      city: validateCity(city),
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;

    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      city: city.trim(),
    };

    setBusy(true);
    setFormError('');
    try {
      await authApi.register(data);
      navigation.navigate('Otp', data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors(prev => ({ ...prev, phone: err.message }));
      } else {
        setFormError(errMsg(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.sub}>
        Your name and number stay private. Others only see a random username.
      </Text>

      <AppInput
        label={`First name (${firstName.length}/${LIMITS.name})`}
        value={firstName}
        onChangeText={t => { setFirstName(t); clear('firstName'); }}
        maxLength={LIMITS.name}
        error={errors.firstName}
        placeholder="Rahul"
        autoCapitalize="words"
      />
      <AppInput
        label={`Last name (${lastName.length}/${LIMITS.name})`}
        value={lastName}
        onChangeText={t => { setLastName(t); clear('lastName'); }}
        maxLength={LIMITS.name}
        error={errors.lastName}
        placeholder="Patil"
        autoCapitalize="words"
      />
      <AppInput
        label="Mobile number"
        value={phone}
        onChangeText={t => { setPhone(digitsOnly(t)); clear('phone'); }}
        keyboardType="number-pad"
        maxLength={LIMITS.phone}
        error={errors.phone}
        placeholder="10-digit number"
      />
      <AppInput
        label={`City (${city.length}/${LIMITS.city})`}
        value={city}
        onChangeText={t => { setCity(t); clear('city'); }}
        maxLength={LIMITS.city}
        error={errors.city}
        placeholder="Jaysingpur"
        autoCapitalize="words"
      />

      {!!formError && <Text style={styles.formError}>{formError}</Text>}
      <AppButton title={busy ? 'Please wait...' : 'Register'} onPress={onRegister} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 16 },
  sub: { color: colors.subText, fontSize: 14, marginTop: 6, marginBottom: 24, lineHeight: 20 },
  formError: { color: colors.error, fontSize: 13, marginBottom: 12 },
});