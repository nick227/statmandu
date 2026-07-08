export default function NewCardRoute() {
  // Canonical creation surface is /cards/studio.
  // Keep /cards/new as a redirect so any older links/bookmarks still work.
  const { Redirect } = require('expo-router')
  return <Redirect href="/cards/studio" />
}
