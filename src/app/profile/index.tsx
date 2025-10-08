import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertAnchor, AlertMethods, Button, Card, Text } from '@/components/nativewindui';

const LOGO_SOURCE = {
  uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/original-logo.28276aeb.png&w=2048&q=75',
};

const GOOGLE_SOURCE = {
  uri: 'https://www.pngall.com/wp-content/uploads/13/Google-Logo.png',
};

export default function AuthIndexScreen() {
  const alertRef = React.useRef<AlertMethods>(null);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="ios:justify-end flex-1 justify-center gap-4 px-8 py-4">
          <View className="items-center">
            <Image
              source={LOGO_SOURCE}
              className="ios:h-12 ios:w-12 h-8 w-8"
              resizeMode="contain"
            />
          </View>
          <View className="ios:pb-5 ios:pt-2 pb-2">
            <Text className="ios:font-extrabold text-center text-3xl font-medium">
              Familiar interface,
            </Text>
            <Text className="ios:font-extrabold pb-3.5 text-center text-3xl font-medium">
              native feel
            </Text>
            <Text className="text-center text-sm opacity-80">
              The perfect starting point for those who need to ship fast and look good doing it.
            </Text>
          </View>
          <Link href="/auth/(create-account)" asChild>
            <Button size={Platform.select({ ios: 'lg', default: 'md' })} onPressOut={lightHaptic}>
              <Text>Sign up free</Text>
            </Button>
          </Link>
          {Platform.OS === 'android' && (
            <Button
              variant="secondary"
              className="ios:border-foreground/60"
              size={Platform.select({ ios: 'lg', default: 'md' })}
              onPress={() => {
                lightHaptic();
                alertRef.current?.alert({
                  title: 'Suggestion',
                  message: 'Use @react-native-google-signin/google-signin',
                  buttons: [{ text: 'OK', style: 'cancel' }],
                });
              }}>
              <Image
                source={GOOGLE_SOURCE}
                className="absolute left-4 h-4 w-4"
                resizeMode="contain"
              />
              <Text className="ios:text-foreground">Continue with Google</Text>
            </Button>
          )}
          {Platform.OS === 'ios' && (
            <Button
              variant="secondary"
              className="ios:border-foreground/60"
              size={Platform.select({ ios: 'lg', default: 'md' })}
              onPress={() => {
                alertRef.current?.alert({
                  title: 'Suggestion',
                  message: 'Use expo-apple-authentication',
                  buttons: [{ text: 'OK', style: 'cancel' }],
                });
              }}>
              <Text className="ios:text-foreground absolute left-4 text-[22px]"></Text>
              <Text className="ios:text-foreground">Continue with Apple</Text>
            </Button>
          )}
          <Link href="/auth/(login)" asChild>
            <Button
              variant="plain"
              size={Platform.select({ ios: 'lg', default: 'md' })}
              onPressOut={lightHaptic}>
              <Text className="text-primary">Log in</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
      <AlertAnchor ref={alertRef} />
    </>
  );
}

function lightHaptic() {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
