import { View, Pressable } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { StatmanCard } from './types';
import { CardStatusBadge } from './CardStatusBadge';
import { CardEditionBadge } from './CardEditionBadge';
import { SmartImage } from '@/shared/media/SmartImage';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';

interface Props {
  card: StatmanCard;
  className?: string;
}

export function CardManagerRow({ card, className }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/cards/${card.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'flex-row p-md bg-surface border border-white/5 rounded-lg gap-md items-center active:opacity-70',
        className
      )}
    >
      <View className="w-16 h-24 rounded-md overflow-hidden bg-surface-elevated justify-center items-center">
        {card.photoUrl ? (
          <SmartImage uri={card.photoUrl} className="w-full h-full" />
        ) : (
          <Text className="text-muted-text text-xs text-center">No Image</Text>
        )}
      </View>

      <View className="flex-1 gap-xs justify-center">
        <Text className="text-foreground font-semibold" numberOfLines={1}>
          {card.athleteName}
        </Text>
        <Text className="text-muted-text" numberOfLines={1}>
          {card.type} • {card.style}
        </Text>
        
        <View className="flex-row gap-sm mt-xs flex-wrap">
          <CardStatusBadge status={card.status} />
          {card.status !== 'draft' && <CardEditionBadge edition={card.edition} />}
        </View>
      </View>
    </Pressable>
  );
}
