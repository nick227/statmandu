import React from 'react'
import { Redirect } from 'expo-router'
import { CardDesignWorkshopScreen } from '@/modules/card-design/workshop/CardDesignWorkshopScreen'

export default function CardDesignWorkshopRoute() {
  // Restrict Card Design Workshop to development environments
  if (!__DEV__ && process.env.NODE_ENV === 'production') {
    return <Redirect href={'/cards/studio' as any} />
  }

  return <CardDesignWorkshopScreen />
}
