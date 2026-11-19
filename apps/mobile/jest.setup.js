// React 19 requires this flag for test renderer act() updates across async assertions.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => {}),
  notificationAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'Light' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning' },
}))

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native')
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: (val) => ({ value: val }),
    useAnimatedStyle: (cb) => cb(),
    withTiming: (toVal) => toVal,
    withSequence: (...args) => args[0],
    FadeIn: {},
    FadeInDown: {},
    FadeInRight: {},
    Layout: {},
    runOnJS: (fn) => fn,
    Easing: { linear: () => {} },
  }
})

