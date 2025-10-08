import { router, Stack } from 'expo-router';
import { Linking, Platform, View } from 'react-native';

import { Avatar, AvatarFallback } from '@/components/nativewindui/Avatar';
import { Button } from '@/components/nativewindui/Button';
import { Icon } from '@/components/nativewindui/Icon';
import {
  List,
  ListItem,
  ListRenderItemInfo,
  ListSectionHeader,
} from '@/components/nativewindui/List';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

const SCREEN_OPTIONS = {
  title: 'Profile',
  headerTransparent: Platform.OS === 'ios',
  headerBlurEffect: 'systemMaterial',
} as const;

export default function Profile() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <List
        variant="insets"
        data={DATA}
        sectionHeaderAsGap={Platform.OS === 'ios'}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeaderComponent />}
        ListFooterComponent={<ListFooterComponent />}
      />
    </>
  );
}

function renderItem(info: ListRenderItemInfo<DataItem>) {
  return <Item info={info} />;
}

function Item({ info }: { info: ListRenderItemInfo<DataItem> }) {
  if (typeof info.item === 'string') {
    return <ListSectionHeader {...info} />;
  }
  return (
    <ListItem
      titleClassName="text-lg"
      rightView={
        <View className="flex-1 flex-row items-center gap-0.5 px-2">
          {!!info.item.value && <Text className="text-muted-foreground">{info.item.value}</Text>}
          <Icon name="chevron.right" className="text-muted-foreground/80 ios:size-4" />
        </View>
      }
      onPress={info.item.onPress}
      {...info}
    />
  );
}

function ListHeaderComponent() {
  return (
    <View className="ios:pb-8 items-center pb-4 pt-8">
      <Avatar alt="Zach Nugent's Profile" className="h-24 w-24">
        <AvatarFallback>
          <Text
            variant="largeTitle"
            className={cn(
              'font-medium text-white dark:text-background',
              Platform.OS === 'ios' && 'dark:text-foreground'
            )}>
            ZN
          </Text>
        </AvatarFallback>
      </Avatar>
      <View className="p-1" />
      <Text variant="title1">Zach Nugent</Text>
      <Text className="text-muted-foreground">@mrzachnugent</Text>
    </View>
  );
}

function ListFooterComponent() {
  return (
    <View className="ios:px-0 px-4 pt-8">
      <Button
        size="lg"
        variant={Platform.select({ ios: 'primary', default: 'secondary' })}
        className="border-border bg-card">
        <Text className="text-destructive">Log Out</Text>
      </Button>
    </View>
  );
}

type DataItem =
  | string
  | {
      id: string;
      title: string;
      value?: string;
      subTitle?: string;
      onPress: () => void;
    };

const DATA: DataItem[] = [
  ...(Platform.OS !== 'ios' ? ['Basic info'] : []),
  {
    id: 'name',
    title: 'Name',
    ...(Platform.OS === 'ios' ? { value: 'Zach Nugent' } : { subTitle: 'Zach Nugent' }),
    onPress: () => router.push('/profile/name'),
  },
  {
    id: 'username',
    title: 'Username',
    ...(Platform.OS === 'ios' ? { value: '@mrzachnugent' } : { subTitle: '@mrzachnugent' }),
    onPress: () => router.push('/profile/username'),
  },
  ...(Platform.OS !== 'ios' ? ['Stay up to date'] : ['']),
  {
    id: '4',
    title: 'Notifications',
    ...(Platform.OS === 'ios' ? { value: 'Push' } : { subTitle: 'Push' }),
    onPress: () => router.push('/profile/notifications'),
  },
  'Help',
  {
    id: '6',
    title: 'Support',
    ...(Platform.OS === 'ios' ? { value: 'Discord' } : { subTitle: 'Discord' }),
    onPress: () => Linking.openURL('https://nativewindui.com/discord'),
  },
  {
    id: '7',
    title: 'About',
    ...(Platform.OS === 'ios' ? { value: 'NativewindUI' } : { subTitle: 'NativewindUI' }),
    onPress: () => Linking.openURL('https://nativewindui.com/'),
  },
];
