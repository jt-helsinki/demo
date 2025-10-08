
import * as React from 'react';
import { PropsWithChildren, ReactElement } from 'react';
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/components/hooks/use-color-scheme';

export interface BasicLayoutProps {
  headerOptions?: any;
  style?: any;
}

export function BasicLayout({
  children,
  headerOptions,
  style,
}: PropsWithChildren<BasicLayoutProps>): ReactElement {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <Stack.Screen options={headerOptions} />
      <View className="mt-15 flex flex-1 flex-col bg-gray-900 pb-4 pl-4 pr-4 pt-10" style={style}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
