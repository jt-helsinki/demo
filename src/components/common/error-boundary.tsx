import React from 'react';
import { Text, View } from 'react-native';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('🔥 Unhandled error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-gray-900">
          <Text className="mb-2 text-lg font-bold text-red-500">Something went wrong</Text>
          <Text className="text-gray-400">{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
