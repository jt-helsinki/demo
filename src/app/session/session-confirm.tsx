import React, { ReactElement, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Text } from '@/components/nativewindui';
import { useApplicationState } from '@/state/application-state';
import { useRouter } from 'expo-router';
import { useBLE } from '@/components/hooks/use-ble';
import { capitalize } from '@/lib/utils';
import { useSaveSession } from '@/state/server-state';
import { useBleState } from '@/state/ble-state';
import * as Sentry from '@sentry/react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function Screen(): ReactElement {
  const { sessionCreationFlow } = useApplicationState();
  const {
    setDeviceCadenceSensor,
    setDeviceHeartRateSensor,
    setDevicePowerSensor,
    setDeviceSpeedSensor,
  } = useBleState();
  const {
    location,
    venueType,
    selectedCreationOption,
    sessionCode,
    sessionId,
    venue,
    active,
    sensorsSetup,
    inProgress,
  } = sessionCreationFlow;
  const router = useRouter();
  const { isPending, mutateAsync } = useSaveSession();
  const {
    conectDeviceHeartRateSensor,
    conectDevicePowerSensor,
    conectDeviceSpeedSensor,
    conectDeviceCadenceSensor,
  } = useBLE();

  const onSubmit = () => {
    mutateAsync(sessionCreationFlow)
      .then(async () => {
        const { sensorsSetup } = sessionCreationFlow;
        if (sensorsSetup?.heartRateSensor) {
          const heartRateSensor = await conectDeviceHeartRateSensor(sensorsSetup.heartRateSensor);
          setDeviceHeartRateSensor(heartRateSensor);
        }
        if (sensorsSetup?.powerSensor) {
          const powerSensor = await conectDevicePowerSensor(sensorsSetup.powerSensor);
          setDevicePowerSensor(powerSensor);
        }
        if (sensorsSetup?.speedSensor) {
          const speedSensor = await conectDeviceSpeedSensor(sensorsSetup.speedSensor);
          setDeviceSpeedSensor(speedSensor);
        }
        if (sensorsSetup?.cadenceSensor) {
          const cadenceSensor = await conectDeviceCadenceSensor(sensorsSetup.cadenceSensor);
          setDeviceCadenceSensor(cadenceSensor);
        }
        router.push('/');
      })
      .catch((error) => {
        Sentry.captureException(error);
      });
  };

  const renderKeyValue = (label: string, value: string | number | null) => {
    return (
      value && (
        <View className="mb-1 w-full flex-row justify-between">
          <Text className="font-medium">{label}:</Text>
          <Text>{value ?? '—'}</Text>
        </View>
      )
    );
  };

  return (
    <ScrollView className="flex-1 p-4">
      <View className="mb-8">
        <Text className="mb-2 text-xl font-semibold">Session Info</Text>
        {renderKeyValue(
          'Session type',
          selectedCreationOption === 'new' ? 'New session' : 'Existing session'
        )}
        {renderKeyValue('Session ID', sessionId)}
        {renderKeyValue('Session Code', sessionCode)}
        {renderKeyValue('Venue', venue)}
        {renderKeyValue('Venue Type', capitalize(venueType as string).replace('-', ' '))}
        {renderKeyValue('In Progress', inProgress ? 'Yes' : 'No')}
        {renderKeyValue('Active', active ? 'Yes' : 'No')}
      </View>

      {location && (
        <View className="mb-8">
          <Text className="mb-2 text-xl font-semibold">Location</Text>
          <View className="flex-row flex-wrap justify-between">
            {renderKeyValue(
              'Latitude',
              location.latitude ? location.latitude.toFixed(4) : 'Unknown'
            )}
            {renderKeyValue(
              'Longitude',
              location.longitude ? location.longitude.toFixed(4) : 'Unknown'
            )}
            {renderKeyValue(
              'Altitude',
              location.altitude ? `${location.altitude.toFixed(4)} m` : 'Unknown'
            )}
          </View>
        </View>
      )}

      {sensorsSetup && (
        <View className="mb-8">
          <Text className="mb-2 text-xl font-semibold">Sensors</Text>
          <View className="flex-row flex-wrap justify-between">
            {renderKeyValue('Power Sensor', sensorsSetup.powerSensor)}
            {renderKeyValue('Speed Sensor', sensorsSetup.speedSensor)}
            {renderKeyValue('Heart Rate Sensor', sensorsSetup.heartRateSensor)}
            {renderKeyValue('Cadence Sensor', sensorsSetup.cadenceSensor)}
          </View>
        </View>
      )}
      <View className="mt-8">
        <Button onPress={onSubmit} className="w-full" variant="primary">
          {isPending && (
            <Animated.View entering={FadeIn.delay(200)}>
              <ActivityIndicator size="small" />
            </Animated.View>
          )}
          <Text>{selectedCreationOption === 'new' ? 'Create session' : 'Connect to session'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
