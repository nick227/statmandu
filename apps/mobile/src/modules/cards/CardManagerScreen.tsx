import { View, FlatList } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import { Text } from '@/shared/ui/Text';
import { Button } from '@/shared/ui/Button';
import { LoadingState } from '@/shared/ui/LoadingState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useCards } from './useCards';
import { CardManagerRow } from './CardManagerRow';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

export function CardManagerScreen() {
  const { cards, isLoading, fetchCards } = useCards();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleCreateNew = () => {
    router.push('/cards/new');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View className="flex-1 px-md pt-lg">
        <View className="flex-row justify-between items-center mb-lg">
          <Text variant="entityName" className="text-foreground">My Cards</Text>
          <Button size="sm" onPress={handleCreateNew}>
            Create New
          </Button>
        </View>

        {isLoading && cards.length === 0 ? (
          <LoadingState label="Loading cards" />
        ) : (
          <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CardManagerRow card={item} className="mb-md" />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <EmptyState
                icon={CreditCard}
                title="No cards yet"
                description="Create your first Statman card to share with fans."
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
