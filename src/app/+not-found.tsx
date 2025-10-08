
import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { ReactElement } from 'react';
import { Text } from '@/components/nativewindui';

export default function NotFoundScreen(): ReactElement {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text>This screen doesn't exist.</Text>

        <Link href="/">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
