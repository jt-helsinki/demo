
import * as React from 'react';
import { ReactElement, useEffect, useMemo } from 'react';
import { Platform, UIManager, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Button, Picker, PickerItem, Text } from '@/components/nativewindui';
import { useBLE } from '@/components/hooks/use-ble';
import {
  CYCLING_CADENCE_SERVICE_UUID,
  CYCLING_POWER_SERVICE_UUID,
  CYCLING_SPEED_SERVICE_UUID,
  filterDevices,
  HEART_RATE_SERVICE_UUID,
} from '@/lib/ble-utils';
import { Select, SelectOption } from '@/components/common/Select';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplicationState } from '@/state/application-state';
import { useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const connectSensorsSchema = z.object({
  powerSensor: z
    .string({ required_error: 'A power sensor is required' })
    .min(1, 'A power sensor is required'),
  speedSensor: z
    .string({ required_error: 'A speed sensor is required' })
    .min(1, 'A speed sensor is required'),
  heartRateSensor: z.string().nullable().default(null),
  cadenceSensor: z.string().nullable().default(null),
});

type ConnectSensorsFormValues = z.infer<typeof connectSensorsSchema>;

function mapDeviceToOption(device: Device): ReactElement {
  return (
    <PickerItem label={(device.localName ?? device.name) || 'Unknown Device'} value={device.id} />
  );
}

export default function Screen(): ReactElement {
  const { sessionCreationFlow, updateSessionCreationFlow } = useApplicationState();
  const router = useRouter();
  const { allDevices, scanForPeripherals } = useBLE();

  useEffect(() => {
    scanForPeripherals().catch((error) => Sentry.captureException(error));
  }, []);

  // Sentry.captureMessage('***** '+ JSON.stringify(allDevices));

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(connectSensorsSchema),
    defaultValues: {
      powerSensor: sessionCreationFlow.sensorsSetup?.powerSensor ?? '',
      speedSensor: sessionCreationFlow.sensorsSetup?.speedSensor ?? '',
      heartRateSensor: sessionCreationFlow.sensorsSetup?.heartRateSensor ?? null,
      cadenceSensor: sessionCreationFlow.sensorsSetup?.cadenceSensor ?? null,
    },
  });

  const onSubmit = (data: ConnectSensorsFormValues) => {
    updateSessionCreationFlow({
      ...sessionCreationFlow,
      sensorsSetup: {
        powerSensor: data.powerSensor,
        speedSensor: data.speedSensor,
        heartRateSensor: data.heartRateSensor,
        cadenceSensor: data.cadenceSensor,
      },
    });

    router.push('/session/session-confirm');
  };

  const heartRateSensorOptions: ReactElement[] = useMemo(() => {
    return filterDevices(allDevices, HEART_RATE_SERVICE_UUID).map(mapDeviceToOption);
  }, [allDevices]);

  const powerSensorOptions: ReactElement[] = useMemo(() => {
    return filterDevices(allDevices, CYCLING_POWER_SERVICE_UUID).map(mapDeviceToOption);
  }, [allDevices]);

  const speedSensorOptions: ReactElement[] = useMemo(() => {
    return filterDevices(allDevices, CYCLING_SPEED_SERVICE_UUID).map(mapDeviceToOption);
  }, [allDevices]);

  const cadenceSensorOptions: ReactElement[] = useMemo(() => {
    return filterDevices(allDevices, CYCLING_CADENCE_SERVICE_UUID).map(mapDeviceToOption);
  }, [allDevices]);

  return (
    <View className="mt-[20%] flex-grow flex-col">
      <Controller
        control={control}
        name="powerSensor"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <Picker selectedValue={value} onValueChange={onChange} placeholder="Power sensor">
              {powerSensorOptions}
            </Picker>
            {formState.errors.powerSensor && (
              <Text className="text-red-500">{formState.errors.powerSensor.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="speedSensor"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <Picker selectedValue={value} onValueChange={onChange} placeholder="Speed sensor">
              {speedSensorOptions}
            </Picker>
            {formState.errors.speedSensor && (
              <Text className="text-red-500">{formState.errors.speedSensor.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="heartRateSensor"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              placeholder="Heart rate sensor (optional)">
              {heartRateSensorOptions}
            </Picker>
            {formState.errors.heartRateSensor && (
              <Text className="text-red-500">{formState.errors.heartRateSensor.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="cadenceSensor"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              placeholder="Cadence sensor (optional)">
              {cadenceSensorOptions}
            </Picker>
            {formState.errors.cadenceSensor && (
              <Text className="text-red-500">{formState.errors.cadenceSensor.message}</Text>
            )}
          </View>
        )}
      />

      <View className="mt-8 flex-row items-center justify-start gap-2">
        <Button
          size="sm"
          className="w-full max-w-sm"
          onPress={handleSubmit(onSubmit)}
          disabled={!formState.isValid}
          variant={!formState.isValid ? 'tonal' : 'primary'}>
          <Text>Next</Text>
        </Button>
      </View>
    </View>
  );
}
