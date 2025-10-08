import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertAnchor,
  AlertMethods,
  Button,
  Form,
  FormItem,
  FormSection,
  Text,
  TextField,
} from '@/components/nativewindui';

const LOGO_SOURCE = {
  uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/original-logo.28276aeb.png&w=2048&q=75',
};

export default function CredentialsScreen() {
  const insets = useSafeAreaInsets();
  const [focusedTextField, setFocusedTextField] = React.useState<
    'email' | 'password' | 'confirm-password' | null
  >(null);
  const alertRef = React.useRef<AlertMethods>(null);
  const [error, setError] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  async function onSubmit() {
    if (!email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      Platform.select({
        ios: alertRef.current?.alert({
          title: 'Email is required',
          message: 'Please enter your email',
          buttons: [{ text: 'OK' }],
        }),
      });
      setError('Email is required');
      return;
    }
    if (!password) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      Platform.select({
        ios: alertRef.current?.alert({
          title: 'Password is required',
          message: 'Please enter your password',
          buttons: [{ text: 'OK' }],
        }),
      });
      setError('Password is required');
      return;
    }
    if (!confirmPassword) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      Platform.select({
        ios: alertRef.current?.alert({
          title: 'Confirm password is required',
          message: 'Please enter your confirm password',
          buttons: [{ text: 'OK' }],
        }),
      });
      setError('Confirm password is required');
      return;
    }
    if (password !== confirmPassword) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      Platform.select({
        ios: alertRef.current?.alert({
          title: 'Passwords do not match',
          message: 'Please enter your confirm password',
          buttons: [{ text: 'OK' }],
        }),
      });
      setError('Passwords do not match');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    router.replace('/');
  }

  return (
    <>
      <View className="ios:bg-card flex-1" style={{ paddingBottom: insets.bottom }}>
        <KeyboardAwareScrollView
          bottomOffset={Platform.select({ ios: 8 })}
          bounces={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="ios:pt-12 pt-20">
          <View className="ios:px-12 flex-1 px-8">
            <View className="items-center pb-1">
              <Image
                source={LOGO_SOURCE}
                className="ios:h-12 ios:w-12 h-8 w-8"
                resizeMode="contain"
              />
              <Text variant="title1" className="ios:font-bold pb-1 pt-4 text-center">
                {Platform.select({ ios: 'Set up your credentials', default: 'Create Account' })}
              </Text>
              {Platform.OS !== 'ios' && (
                <Text className="ios:text-sm text-center text-muted-foreground">
                  Set up your credentials
                </Text>
              )}
            </View>
            <View className="ios:pt-4 pt-6">
              <Form className="gap-2">
                <FormSection className="ios:bg-background">
                  <FormItem>
                    <TextField
                      onChangeText={(text) => {
                        setEmail(text);
                      }}
                      placeholder={Platform.select({ ios: 'Email', default: '' })}
                      label={Platform.select({ ios: undefined, default: 'Email' })}
                      onSubmitEditing={() => KeyboardController.setFocusTo('next')}
                      submitBehavior="submit"
                      autoFocus
                      onFocus={() => setFocusedTextField('email')}
                      onBlur={() => setFocusedTextField(null)}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      errorMessage={error.includes('Email') ? error : undefined}
                    />
                  </FormItem>
                  <FormItem>
                    <TextField
                      onChangeText={(text) => {
                        setPassword(text);
                      }}
                      placeholder={Platform.select({ ios: 'Password', default: '' })}
                      label={Platform.select({ ios: undefined, default: 'Password' })}
                      onSubmitEditing={() => KeyboardController.setFocusTo('next')}
                      onFocus={() => setFocusedTextField('password')}
                      onBlur={() => setFocusedTextField(null)}
                      submitBehavior="submit"
                      secureTextEntry
                      returnKeyType="next"
                      textContentType="newPassword"
                      errorMessage={error.includes('Password') ? error : undefined}
                    />
                  </FormItem>
                  <FormItem>
                    <TextField
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                      }}
                      placeholder={Platform.select({ ios: 'Confirm password', default: '' })}
                      label={Platform.select({ ios: undefined, default: 'Confirm password' })}
                      onFocus={() => setFocusedTextField('confirm-password')}
                      onBlur={() => setFocusedTextField(null)}
                      onSubmitEditing={onSubmit}
                      secureTextEntry
                      returnKeyType="done"
                      textContentType="newPassword"
                      errorMessage={error.includes('Confirm password') ? error : undefined}
                    />
                  </FormItem>
                </FormSection>
              </Form>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          {Platform.OS === 'ios' ? (
            <View className="px-12 py-4">
              <Button size="lg" onPress={onSubmit}>
                <Text>Submit</Text>
              </Button>
            </View>
          ) : (
            <View className="flex-row justify-end py-4 pl-6 pr-8">
              <Button
                onPress={() => {
                  if (focusedTextField !== 'confirm-password') {
                    KeyboardController.setFocusTo('next');
                    return;
                  }
                  KeyboardController.dismiss();
                  onSubmit();
                }}>
                <Text className="text-sm">
                  {focusedTextField !== 'confirm-password' ? 'Next' : 'Submit'}
                </Text>
              </Button>
            </View>
          )}
        </KeyboardStickyView>
      </View>
      <AlertAnchor ref={alertRef} />
    </>
  );
}
