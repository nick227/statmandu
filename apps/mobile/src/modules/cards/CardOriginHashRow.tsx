import { View } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { cn } from '@/lib/utils';

interface Props {
  hash?: string;
  className?: string;
}

export function CardOriginHashRow({ hash, className }: Props) {
  if (!hash) return null;

  return (
    <View className={cn('flex-row items-center justify-between p-md bg-surface-elevated rounded-md', className)}>
      <Text className="text-muted-text">Origin Hash</Text>
      <Text className="text-brand font-mono">{hash}</Text>
    </View>
  );
}
