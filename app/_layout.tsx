import { Slot } from 'expo-router';

import { useFonts } from 'expo-font';
import { Courgette_400Regular } from "@expo-google-fonts/courgette"
import { Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto"

import { AuthProvider } from '../context/auth-context';

// realizando teste

export default function Layout() {
    const [fontsLoaded] = useFonts({
        Courgette_400Regular,
        Roboto_400Regular,
        Roboto_700Bold,
    });

    if (!fontsLoaded) {
        return <text>Carregando...</text>;
    }

    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}