import { Courgette_400Regular } from '@expo-google-fonts/courgette';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>

      {/* MENU */}
      <View style={styles.menu}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>Olá!</Text>

      {/* TEXTO */}
      <Text style={styles.subtitle}>
        Bem vindo ao Meau!{"\n"}
        Aqui você pode adotar, doar e ajudar{"\n"}
        cães e gatos com facilidade.{"\n"}
        Qual o seu interesse?
      </Text>

      {/* BOTÕES */}
      <View style={styles.buttonsContainer}>
        <CustomButton text="ADOTAR" />
        <CustomButton text="AJUDAR" />
        <CustomButton text="CADASTRAR ANIMAL" />
      </View>

      {/* LOGIN */}
      <Text style={styles.login}>login</Text>

      {/* LOGO */}
      <Text style={styles.logo}>meau</Text>

    </View>
  );
}

function CustomButton({ text }: { text: string }) {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },

  // MENU (canto superior)
  menu: {
    position: 'absolute',
    top: 60,
    left: 30,
  },

  line: {
    width: 25,
    height: 3,
    backgroundColor: '#6FCF97',
    marginVertical: 2,
  },

  // TÍTULO
  title: {
    marginTop: 100,
    fontSize: 52,
    fontFamily: 'Courgette_400Regular',
    color: '#F2C94C'
  },

  // TEXTO
  subtitle: {
    marginTop: 30,
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 16,
    lineHeight: 22,
    width: '100%'
  },

  // BOTÕES
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

  // LOGIN
  login: {
    marginTop: 30,
    color: '#6FCF97',
    fontSize: 16,
    width: '100%',
    textAlign: 'center'
  },

  // LOGO (embaixo fixo)
  logo: {
    position: 'absolute',
    bottom: 40,
    fontSize: 36,
    color: '#6FCF97',
    fontWeight: 'bold',
  },
});