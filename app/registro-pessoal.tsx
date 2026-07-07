import FormInput from '@/components/form-input';
import ImageSelector from '@/components/image-selector';
import { ROUTES } from '@/constants/routes';
import { auth, db } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CadastroPessoalForm() {
  const router = useRouter();

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
  const [imagemPerfil, setImagemPerfil] = useState<string | null>(null);

  const handleCadastro = () => {
    if (!nome || !idade || !email || !estado || !cidade || !endereco || !telefone || !usuario || !senha || !confirmarSenha) {
      if (Platform.OS === 'web') {
        alert("Campos Obrigatórios: Por favor, preencha todos os campos.");
      } else {
        Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos do formulário.");
      }
    }

    if (senha !== confirmarSenha) {
      if (Platform.OS === 'web') {
        alert("Erro na Senha: As senhas não coincidem.");
      } else {
        Alert.alert("Erro na Senha", "A senha e a confirmação de senha não coincidem.");
      }
    }

    salvarUsuario();
  };

  const salvarUsuario = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        nome,
        idade,
        email,
        estado,
        cidade,
        endereco,
        telefone,
        usuario,
        imagemBase64: imagemPerfil,
        expoPushToken: null,
        criadoEm: new Date()
      });

      router.push(ROUTES.login);
    } catch (error) {
      console.log(error);
      alert('Erro ao criar usuário!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace(ROUTES.cadastro)}>
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
        <FormInput label="NOME COMPLETO" value={nome} onChangeText={setNome} placeholder="Nome completo" />
        <FormInput label="IDADE" value={idade} onChangeText={setIdade} placeholder="Idade" keyboardType="numeric" />
        <FormInput label="E-MAIL" value={email} onChangeText={setEmail} placeholder="E-mail" keyboardType="email-address" />
        <FormInput label="ESTADO" value={estado} onChangeText={setEstado} placeholder="Estado" />
        <FormInput label="CIDADE" value={cidade} onChangeText={setCidade} placeholder="Cidade" />
        <FormInput label="ENDEREÇO" value={endereco} onChangeText={setEndereco} placeholder="Endereço" />
        <FormInput label="TELEFONE" value={telefone} onChangeText={setTelefone} placeholder="Telefone" keyboardType="phone-pad" />

        <Text style={styles.groupTitle}>INFORMAÇÕES DE PERFIL</Text>
        <FormInput label="NOME DE USUÁRIO" value={usuario} onChangeText={setUsuario} placeholder="Nome de usuário" />
        <FormInput label="SENHA" value={senha} onChangeText={setSenha} placeholder="Senha" secureTextEntry />
        <FormInput label="CONFIRMAÇÃO DE SENHA" value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Confirmação de senha" secureTextEntry />

        <Text style={styles.groupTitle}>FOTO DE PERFIL</Text>
        < ImageSelector imagem={imagemPerfil} setImagem={setImagemPerfil} />

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
  photoBox: { backgroundColor: '#F1F2F2', height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  plus: { fontSize: 24, color: '#757575' },
  photoText: { fontSize: 14, color: '#757575' },
  buttonFinal: { backgroundColor: '#88C9BF', height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  buttonText: { color: '#434343', fontWeight: 'bold' }
});
