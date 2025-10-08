import { Theme, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { COLOURS } from './colors';

export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: COLOURS.light.background,
      border: COLOURS.light.grey5,
      card: COLOURS.light.card,
      notification: COLOURS.light.destructive,
      primary: COLOURS.light.primary,
      text: COLOURS.black,
    },
    fonts: DefaultTheme.fonts,
  },
  dark: {
    dark: true,
    colors: {
      background: COLOURS.dark.background,
      border: COLOURS.dark.grey5,
      card: COLOURS.dark.grey6,
      notification: COLOURS.dark.destructive,
      primary: COLOURS.dark.primary,
      text: COLOURS.white,
    },
    fonts: DarkTheme.fonts,
  },
};
