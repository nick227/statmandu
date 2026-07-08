import { View } from 'react-native'
import { useMemo, useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { getActAsUserId, setActAsUserId } from '@/lib/adminHeaders'

export function ConnectedActAsBar() {
  const current = getActAsUserId()
  const [value, setValue] = useState(current ?? '')
  const isDirty = (current ?? '') !== value

  const subtitle = useMemo(() => {
    if (!current) return 'Not impersonating.'
    return `Acting as user: ${current}`
  }, [current])

  return (
    <Card>
      <CardContent className="gap-sm">
        <Text className="font-semibold">Act as</Text>
        <Text variant="caption">{subtitle}</Text>
        <Input placeholder="User ID to act as (optional)" value={value} onChangeText={setValue} autoCapitalize="none" />
        <View className="flex-row gap-sm">
          <Button
            size="sm"
            className="flex-1"
            disabled={!isDirty}
            onPress={() => setActAsUserId(value.trim() ? value.trim() : null)}
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            disabled={!current && value.trim() === ''}
            onPress={() => {
              setActAsUserId(null)
              setValue('')
            }}
          >
            Clear
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}

