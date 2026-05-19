import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<{}>>();

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.menu} onPress={() => navigation.openDrawer()}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </TouchableOpacity>

      <Text style={styles.title}>Olá!</Text>

      <Text style={styles.subtitle}>
        Bem vindo ao Meau!{"\n"}
        Aqui você pode adotar, doar e ajudar{"\n"}
        cães e gatos com facilidade.{"\n"}
        Qual o seu interesse?
      </Text>

      <View style={styles.buttonsContainer}>
        <CustomButton text="ADOTAR" 
        onPress={() => router.push('/adotar' as any)}/>
        <CustomButton 
          text="CADASTRAR ANIMAL"
          onPress={() => router.push('../registro-animal')}/>
      </View>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.login}>login</Text>
      </TouchableOpacity>

      <Text style={styles.logo}>meaü</Text>

    </View>
  );
}

function CustomButton({ text, onPress }: { text: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },

  menu: {
    position: 'absolute',
    top: 60,
    left: 30,
  },

  line: {
    width: 25,
    height: 6,
    backgroundColor: '#6FCF97',
    marginVertical: 2,
  },

  title: {
    marginTop: 100,
    fontSize: 52,
    fontFamily: 'Courgette_400Regular',
    color: '#F2C94C',
  },

  subtitle: {
    marginTop: 30,
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 16,
    lineHeight: 22,
    width: '100%',
  },

  buttonsContainer: {
    marginTop: 50,
    width: '80%',
    gap: 15,
  },

  button: {
    backgroundColor: '#F2C94C',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },

  login: {
    marginTop: 30,
    color: '#6FCF97',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },

  logo: {
    position: 'absolute',
    bottom: 40,
    fontSize: 36,
    color: '#6FCF97',
    fontFamily: 'Courgette_400Regular',
    transform: 'rotate(-20deg)'
  },
});