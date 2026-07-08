import { useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { FLOATING_TAB_BAR_STYLE } from '@/lib/tabBarStyle'

export function useImmersiveFilmTabBar(enabled: boolean) {
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return
      const parent = navigation.getParent()
      parent?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        parent?.setOptions({ tabBarStyle: FLOATING_TAB_BAR_STYLE })
      }
    }, [enabled, navigation])
  )
}
