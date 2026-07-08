import { View, Pressable } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { CardType } from './types';
import { cn } from '@/lib/utils';

interface Props {
  selected?: CardType;
  onSelect: (type: CardType) => void;
}

const CARD_TYPES: { type: CardType; description: string; icon: string }[] = [
  { type: 'Profile', description: 'Standard athlete profile card', icon: '👤' },
  { type: 'Big Game', description: 'Highlight a spectacular performance', icon: '🔥' },
  { type: 'Milestone', description: 'Commemorate a career achievement', icon: '🏆' },
  { type: 'Season', description: 'Year-in-review summary card', icon: '📅' },
  { type: 'Highlight', description: 'Showcase a specific play', icon: '⭐' },
];

export function CardTypePicker({ selected, onSelect }: Props) {
  return (
    <View className="gap-md py-md">
      {CARD_TYPES.map(({ type, description, icon }) => {
        const isSelected = selected === type;
        
        return (
          <Pressable key={type} onPress={() => onSelect(type)} className="active:opacity-70">
            <View className={cn(
              'p-md rounded-xl border flex-row items-center gap-md',
              isSelected ? 'bg-brand/10 border-brand' : 'bg-surface border-white/10'
            )}>
              <View className="w-12 h-12 bg-white/5 rounded-full items-center justify-center">
                <Text className="text-xl">{icon}</Text>
              </View>
              <View className="flex-1">
                <Text className={cn('font-semibold', isSelected ? 'text-brand' : 'text-foreground')}>
                  {type}
                </Text>
                <Text className="text-muted-text mt-xs">{description}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
