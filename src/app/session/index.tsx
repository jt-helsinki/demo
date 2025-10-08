import * as React from 'react';
import { ReactElement, useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@/components/nativewindui';
import { PhoneLocation, useApplicationState } from '@/state/application-state';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useBLE } from '@/components/hooks/use-ble';
import * as Sentry from '@sentry/react-native';
import { BasicLayout } from '@/components/common/basic-layout';

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
}

const SHOW_LOCATION: boolean = false;
export default function Screen(): ReactElement {
  const { sessionCreationFlow, updateSessionCreationFlow } = useApplicationState();
  const router = useRouter();
  const location: PhoneLocation | null = sessionCreationFlow?.location || null;
  const { scanForPeripherals } = useBLE();

  useEffect(() => {
    scanForPeripherals().catch((error) => Sentry.captureException(error));
    getCurrentLocation()
      .then((locationFromPhone) => {
        if (locationFromPhone) {
          updateSessionCreationFlow({
            ...sessionCreationFlow,
            location: {
              ...(locationFromPhone?.coords ? locationFromPhone.coords : {}),
            } as PhoneLocation,
          });
        }
      })
      .catch((error) => Sentry.captureException(error));
  }, []);

  const handleNext = (action: 'new' | 'existing') => {
    updateSessionCreationFlow({ ...sessionCreationFlow, selectedCreationOption: action });
    if (action === 'new') {
      router.push('/session/session-creation');
    } else {
      router.push('/session/session-selector');
    }
  };

  return (
    <BasicLayout>
    <View className="mt-[20%] flex-grow flex-col">
      <View className="mb-10 max-w-sm">
        <Text className="text-center text-2xl font-semibold">Do you want to:</Text>
      </View>

      <View className="mb-6 max-w-sm">
        <Button
          variant="primary"
          className="mb-2 w-full max-w-sm"
          onPress={() => handleNext('existing')}>
          <Text>Connect to an existing session</Text>
        </Button>
      </View>

      <View className="mb-6 max-w-sm">
        <Button variant="primary" className="w-full max-w-sm" onPress={() => handleNext('new')}>
          <Text>Create a new session</Text>
        </Button>
      </View>
      {SHOW_LOCATION && (
        <View className="w-full p-4">
          <Text className="mb-3 text-lg font-semibold">Current Location</Text>

          {/* Two-column rows */}
          <View className="flex flex-col">
            <View className="mb-2 flex-row justify-between">
              <Text>Latitude:</Text>
              <Text>{location?.latitude?.toFixed(5) ?? '—'}</Text>
            </View>

            <View className="mb-2 flex-row justify-between">
              <Text>Longitude:</Text>
              <Text>{location?.longitude?.toFixed(5) ?? '—'}</Text>
            </View>

            <View className="mb-2 flex-row justify-between">
              <Text>Altitude:</Text>
              <Text>{location?.altitude ? `${location.altitude.toFixed(1)} m` : '—'}</Text>
            </View>

            <View className="mb-2 flex-row justify-between">
              <Text>Accuracy:</Text>
              <Text>{location?.accuracy ? `${location.accuracy.toFixed(1)} m` : '—'}</Text>
            </View>

            <View className="mb-2 flex-row justify-between">
              <Text>Alt. Accuracy:</Text>
              <Text>
                {location?.altitudeAccuracy ? `${location.altitudeAccuracy.toFixed(1)} m` : '—'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
    </BasicLayout>
  );
}
