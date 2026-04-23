import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '../../components/CustomDrawer';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <CustomDrawer />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="home" options={{ title: 'Home' }} />
    </Drawer>
  );
}