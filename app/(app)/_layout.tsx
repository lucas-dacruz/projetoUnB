import { Slot, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '../components/custom-drawer';
import { useAuth } from '../context/auth-context';
import { useEffect } from 'react';

export default function DrawerLayout() {
    const { user } = useAuth();

    return (
        <Drawer
            drawerContent={() => <CustomDrawer />}
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="home" options={{ title: 'Home' }} />
            <Drawer.Screen name="adotar" options={{ title: 'Adotar' }} />
            {user && (
                <Drawer.Screen name="detalhes_animal" options={{ title: 'Detalhes' }} />
            )}
            {user && (
                <Drawer.Screen name="meus_pets" options={{ title: 'Meus pets' }} />
            )}
        </Drawer>
  );
}

export function AppLayout() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace('/login')
        }
    }, [user]);

    if (!user) return null;
    
    return <slot />;
}