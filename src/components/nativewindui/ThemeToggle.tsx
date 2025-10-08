import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/components/hooks/use-color-scheme';
import { COLOURS } from '@/theme/colors';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        key={`toggle-${colorScheme}`}
        entering={ZoomInRotate}>
        <Pressable onPress={toggleColorScheme} className="opacity-80">
          {colorScheme === 'dark'
            ? ({ pressed }) => (
                <View className={cn('px-0.5', pressed && 'opacity-50')}>
                  <MoonStarIcon color={COLOURS.white} />
                </View>
              )
            : ({ pressed }) => (
                <View className={cn('px-0.5', pressed && 'opacity-50')}>
                  <SunIcon color={COLOURS.black} />
                </View>
              )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
}
