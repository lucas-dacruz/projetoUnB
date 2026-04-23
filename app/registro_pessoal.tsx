import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegistroPessoal() {
  const router = useRouter();

  // Estados para os campos de entrada
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <View style={styles.container}>
      {/* Header padrão */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro Pessoal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>

        {/* Nome Completo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOME COMPLETO</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#BDBDBD"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        {/* Idade */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>IDADE</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua idade"
            placeholderTextColor="#BDBDBD"
            keyboardType="numeric"
            value={idade}
            onChangeText={setIdade}
          />
        </View>

        {/* E-mail */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#BDBDBD"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Estado e Cidade */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ESTADO E CIDADE</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: DF - Brasília"
            placeholderTextColor="#BDBDBD"
            value={cidade}
            onChangeText={setCidade}
          />
        </View>

        {/* Endereço */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ENDEREÇO</Text>
          <TextInput
            style={styles.input}
            placeholder="Logradouro, número, apto"
            placeholderTextColor="#BDBDBD"
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>

        <Text style={styles.sectionTitle}>INFORMAÇÕES DE PERFIL</Text>

        {/* Nome de Usuário */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOME DE USUÁRIO</Text>
          <TextInput
            style={styles.input}
            placeholder="Como quer ser chamado"
            placeholderTextColor="#BDBDBD"
            value={usuario}
            onChangeText={setUsuario}
          />
        </View>

        {/* Senha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#BDBDBD"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => alert('Cadastro realizado!')}>
          <Text style={styles.buttonText}>FAZER CADASTRO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    backgroundColor: '#CFE9E5',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backIcon: { 
    fontSize: 24, 
    color: '#434343', 
    marginRight: 20 
  },
  titleHeader: { 
    fontSize: 20, 
    fontFamily: 'Roboto_500Medium', 
    color: '#434343' 
  },
  form: { 
    padding: 20 
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#88C9BF',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
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
  button: {
    backgroundColor: '#88C9BF',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    borderRadius: 2,
    elevation: 2,
    marginBottom: 40
  },
  buttonText: { 
    color: '#434343', 
    fontSize: 14, 
    fontFamily: 'Roboto_400Regular' 
  },
});