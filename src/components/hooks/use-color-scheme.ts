import { useColorScheme as useNativewindcolorScheme } from 'nativewind';
import { COLOURS } from '@/theme/colors';

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativewindcolorScheme();

  function toggleColorScheme() {
    return setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  }

  return {
    colorScheme: colorScheme ?? 'light',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme: setColorScheme,
    toggleColorScheme,
    colors: COLOURS[colorScheme ?? 'light'],
  };
}
