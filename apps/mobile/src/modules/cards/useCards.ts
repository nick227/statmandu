import { useState, useCallback } from 'react';
import { StatmanCard, CardBuilderState, CardStatus } from './types';

// Mock initial data
const MOCK_CARDS: StatmanCard[] = [
  {
    id: 'c_101',
    athleteId: 'a_1',
    athleteName: 'John Doe',
    type: 'Profile',
    style: 'Classic',
    status: 'published',
    edition: { type: '1-of-1', maxSize: 1, issuedCount: 1 },
    originHash: '0x123abc456def789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c_102',
    athleteId: 'a_1',
    athleteName: 'John Doe',
    type: 'Highlight',
    style: 'Neon',
    status: 'draft',
    edition: { type: 'Private Draft', issuedCount: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function useCards() {
  const [cards, setCards] = useState<StatmanCard[]>(MOCK_CARDS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setCards([...MOCK_CARDS]);
    setIsLoading(false);
  }, []);

  const saveDraft = useCallback(async (state: CardBuilderState): Promise<StatmanCard> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const newCard: StatmanCard = {
      id: `c_${Date.now()}`,
      athleteId: state.athleteId || 'unknown',
      athleteName: state.athleteName || 'Unknown Athlete',
      photoUrl: state.photoUrl,
      type: state.type || 'Profile',
      style: state.style || 'Classic',
      status: 'draft',
      edition: { type: 'Private Draft', issuedCount: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCards(prev => [newCard, ...prev]);
    setIsLoading(false);
    return newCard;
  }, []);

  const publishCard = useCallback(async (state: CardBuilderState): Promise<StatmanCard> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate longer generation time
    
    const newCard: StatmanCard = {
      id: `c_${Date.now()}`,
      athleteId: state.athleteId || 'unknown',
      athleteName: state.athleteName || 'Unknown Athlete',
      photoUrl: state.photoUrl,
      type: state.type || 'Profile',
      style: state.style || 'Classic',
      status: 'published',
      edition: { 
        type: state.releaseType || 'Public Unlimited', 
        maxSize: state.releaseType === '1-of-1' ? 1 : state.editionSize,
        issuedCount: 1 
      },
      originHash: `0x${Math.random().toString(16).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCards(prev => [newCard, ...prev]);
    setIsLoading(false);
    return newCard;
  }, []);

  const getCardById = useCallback((id: string) => {
    return cards.find(c => c.id === id);
  }, [cards]);

  return {
    cards,
    isLoading,
    fetchCards,
    saveDraft,
    publishCard,
    getCardById
  };
}
