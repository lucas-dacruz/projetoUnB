import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegistroAnimal() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  const [idade, setIdade] = useState('');
  const [sobre, setSobre] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro do Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.sectionTitle}>NOME DO ANIMAL</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome do animal"
            placeholderTextColor="#BDBDBD"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <Text style={styles.sectionTitle}>CARACTERÍSTICAS</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ESPÉCIE</Text>
          <TextInput
            style={styles.input}
            placeholder="Cachorro ou Gato"
            placeholderTextColor="#BDBDBD" // Adicionado para ficar cinza claro
            value={especie}
            onChangeText={setEspecie}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>SEXO</Text>
          <TextInput
            style={styles.input}
            placeholder="Macho ou Fêmea"
            placeholderTextColor="#BDBDBD" // Adicionado para ficar cinza claro
            value={sexo}
            onChangeText={setSexo}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>PORTE</Text>
          <TextInput
            style={styles.input}
            placeholder="Pequeno, Médio ou Grande"
            placeholderTextColor="#BDBDBD" // Adicionado para ficar cinza claro
            value={porte}
            onChangeText={setPorte}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>IDADE</Text>
          <TextInput
            style={styles.input}
            placeholder="Filhote, Adulto ou Idoso"
            placeholderTextColor="#BDBDBD" // Adicionado para ficar cinza claro
            value={idade}
            onChangeText={setIdade}
          />
        </View>

        <Text style={styles.sectionTitle}>SOBRE O ANIMAL</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>DESCRIÇÃO</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Compartilhe a história ou temperamento do pet"
            placeholderTextColor="#BDBDBD" // Adicionado para ficar cinza claro
            multiline={true}
            numberOfLines={4}
            value={sobre}
            onChangeText={setSobre}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => alert('Animal ' + nome + ' cadastrado com sucesso!')}>
          <Text style={styles.buttonText}>CADASTRAR ANIMAL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#CFE9E5',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, fontFamily: 'Roboto_500Medium', color: '#434343' },
  form: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#88C9BF',
    marginTop: 15,
    marginBottom: 15,
  },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 12,
    color: '#88C9BF',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    paddingVertical: 8,
    fontSize: 16,
    color: '#434343',
    fontFamily: 'Roboto_400Regular',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#F2C94C',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 2,
    elevation: 2,
    marginBottom: 40,
  },
  buttonText: { color: '#434343', fontSize: 14, fontFamily: 'Roboto_400Regular', fontWeight: 'bold' },
});