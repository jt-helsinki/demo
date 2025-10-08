// src/components/ui/Select.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { cn } from '@/lib/utils'; // optional Tailwind merge helper

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Tailwind-based, bottom-sheet single select
 * Works with React Native + NativeWind
 */
export const Select = ({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option',
  className,
  disabled,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | null | undefined>(defaultValue);

  // Keep internalValue in sync with controlled value prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const selected = options.find((opt) => opt.value === internalValue);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onValueChange(val);
    setOpen(false);
  };

  return (
    <View className={cn('w-full max-w-sm', className)}>
      {label && <Text className="mb-2 text-sm font-medium text-foreground">{label}</Text>}

      {/* Trigger */}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'flex-row justify-between rounded-md border border-input bg-background px-3 py-3',
          'active:bg-input/50 dark:bg-input/30 dark:border-gray-700',
          disabled && 'opacity-50'
        )}>
        <Text className={cn('text-sm', selected ? 'text-foreground' : 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color="#888" />
      </Pressable>

      {/* Modal Dropdown */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-gray-900/40"
          onPress={() => setOpen(false)}>
          <Animated.View
            entering={FadeInUp}
            exiting={FadeOutDown}
            style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
            className="max-h-[60%] w-72 overflow-hidden rounded-md bg-gray-900 shadow-lg">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={cn(
                    'flex-row items-center justify-between rounded-md px-3 py-3',
                    internalValue === item.value ? 'bg-accent/20' : 'active:bg-accent/10'
                  )}>
                  <Text
                    className={cn(
                      'mr-2 text-base text-foreground',
                      internalValue === item.value && 'font-medium text-accent-foreground'
                    )}>
                    {item.label}
                  </Text>
                  {internalValue === item.value && <Check size={18} color="#00bfa6" />}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
