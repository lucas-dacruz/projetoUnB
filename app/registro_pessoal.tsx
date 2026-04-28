import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CadastroPessoalForm() {
  const router = useRouter();

  // Estados para os campos (Layout 4.3)
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = () => {
    // 1. Verificação de obrigatoriedade
    if (!nome || !idade || !email || !estado || !cidade || !endereco || !telefone || !usuario || !senha || !confirmarSenha) {
      if (Platform.OS === 'web') {
        alert("Campos Obrigatórios: Por favor, preencha todos os campos.");
      } else {
        Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos do formulário.");
      }
      return;
    }

    // 2. Verificação de senha
    if (senha !== confirmarSenha) {
      if (Platform.OS === 'web') {
        alert("Erro na Senha: As senhas não coincidem.");
      } else {
        Alert.alert("Erro na Senha", "A senha e a confirmação de senha não coincidem.");
      }
      return;
    }

    // 3. Sucesso
    if (Platform.OS === 'web') {
      alert("Cadastro feito com sucesso! Agora você já pode realizar o seu login.");
      router.replace('/');
    } else {
      Alert.alert(
        "Cadastro feito com sucesso!",
        "Agora você já pode realizar o seu login.",
        [{ text: "OK", onPress: () => router.replace('/') }]
      );
    }
  };

  // Componente de Input com o "V" verde do Layout 5.3
  const ValidatedInput = (label: string, value: string, setter: (v: string) => void, placeholder: string, props = {}) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.sectionLabelVerde}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder={placeholder} 
          placeholderTextColor="#bdbdbd" 
          value={value} 
          onChangeText={setter}
          {...props}
        />
        {value.length > 0 && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/cadastro')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro Pessoal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            As informações preenchidas serão divulgadas apenas para a pessoa com a qual você realizar o processo de adoção e/ou apadrinhamento, após a formalização do processo.
          </Text>
        </View>

        <Text style={styles.groupTitle}>INFORMAÇÕES PESSOAIS</Text>
        {ValidatedInput("NOME COMPLETO", nome, setNome, "Nome completo")}
        {ValidatedInput("IDADE", idade, setIdade, "Idade", { keyboardType: "numeric" })}
        {ValidatedInput("E-MAIL", email, setEmail, "E-mail", { keyboardType: "email-address" })}
        {ValidatedInput("ESTADO", estado, setEstado, "Estado")}
        {ValidatedInput("CIDADE", cidade, setCidade, "Cidade")}
        {ValidatedInput("ENDEREÇO", endereco, setEndereco, "Endereço")}
        {ValidatedInput("TELEFONE", telefone, setTelefone, "Telefone", { keyboardType: "phone-pad" })}

        <Text style={styles.groupTitle}>INFORMAÇÕES DE PERFIL</Text>
        {ValidatedInput("NOME DE USUÁRIO", usuario, setUsuario, "Nome de usuário")}
        {ValidatedInput("SENHA", senha, setSenha, "Senha", { secureTextEntry: true })}
        {ValidatedInput("CONFIRMAÇÃO DE SENHA", confirmarSenha, setConfirmarSenha, "Confirmação de senha", { secureTextEntry: true })}

        <Text style={styles.groupTitle}>FOTO DE PERFIL</Text>
        <TouchableOpacity style={styles.photoBox}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.photoText}>adicionar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonFinal} onPress={handleCadastro}>
          <Text style={styles.buttonText}>FAZER CADASTRO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#CFE9E5', height: 90, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 15 },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  form: { padding: 20 },
  infoBanner: { backgroundColor: '#CFE9E5', padding: 15, borderRadius: 4, marginBottom: 20 },
  infoText: { fontSize: 14, color: '#434343', textAlign: 'center', lineHeight: 20 },
  groupTitle: { fontSize: 14, color: '#88C9BF', marginTop: 25, marginBottom: 10, fontWeight: '500' },
  inputWrapper: { marginBottom: 15 },
  sectionLabelVerde: { fontSize: 12, color: '#88C9BF', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#bdbdbd' },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, color: '#434343' },
  checkIcon: { color: '#88C9BF', fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  photoBox: { backgroundColor: '#F1F2F2', height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  plus: { fontSize: 24, color: '#757575' },
  photoText: { fontSize: 14, color: '#757575' },
  buttonFinal: { backgroundColor: '#88C9BF', height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  buttonText: { color: '#434343', fontWeight: 'bold' }
});