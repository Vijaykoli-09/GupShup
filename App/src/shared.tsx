import React from 'react';
import {
  Text, TextInput, TouchableOpacity, View, StyleSheet, TextInputProps,
} from 'react-native';

// ---------- Theme (dark only) ----------
export const colors = {
  bg: '#0D0D0F',
  surface: '#1A1A1F',
  border: '#2A2A32',
  primary: '#8B5CF6',
  lavender: '#C4B5FD',
  text: '#FFFFFF',
  subText: '#9CA3AF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

// ---------- Navigation types ----------
export type SignUpData = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Otp: SignUpData;
  Passcode: SignUpData;
  Chat: undefined;
  Settings: undefined;
};

// ---------- Demo data (replaced by backend later) ----------
export type User = SignUpData & { pin: string };

export const db: { users: User[]; currentUser: User | null } = {
  users: [
    { firstName: 'Demo', lastName: 'User', phone: '9999999999', city: 'Jaysingpur', pin: '9999' },
  ],
  currentUser: null,
};

export const DEMO_OTP = '123456';

// ---------- Validation (returns an error message, or '' if valid) ----------
export const LIMITS = { name: 15, city: 20, phone: 10, pin: 4, otp: 6 };

const NAME_REGEX = /^[A-Za-z]+( [A-Za-z]+)*$/;

export const validateName = (value: string, label: string): string => {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (v.length < 2) return `${label} must be at least 2 characters`;
  if (v.length > LIMITS.name) return `${label} can be at most ${LIMITS.name} characters`;
  if (!NAME_REGEX.test(v)) return `${label} can contain only letters and single spaces`;
  return '';
};

export const validateCity = (value: string): string => {
  const v = value.trim();
  if (!v) return 'City is required';
  if (v.length < 2) return 'City must be at least 2 characters';
  if (v.length > LIMITS.city) return `City can be at most ${LIMITS.city} characters`;
  if (!NAME_REGEX.test(v)) return 'City can contain only letters and single spaces';
  return '';
};

export const validatePhone = (value: string): string => {
  if (!value) return 'Mobile number is required';
  if (!/^\d+$/.test(value)) return 'Mobile number can contain only digits';
  if (value.length !== LIMITS.phone) return 'Mobile number must be exactly 10 digits';
  if (!/^[6-9]/.test(value)) return 'Mobile number must start with 6, 7, 8 or 9';
  return '';
};

export const validatePin = (value: string): string => {
  if (!value) return 'PIN is required';
  if (!/^\d{4}$/.test(value)) return 'PIN must be exactly 4 digits';
  return '';
};

export const validateOtp = (value: string): string => {
  if (!value) return 'OTP is required';
  if (!/^\d{6}$/.test(value)) return 'OTP must be exactly 6 digits';
  if (value !== DEMO_OTP) return 'Incorrect OTP. Please try again';
  return '';
};

export const digitsOnly = (t: string) => t.replace(/\D/g, '');

// ---------- Reusable components ----------
export const AppButton = ({
  title, onPress, variant = 'primary', disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    disabled={disabled}
    onPress={onPress}
    style={[
      s.btn,
      variant === 'primary' ? s.btnPrimary : s.btnOutline,
      disabled && { opacity: 0.5 },
    ]}>
    <Text style={[s.btnText, variant === 'outline' && { color: colors.lavender }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const AppInput = ({
  label, error, ...props
}: TextInputProps & { label: string; error?: string }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput
      placeholderTextColor={colors.subText}
      style={[s.input, !!error && { borderColor: colors.error }]}
      {...props}
    />
    {!!error && <Text style={s.error}>{error}</Text>}
  </View>
);

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1, borderColor: colors.primary },
  btnText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  label: { color: colors.subText, fontSize: 13, marginBottom: 6 },
  input: {
    height: 52, backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14,
    color: colors.text, fontSize: 16,
  },
  error: { color: colors.error, fontSize: 12, marginTop: 4 },
});