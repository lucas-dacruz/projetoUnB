import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Cadastro() {
  const router = useRouter()

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Ops!</Text>

        <Text style={styles.subtitle}>
          Você não pode realizar esta ação sem possuir um cadastro.
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>FAZER CADASTRO</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Já possui cadastro?
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>FAZER LOGIN</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: '#A8DAD6',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  back: {
    fontSize: 24,
    marginRight: 15,
  },

  titleHeader: {
    fontSize: 24,
    fontFamily: 'Roboto_700Bold',
    color: '#434343',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },

  title: {
    fontFamily: 'Courgette_400Regular',
    fontSize: 64,
    color: '#88C9BF',
    marginBottom: 20,
  },

  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 40,
  },

  button: {
    backgroundColor: '#88C9BF',
    width: '80%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
  },

  buttonText: {
    fontFamily: 'Roboto_700Bold',
    color: '#434343',
  },

  loginText: {
    fontFamily: 'Roboto_400Regular',
    color: '#757575',
    marginBottom: 15,
  },
});