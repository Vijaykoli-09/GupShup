import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, colors, RootStackParamList } from '../shared';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.name}>GUPSHUP</Text>
        <Text style={styles.desc}>
          Talk about what's happening around you. Ask questions, share opinions, and
          connect with your local community, without showing your real name.
        </Text>
      </View>
      <View style={styles.bottom}>
        <AppButton title="Login" onPress={() => navigation.navigate('Login')} />
        <View style={{ height: 12 }} />
        <AppButton title="Register" variant="outline" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  top: { flex: 1, justifyContent: 'center' },
  name: { color: colors.primary, fontSize: 40, fontWeight: '800', letterSpacing: 3, marginBottom: 16 },
  desc: { color: colors.subText, fontSize: 16, lineHeight: 24 },
  bottom: { paddingBottom: 24 },
});