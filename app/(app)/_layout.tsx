import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '../../components/custom-drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <CustomDrawer />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="home" options={{ title: 'Home' }} />
      <Drawer.Screen name="adotar" options={{ title: 'Adotar' }} />
      <Drawer.Screen name="detalhes-animal" options={{ title: 'Detalhes' }} />
      <Drawer.Screen name="meus-pets" options={{ title: 'Meus pets' }} />
      <Drawer.Screen name="chat" options={{ title: 'Chat' }} />
      <Drawer.Screen name="mapa" options={{ title: 'Mapa' }} />
    </Drawer>
  );
}
