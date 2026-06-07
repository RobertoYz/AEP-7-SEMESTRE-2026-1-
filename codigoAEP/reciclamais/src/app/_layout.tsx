import { Stack } from 'expo-router';

export default function LayoutPrincipal() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}