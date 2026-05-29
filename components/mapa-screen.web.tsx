import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa disponível no aplicativo</Text>
      <Text style={styles.text}>
        A visualização com Google Maps usa react-native-maps e deve ser testada no Android/iOS.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#434343',
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#88c9bf',
    height: 44,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#434343',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
