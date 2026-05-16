import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenHeader from '@/components/ScreenHeader';

export default function Cadastro() {
  const router = useRouter()

  return (
    <View style={styles.container}>

      <ScreenHeader
        title="Cadastro"
        leftText="←"
        onLeftPress={() => router.replace('/')}
        style={styles.header}
        leftTextStyle={styles.back}
        titleStyle={styles.titleHeader}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Ops!</Text>

        <Text style={styles.subtitle}>
          Você não pode realizar esta ação sem possuir um cadastro.
        </Text>

        <PrimaryButton
          title="FAZER CADASTRO"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => router.push('/registro_pessoal' as any)}
        />

        <Text style={styles.loginText}>
          Já possui cadastro?
        </Text>

        <PrimaryButton
          title="FAZER LOGIN"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => router.push('/')}
        />
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
