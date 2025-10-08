import { Switch } from 'react-native';

import { useColorScheme } from '@/components/hooks/use-color-scheme';
import { COLOURS } from '@/theme/colors';

function Toggle(props: React.ComponentProps<typeof Switch>) {
  const { colors } = useColorScheme();
  return (
    <Switch
      trackColor={{
        true: colors.primary,
        false: colors.grey,
      }}
      thumbColor={COLOURS.white}
      {...props}
    />
  );
}

export { Toggle };
