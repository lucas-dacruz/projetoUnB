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
      <Drawer.Screen name="detalhes_animal" options={{ title: 'Detalhes' }} />
      <Drawer.Screen name="meus_pets" options={{ title: 'Meus pets' }} />
    </Drawer>
  );
}