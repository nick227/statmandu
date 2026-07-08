import { View, Pressable } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { ReleaseType } from './types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

interface Props {
  selected?: ReleaseType;
  editionSize?: number;
  onSelect: (type: ReleaseType, size?: number) => void;
}

const RELEASE_TYPES: { type: ReleaseType; title: string; description: string }[] = [
  { type: 'Private Draft', title: 'Keep Private', description: 'Save as a draft, visible only to you.' },
  { type: 'Public Unlimited', title: 'Public & Unlimited', description: 'Anyone can claim this card.' },
  { type: 'Limited Edition', title: 'Limited Edition', description: 'Set a maximum number of claims.' },
  { type: '1-of-1', title: '1-of-1 Exclusive', description: 'Only one fan can ever claim this card.' },
];

export function CardReleasePicker({ selected, editionSize, onSelect }: Props) {
  return (
    <View className="gap-md py-md">
      {RELEASE_TYPES.map(({ type, title, description }) => {
        const isSelected = selected === type;
        return (
          <Pressable
            key={type}
            onPress={() => onSelect(type, type === 'Limited Edition' ? (editionSize || 100) : undefined)}
            className={cn(
              'p-md rounded-xl border',
              isSelected ? 'bg-brand/10 border-brand' : 'bg-surface border-white/10'
            )}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className={cn('font-semibold', isSelected ? 'text-brand' : 'text-foreground')}>
                  {title}
                </Text>
                <Text className="text-muted-text mt-xs">{description}</Text>
              </View>
              <View className={cn(
                'w-6 h-6 rounded-full border-2 items-center justify-center',
                isSelected ? 'border-brand' : 'border-white/20'
              )}>
                {isSelected && <View className="w-3 h-3 rounded-full bg-brand" />}
              </View>
            </View>
            
            {isSelected && type === 'Limited Edition' && (
              <View className="mt-md pt-md border-t border-white/10 flex-row items-center justify-between">
                <Text className="text-foreground">Edition Size</Text>
                <View className="flex-row items-center gap-md">
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onSelect(type, Math.max(10, (editionSize || 100) - 10))}
                  >
                    -
                  </Button>
                  <Text className="text-lg font-bold w-12 text-center">{editionSize || 100}</Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onSelect(type, (editionSize || 100) + 10)}
                  >
                    +
                  </Button>
                </View>
              </View>
            )}
          </Pressable>
        );
      })}

      <View className="mt-md p-md bg-white/5 rounded-lg">
        <Text className="text-muted-text text-sm text-center">
          Edition size locks after publish.
        </Text>
      </View>
    </View>
  );
}
