import { useState, useCallback } from 'react';
import { CardBuilderState, CardType, CardStyle, ReleaseType } from './types';

export type BuilderStep = 
  | 'subject' 
  | 'photo' 
  | 'type' 
  | 'style' 
  | 'preview' 
  | 'release' 
  | 'publish';

const STEPS: BuilderStep[] = [
  'subject',
  'photo',
  'type',
  'style',
  'preview',
  'release',
  'publish'
];

export function useCardBuilder(initialState?: Partial<CardBuilderState>) {
  const [state, setState] = useState<CardBuilderState>(initialState || {
    // Default values if needed
  });
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updateState = useCallback((updates: Partial<CardBuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: BuilderStep) => {
    const index = STEPS.indexOf(step);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  }, []);

  return {
    state,
    updateState,
    currentStep: STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: STEPS.length,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === STEPS.length - 1,
  };
}
