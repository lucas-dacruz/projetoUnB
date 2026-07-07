import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Courgette_400Regular } from "@expo-google-fonts/courgette"
import { Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto"
import { usePushNotifications } from '@/hooks/use-push-notifications';

export default function Layout() {
  usePushNotifications();

  const [fontsLoaded] = useFonts({
    Courgette_400Regular,
    Roboto_400Regular,
    Roboto_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <Slot />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
