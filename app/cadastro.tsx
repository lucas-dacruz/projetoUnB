import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Cadastro() {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.back}>←</Text>
        <Text style={styles.titleHeader}>Cadastro</Text>
      </View>

      {/* CONTEÚDO */}
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

        <TouchableOpacity style={styles.button}>
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

  /* HEADER */
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

  /* CONTEÚDO */
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