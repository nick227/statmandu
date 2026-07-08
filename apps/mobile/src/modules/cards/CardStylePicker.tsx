import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { CardStyle } from './types';
import { cn } from '@/lib/utils';

interface Props {
  selected?: CardStyle;
  onSelect: (style: CardStyle) => void;
}

const CARD_STYLES: { style: CardStyle; description: string; colors: string[] }[] = [
  { style: 'Classic', description: 'Clean and timeless', colors: ['#ffffff', '#e2e8f0'] },
  { style: 'Neon', description: 'Vibrant cyberpunk aesthetic', colors: ['#ff00ff', '#00ffff'] },
  { style: 'Dark Mode', description: 'Sleek dark theme', colors: ['#1a1a1a', '#333333'] },
  { style: 'Gold', description: 'Premium metallic finish', colors: ['#fbbf24', '#b45309'] },
  { style: 'Vintage', description: 'Retro trading card feel', colors: ['#fef3c7', '#d97706'] },
];

export function CardStylePicker({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 16, gap: 16 }}
    >
      {CARD_STYLES.map(({ style, description, colors }) => {
        const isSelected = selected === style;

        return (
          <Pressable
            key={style}
            onPress={() => onSelect(style)}
            className={cn(
              'w-40 h-56 rounded-xl p-md justify-between border-2',
              isSelected ? 'border-brand bg-brand/10' : 'border-transparent bg-surface-elevated'
            )}
          >
            <View className="flex-row gap-xs">
              {colors.map((c, i) => (
                <View key={i} style={{ backgroundColor: c }} className="w-4 h-4 rounded-full border border-black/20" />
              ))}
            </View>
            
            <View>
              <Text className={cn('font-semibold', isSelected ? 'text-brand' : 'text-foreground')}>
                {style}
              </Text>
              <Text className="text-muted-text mt-xs text-xs">{description}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
