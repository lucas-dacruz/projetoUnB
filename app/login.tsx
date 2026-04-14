import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Preencha email e senha');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logado:', userCredential.user.email);
      alert('Login realizado com sucesso!');
    } catch (error: any) {
      alert('Email ou senha inválidos');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.menu}>≡</Text>
        <Text style={styles.title}>Login</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#BDBDBD"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#BDBDBD"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.facebookButton}>
          <Text style={styles.socialText}>ENTRAR COM FACEBOOK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.socialText}>ENTRAR COM GOOGLE</Text>
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

  menu: {
    fontSize: 28,
    marginRight: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: 'Roboto_700Bold',
    color: '#434343',
  },

  form: {
    marginTop: 60,
    paddingHorizontal: 20,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    marginBottom: 30,
    paddingVertical: 10,
    fontFamily: 'Roboto_400Regular',
  },

  buttonGroup: {
    marginTop: 80,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: '#88C9BF',
    width: '80%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
  },

  primaryText: {
    fontFamily: 'Roboto_700Bold',
    color: '#434343',
  },

  facebookButton: {
    backgroundColor: '#3b5998',
    width: '80%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },

  googleButton: {
    backgroundColor: '#EA4335',
    width: '80%',
    padding: 15,
    alignItems: 'center',
  },

  socialText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
  },
});