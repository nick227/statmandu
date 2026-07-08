import { View } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { CardEditionInfo } from './types';
import { cn } from '@/lib/utils';

interface Props {
  edition: CardEditionInfo;
  className?: string;
}

export function CardEditionBadge({ edition, className }: Props) {
  let label: string = edition.type;
  if (edition.type === 'Limited Edition' && edition.maxSize) {
    label = `${edition.issuedCount}/${edition.maxSize}`;
  } else if (edition.type === '1-of-1') {
    label = '1-of-1';
  }

  return (
    <View className={cn('bg-surface-elevated px-sm py-xs rounded-pill self-start', className)}>
      <Text className="text-stat-label text-foreground">{label}</Text>
    </View>
  );
}
