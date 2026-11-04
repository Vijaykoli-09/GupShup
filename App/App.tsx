import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import UserNavigator from './src/navigation/UserNavigator';
import { colors } from './src/shared';
import { navigationRef } from './src/api';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      <StatusBar barStyle="light-content" />
      <UserNavigator />
    </NavigationContainer>
  );
}