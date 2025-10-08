
import { useRouter } from 'expo-router';
import {
  Bluetooth,
  BluetoothIcon,
  ClipboardClockIcon,
  Pause,
  PauseIcon,
  Play,
  PlayIcon,
} from 'lucide-react-native';
import * as React from 'react';
import * as Sentry from '@sentry/react-native';
import { ReactElement, useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { UserMenu } from '@/components/auth/user-menu';
import { Button, Icon, Text } from '@/components/nativewindui';
import { BasicLayout } from '@/components/common/basic-layout';
import { useApplicationState } from '@/state/application-state';
import { Logo } from '@/components/common/logo';
import { useBLE } from '@/components/hooks/use-ble';
import { useBleState } from '@/state/ble-state';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { SfSymbols } from 'rn-icon-mapper';

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row items-center bg-gray-900 px-4 py-2">
      {/* Left side (empty space if no button) */}
      <View className="w-12 items-start">
        <SensorButton />
      </View>

      {/* Centered logo */}
      <View className="flex-1 items-center">
        <Logo height={30} />
      </View>

      {/* Right side (empty space if no button) */}
      <View className="w-12 items-end">
        <UserMenu />
      </View>
    </View>
  ),
};

export default function Screen(): ReactElement {
  const { currentSessionId } = useApplicationState();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay: () => void = () => {
    setIsPlaying(!isPlaying); // toggle state
  };

  return (
    <ErrorBoundary>
      <BasicLayout headerOptions={SCREEN_OPTIONS}>
        <SessionConnector />

        {/*TODO remove this test button*/}
        <Button
          onPress={() => {
            Sentry.captureException(new Error('First error'));
          }}>
          <Text>Cause error</Text>
        </Button>
      </BasicLayout>

      {!!currentSessionId ? (
        <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around border-t border-gray-200 bg-background p-4">
          {isPlaying ? (
            <PauseButton onPress={handleTogglePlay} />
          ) : (
            <StartButton onPress={handleTogglePlay} />
          )}
          <SessionButton />
        </View>
      ) : (
        <></>
      )}
    </ErrorBoundary>
  );
}

function SessionConnector(): ReactElement {
  const router = useRouter();
  const { currentSessionId, resetState } = useApplicationState();
  const { stopScanForPeripherals } = useBLE();

  useEffect(() => {
    stopScanForPeripherals();
  }, []);

  const sessionConect: () => void = (): void => {
    resetState();
    router.push('/session');
  };

  return (
    <View className="mt-[35%] flex-grow flex-col">
      <View className="mb-10 max-w-sm">
        <Text className="text-center text-2xl font-semibold">No active session</Text>
      </View>

      <View className="mb-6">
        <Text>
          You must have a current active session to start sending data to the remote system.
          Please create a new session by clicking the button below.
        </Text>
      </View>

      <View className="mt-8 max-w-sm">
        <Button size="sm" onPress={sessionConect}>
          <Text>Create session connection</Text>
        </Button>
      </View>
      <SensorGrid />
    </View>
  );
}

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const CELL_SIZE = width / GRID_COLUMNS;

export function SensorGrid() {
  const { currentPower, currentCadence, currentSpeed, currentHeartRate } = useBleState();

  const gridData = [
    { label: 'Power', value: currentPower ?? '-' },
    { label: 'Cadence', value: currentCadence ?? '-' },
    { label: 'Speed', value: currentSpeed ?? '-' },
    { label: 'Heart Rate', value: currentHeartRate ?? '-' },
  ];

  return (
    <View className="flex-row flex-wrap bg-gray-900">
      {gridData.map((item, index) => (
        <View
          key={index}
          className="items-center justify-center border border-gray-800 p-2"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}>
          {item.label ? (
            <>
              <Text className="text-center text-lg text-gray-300">{item.label}</Text>
              <Text className="text-center text-4xl font-bold text-green-400">{item.value}</Text>
            </>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SensorButton(): ReactElement {
  const router = useRouter();
  const { currentSessionId } = useApplicationState();

  const handlePress: () => void = () => {
    router.push('/session');
  };

  return !!currentSessionId ? (
    <Button onPress={handlePress} size="icon" variant="secondary" className="rounded-full">
      <Bluetooth className="text-gray-400" size={32} />
    </Button>
  ) : (
    <></>
  );
}

function SessionButton(): ReactElement {
  const router = useRouter();
  const { currentSessionId } = useApplicationState();

  const handlePress: () => void = (): void => {
    router.push('/session');
  };

  return currentSessionId ? (
    <Button onPress={handlePress} size="icon" variant="secondary" className="rounded-full">
      <ClipboardClockIcon size={32} />
    </Button>
  ) : (
    <></>
  );
}

interface ButtonProps {
  onPress?: () => void;
}

function StartButton({ onPress }: ButtonProps): ReactElement {
  const { currentSessionId } = useApplicationState();
  return currentSessionId ? (
    <Button onPress={onPress} size="icon" variant="secondary" className="rounded-full">
      <PlayIcon className="size-6" />
    </Button>
  ) : (
    <></>
  );
}

function PauseButton({ onPress }: ButtonProps): ReactElement {
  return (
    <Button onPress={onPress} size="icon" variant="secondary" className="rounded-full">
      <PauseIcon className="size-6" />
    </Button>
  );
}
