
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Animated as NativeAnimated, Dimensions, StyleSheet, View } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { BarcodeScanningResult } from 'expo-camera/build/Camera.types';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActivityIndicator, Button, Text, TextField } from '@/components/nativewindui';
import { SessionFlow, useApplicationState } from '@/state/application-state';
import { useValidateSessionCode, useValidateSessionId } from '@/state/server-state';
import * as Sentry from '@sentry/react-native';

const SESSION_ID_SCHEMA = z.object({
  sessionId: z.string().length(32, 'The 32 character Session ID is required'),
});

const { width } = Dimensions.get('window');
const CAMERA_SIZE = width * 0.85; // square 70% of screen width

export default function Screen(): ReactElement {
  const { currentSessionId } = useApplicationState();

  const [showConnected, setShowConnected] = useState(!!currentSessionId);
  const slideAnim = useRef(new NativeAnimated.Value(0)).current;

  const firstRender = useRef(true);
  const prevSession = useRef(currentSessionId);

  useEffect((): void => {
    if (firstRender.current) {
      firstRender.current = false;
      prevSession.current = currentSessionId;
      return; // skip animation on first mount
    }

    if (prevSession.current !== currentSessionId) {
      // Slide out current view
      const direction = showConnected ? width : -width;
      NativeAnimated.timing(slideAnim, {
        toValue: direction,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // Swap component
        setShowConnected(!!currentSessionId);
        // Reset position off-screen on opposite side
        slideAnim.setValue(-direction);
        // Slide in new component
        NativeAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }

    prevSession.current = currentSessionId;
  }, [currentSessionId]);

  return (
    <View className="mt-[20%] px-4">
      {showConnected ? <SessionConnected /> : <QRScannerCamera />}
    </View>
  );
}

function QRScannerCamera(): ReactElement {
  const router = useRouter();
  const { sessionCreationFlow, updateSessionCreationFlow } = useApplicationState();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState(sessionCreationFlow.sessionId);
  const { isPending, mutateAsync } = useValidateSessionId();

  const { control, handleSubmit, setValue, formState, setError } = useForm<{ sessionId: string }>({
    resolver: zodResolver(SESSION_ID_SCHEMA),
    defaultValues: { sessionId: sessionCreationFlow.sessionId || '' },
    mode: 'onChange',
  });

  // Request camera permission
  useEffect((): void => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const openSessionCodeDialog: () => void = (): void => {
    router.navigate('/session/session-code-modal');
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult): void => {
    if (!data || !data.startsWith('app:')) return;
    const scannedId = data.replace('app:', '');
    setSessionIdFn(scannedId);
  };

  const setSessionIdFn = (sessionId: string): void => {
    setSessionId(sessionId); // update form value + validate
    setValue('sessionId', sessionId, { shouldValidate: true }); // update form value + validate
  };

  const onSubmit = (data: { sessionId: string }): void => {
    mutateAsync(data.sessionId)
      .then(({ valid, session }) => {
        if (valid) {
          updateSessionCreationFlow({
            ...sessionCreationFlow,
            sessionId: session.id,
            sessionCode: session.code,
          });
          router.push('/session/sensor-selector');
        } else {
          console.log('session', session);
          setError('sessionId', { type: 'manual', message: 'Invalid session id' });
        }
      })
      .catch((error) => {
        Sentry.captureException(error);
        setError('sessionId', {
          type: 'manual',
          message: (error as any)?.mesage || 'Network error validating session id',
        });
      });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  return (
    <>
      <View className="flex">
        <View className="flex-col">
          <Text className="mb-6">
            Scan the session QR code in the web application to connect to your current
            session. Alternatively, you can enter the session code manually in the field below.
          </Text>
        </View>
      </View>
      <View className="flex-grow gap-8">
        {hasPermission && (
          <View className="items-center">
            <CameraView
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              style={{
                width: CAMERA_SIZE,
                height: CAMERA_SIZE,
                borderRadius: 15,
                overflow: 'hidden',
              }}
            />
          </View>
        )}
        <View className="gap-1.5">
          <Controller
            control={control}
            name="sessionId"
            render={({ field: { value, onChange } }) => (
              <>
                <TextField
                  id="sessionId"
                  label="Session ID"
                  editable={false}
                  onPress={openSessionCodeDialog}
                  defaultValue={sessionId || ''}
                  value={sessionId || ''}
                  onChangeText={(text) => setSessionId(text)}
                  maxLength={32}
                  placeholder="your current session id"
                  keyboardType="default"
                  autoCapitalize="characters"
                  returnKeyType="send"
                />
                {formState.errors?.sessionId && (
                  <Text className="text-red-500">{formState.errors.sessionId.message}</Text>
                )}
              </>
            )}
          />
        </View>
        <View className="mt-8">
          <Button
            onPress={handleSubmit(onSubmit)}
            className="w-full"
            disabled={!!formState.errors.sessionId}
            variant={formState.errors.sessionId ? 'tonal' : 'primary'}>
            {isPending && (
              <Animated.View entering={FadeIn.delay(200)}>
                <ActivityIndicator size="small" />
              </Animated.View>
            )}
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </>
  );
}

interface SessionIdDialogProps {
  sessionFlow: SessionFlow;
  setSessionFlow: (sessionFlow: SessionFlow) => void;
  setSessionId: (sessionId: string) => void;
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

function SessionConnected(): ReactElement {
  const { currentSessionId, updateSessionId } = useApplicationState();

  const disconnect: () => void = (): void => {
    updateSessionId('');
  };

  return (
    <View className="flex-1 items-center p-4">
      {/* Spacer to push content 1/3 down */}
      <View style={{ flex: 1 / 5 }} />

      {/* Info section */}
      <View className="mb-6 items-center gap-4">
        <Text>Currently connected to session:</Text>
        <Text className="font-mono text-lg">{currentSessionId}</Text>
      </View>

      {/* Disconnect button */}
      <Button onPress={disconnect} variant="primary" className="mt-4 w-full max-w-xs">
        <Text>Disconnect current session</Text>
      </Button>

      {/* Optional bottom spacer */}
      <View style={{ flex: 2 / 3 }} />
    </View>
  );
}
