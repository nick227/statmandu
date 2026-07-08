import { View } from 'react-native';
import { Text } from '@/shared/ui/Text';
import { SmartImage } from '@/shared/media/SmartImage';
import { CardBuilderState, CardStyle } from './types';
import { cn } from '@/lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  state: CardBuilderState;
  className?: string;
}

const STYLE_MAP: Record<CardStyle, { bg: string[]; text: string; border: string }> = {
  'Classic': { bg: ['#ffffff', '#e2e8f0'], text: 'text-slate-900', border: 'border-slate-300' },
  'Neon': { bg: ['#ff00ff', '#00ffff'], text: 'text-white', border: 'border-cyan-300' },
  'Dark Mode': { bg: ['#1a1a1a', '#333333'], text: 'text-white', border: 'border-white/10' },
  'Gold': { bg: ['#fbbf24', '#b45309'], text: 'text-amber-900', border: 'border-amber-300' },
  'Vintage': { bg: ['#fef3c7', '#d97706'], text: 'text-amber-900', border: 'border-amber-700' },
};

export function StatmanCardPreview({ state, className }: Props) {
  const styleConfig = state.style ? STYLE_MAP[state.style] : STYLE_MAP['Classic'];

  return (
    <View className={cn('w-full aspect-[2.5/3.5] rounded-2xl overflow-hidden border-4 shadow-xl', styleConfig.border, className)}>
      <LinearGradient colors={styleConfig.bg} className="absolute inset-0" />
      
      {state.photoUrl ? (
        <SmartImage source={{ uri: state.photoUrl }} className="w-full h-2/3" resizeMode="cover" />
      ) : (
        <View className="w-full h-2/3 bg-black/10 justify-center items-center">
          <Text className={cn('text-opacity-50 text-xl font-bold', styleConfig.text)}>
            {state.athleteName || 'SELECT PHOTO'}
          </Text>
        </View>
      )}

      <View className="flex-1 p-lg justify-between">
        <View>
          <Text variant="heading-1" className={cn('text-3xl font-black uppercase tracking-tight', styleConfig.text)} numberOfLines={1}>
            {state.athleteName || 'ATHLETE NAME'}
          </Text>
          <Text className={cn('text-sm font-bold uppercase opacity-80', styleConfig.text)}>
            {state.type || 'CARD TYPE'}
          </Text>
        </View>

        <View className="flex-row justify-between items-end">
          <View className={cn('px-sm py-xs rounded-full bg-black/10')}>
            <Text className={cn('text-xs font-bold', styleConfig.text)}>
              STATMAN
            </Text>
          </View>
          {state.releaseType === '1-of-1' && (
            <Text className={cn('text-lg font-black', styleConfig.text)}>1/1</Text>
          )}
          {state.releaseType === 'Limited Edition' && state.editionSize && (
            <Text className={cn('text-sm font-bold', styleConfig.text)}>XX/{state.editionSize}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
