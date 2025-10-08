import { ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useValidateSessionCode } from '@/state/server-state';
import * as Sentry from '@sentry/react-native';
import { ActivityIndicator, Button, Text, TextField } from '@/components/nativewindui';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { z } from 'zod';
import { useApplicationState } from '@/state/application-state';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SESSION_CODE_SCHEMA = z.object({
  sessionCode: z.string().length(8, 'The 8 character Session Code is required'),
});

export default function Screen(): ReactElement {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessionCreationFlow, updateSessionCreationFlow } = useApplicationState();
  const { sessionCode } = sessionCreationFlow;
  const closeDialog: () => void = () => {
    router.back();
  };

  const { control, handleSubmit, formState, clearErrors, setError } = useForm({
    resolver: zodResolver(SESSION_CODE_SCHEMA),
    defaultValues: { sessionCode: sessionCode as string },
    mode: 'onChange',
  });

  const { isPending, mutateAsync } = useValidateSessionCode();

  const onDialogSubmit = (data: { sessionCode: string }): void => {
    mutateAsync(data.sessionCode)
      .then(({ valid, id }) => {
        if (valid) {
          updateSessionCreationFlow({
            ...sessionCreationFlow,
            sessionCode: data.sessionCode,
            sessionId: id,
          });
          router.back();
        } else {
          setError('sessionCode', { type: 'manual', message: 'Invalid session code' });
        }
      })
      .catch((error) => {
        Sentry.captureException(error);
        setError('sessionCode', {
          type: 'manual',
          message: (error as any)?.mesage || 'Not a valid session ID',
        });
      });
  };

  return (
    <View className="ios:bg-card flex-1" style={{ paddingBottom: insets.bottom }}>
      <Stack.Screen
        options={{
          title: 'Forgot Password',
          headerShadowVisible: false,
        }}
      />
      <View className="grid gap-4">
        <View className="grid gap-3">
          <Controller
            control={control}
            name="sessionCode"
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value || ''}
                onChangeText={(text) => {
                  onChange(text); // update react-hook-form value
                  if (formState.errors.sessionCode) {
                    clearErrors('sessionCode'); // clear error as soon as user types
                  }
                }}
                label="Session Code"
                placeholder="Session code"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            )}
          />
          {formState.errors.sessionCode && (
            <Text className="text-red-500">{formState.errors.sessionCode.message}</Text>
          )}
        </View>
      </View>
      <Text>
        The Session Code is available inside the session screen of the web application.
      </Text>

      <Button
        onPress={handleSubmit(onDialogSubmit)}
        disabled={!formState.isValid}
        variant={!formState.isValid ? 'tonal' : 'primary'}>
        {isPending && (
          <Animated.View entering={FadeIn.delay(200)}>
            <ActivityIndicator size="small" />
          </Animated.View>
        )}
        <Text>Save</Text>
      </Button>
    </View>
  );
}
