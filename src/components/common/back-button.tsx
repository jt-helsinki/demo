
import * as React from 'react';
import { ReactElement } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { Button, Icon } from '@/components/nativewindui';

export function BackButton(): ReactElement {
  const router = useRouter();
  const handlePress: () => void = (): void => {
    router.back();
  };

  return (
    <Button
      onPress={handlePress}
      size="icon"
      variant="secondary"
      className="rounded-full border-none">
      <ArrowLeftIcon className="size-6" />
    </Button>
  );
}
