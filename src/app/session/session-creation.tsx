import React, { ReactElement, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Picker, PickerItem, Text, TextField, Toggle } from '@/components/nativewindui';
import { useRouter } from 'expo-router';
import { useApplicationState, VenueType } from '@/state/application-state';

const createSessionSchema = z.object({
  venue: z.string().min(1, 'Location is required'),
  venueType: z.string().min(1, 'Location type is required'),
  active: z.boolean(),
});

type CreateSessionFormValues = z.infer<typeof createSessionSchema>;

const venueTypeOptions: ReactElement[] = [
  <PickerItem key="indoor-velodome" value="indoor-velodome" label="Indoor velodome" />,
  <PickerItem key="outdoor-velodome" value="outdoor-velodrome" label="Outdoor velodrome" />,
  <PickerItem key="open-road" value="open-road" label="Open road" />,
  <PickerItem key="closed-road" value="closed-road" label="Closed road" />,
  <PickerItem key="other" value="other" label="Other" />,
];

export default function Screen(): ReactElement {
  const { sessionCreationFlow, updateSessionCreationFlow } = useApplicationState();
  const router = useRouter();

  const { control, handleSubmit, formState } = useForm<CreateSessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      venue: sessionCreationFlow.venue,
      venueType: sessionCreationFlow.venueType as any,
      active: sessionCreationFlow.active,
    },
  });

  const onSubmit = (data: CreateSessionFormValues) => {
    console.log('Creating session with data:', data);

    updateSessionCreationFlow({
      ...sessionCreationFlow,
      venueType: data.venueType as VenueType,
      venue: data.venue,
      active: data.active,
    });

    // Call Drizzle insert here
    router.push('/session/sensor-selector');
  };

  return (
    <View className="mt-[20%] flex-grow flex-col">
      <Controller
        control={control}
        name="venue"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <TextField
              label="Venue"
              id="venue"
              placeholder="Enter venue"
              value={value}
              onChangeText={onChange}
              maxLength={75}
              className="mb-2 w-full max-w-sm"
            />
            {formState.errors.venue && (
              <Text className="text-red-500">{formState.errors.venue.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="venueType"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 max-w-sm">
            <Picker selectedValue={value} onValueChange={onChange} placeholder="Venue type">
              {venueTypeOptions}
            </Picker>
            {formState.errors.venueType && (
              <Text className="text-red-500">{formState.errors.venueType.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="active"
        render={({ field: { value, onChange } }) => (
          <View className="mb-6 flex-row items-center justify-start gap-2">
            <Toggle
              id="active"
              nativeID="active"
              value={value}
              onValueChange={onChange}
              className="ml-1"
            />
            <Text
              style={{
                lineHeight: 32, // approximately switch height
              }}
              onPress={() => onChange(!value)}>
              Active
            </Text>
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
