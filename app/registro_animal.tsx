import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { db } from '@/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';


export default function RegistroAnimal() {
  const router = useRouter();

  // CONTROLE DE ABA ATIVA (Navegação Superior)
  const [abaAtiva, setAbaAtiva] = useState<'ADOCAO' | 'APADRINHAR' | 'AJUDA' | null>(null);

  // ESTADOS DOS CAMPOS (Comuns a todos os layouts)
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  const [idade, setIdade] = useState('');
  const [doencas, setDoencas] = useState('');
  const [sobre, setSobre] = useState('');
  const [nomeMedicamento, setNomeMedicamento] = useState('');
  const [especificacaoObjetos, setEspecificacaoObjetos] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const escolherImagem = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('Permissão necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled) {
      const img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagem(img);
    }
  };

  // ESTADO PARA SELEÇÕES MÚLTIPLAS (Temperamento, Saúde, Exigências)
  const [selecoes, setSelecoes] = useState<string[]>([]);

  const toggle = (item: string) => {
    setSelecoes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  // Funções auxiliares de renderização de botões (estilo retângulos cinzas)
  const renderBtn = (label: string, value: string, current: string, setter: (v: string) => void) => (
    <TouchableOpacity 
      style={[styles.rectBtn, current === value && styles.rectBtnSelected]} 
      onPress={() => setter(value)}
    >
      <Text style={[styles.rectText, current === value && styles.rectTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderCheck = (label: string) => (
    <TouchableOpacity 
      style={[styles.rectBtn, selecoes.includes(label) && styles.rectBtnSelected]} 
      onPress={() => toggle(label)}
    >
      <Text style={[styles.rectText, selecoes.includes(label) && styles.rectTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const salvarAnimal = async () => {
    try {
      await addDoc(collection(db, 'animais'), {
        nome,
        especie,
        sexo,
        porte,
        idade,
        doencas,
        sobre,
        nomeMedicamento,
        especificacaoObjetos,
        selecoes,
        tipoCadastro: abaAtiva,
        imagemBase64: imagem,
        criadoEm: new Date()
      });

      router.push('./sucesso_animal');
    } catch (error) {
      console.log(error);
      alert('Erro ao salvar!');
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER FIXO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro do Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        
        {/* NAVEGAÇÃO SUPERIOR FIXA */}
        <Text style={styles.infoText}>Tenho interesse em cadastrar o animal para:</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity 
            style={[styles.tabBtn, abaAtiva === 'ADOCAO' && styles.tabBtnSelected]} 
            onPress={() => { setAbaAtiva('ADOCAO'); setSelecoes([]); }}
          >
            <Text style={[styles.tabText, abaAtiva === 'ADOCAO' && styles.tabTextSelected]}>ADOÇÃO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, abaAtiva === 'APADRINHAR' && styles.tabBtnSelected]} 
            onPress={() => { setAbaAtiva('APADRINHAR'); setSelecoes([]); }}
          >
            <Text style={[styles.tabText, abaAtiva === 'APADRINHAR' && styles.tabTextSelected]}>APADRINHAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, abaAtiva === 'AJUDA' && styles.tabBtnSelected]} 
            onPress={() => { setAbaAtiva('AJUDA'); setSelecoes([]); }}
          >
            <Text style={[styles.tabText, abaAtiva === 'AJUDA' && styles.tabTextSelected]}>AJUDA</Text>
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO DINÂMICO CONFORME ABA SELECIONADA */}
        {abaAtiva && (
          <View style={styles.dynamicContent}>
            <Text style={styles.activeLabel}>
              {abaAtiva === 'ADOCAO' ? 'Adoção' : abaAtiva === 'APADRINHAR' ? 'Apadrinhar' : 'Ajudar'}
            </Text>

            {/* CAMPOS COMUNS: NOME E FOTOS */}
            <Text style={styles.sectionLabelVerde}>NOME DO ANIMAL</Text>
            <TextInput style={styles.input} placeholder="Nome do animal" placeholderTextColor="#bdbdbd" value={nome} onChangeText={setNome} />

            <Text style={styles.sectionLabelVerde}>FOTOS DO ANIMAL</Text>
            <TouchableOpacity style={styles.photoBox} onPress={escolherImagem}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.photoText}>adicionar fotos</Text>
            </TouchableOpacity>

            {/* CAMPOS COMUNS: CARACTERÍSTICAS */}
            <Text style={styles.sectionLabelVerde}>ESPÉCIE</Text>
            <View style={styles.row}>{renderBtn("CACHORRO", "Cachorro", especie, setEspecie)}{renderBtn("GATO", "Gato", especie, setEspecie)}</View>

            <Text style={styles.sectionLabelVerde}>SEXO</Text>
            <View style={styles.row}>{renderBtn("MACHO", "Macho", sexo, setSexo)}{renderBtn("FÊMEA", "Fêmea", sexo, setSexo)}</View>

            <Text style={styles.sectionLabelVerde}>PORTE</Text>
            <View style={styles.row}>
              {renderBtn("PEQUENO", "Pequeno", porte, setPorte)}
              {renderBtn("MÉDIO", "Médio", porte, setPorte)}
              {renderBtn("GRANDE", "Grande", porte, setPorte)}
            </View>

            <Text style={styles.sectionLabelVerde}>IDADE</Text>
            <View style={styles.row}>
              {renderBtn("FILHOTE", "Filhote", idade, setIdade)}
              {renderBtn("ADULTO", "Adulto", idade, setIdade)}
              {renderBtn("IDOSO", "Idoso", idade, setIdade)}
            </View>

            <Text style={styles.sectionLabelVerde}>TEMPERAMENTO</Text>
            <View style={styles.row}>
              {renderCheck("CALMO")}{renderCheck("BRINCALHÃO")}{renderCheck("TÍMIDO")}
              {renderCheck("GUARDA")}{renderCheck("AMOROSO")}{renderCheck("PREGUIÇOSO")}
            </View>

            <Text style={styles.sectionLabelVerde}>SAÚDE</Text>
            <View style={styles.row}>
              {renderCheck("VACINADO")}{renderCheck("VERMIFUGADO")}
              {renderCheck("CASTRADO")}{renderCheck("DOENTE")}
            </View>
            <TextInput style={styles.input} placeholder="Doenças do animal" placeholderTextColor="#bdbdbd" value={doencas} onChangeText={setDoencas} />

            {/* SEÇÕES EXCLUSIVAS: ADOÇÃO (LAYOUT 1.1) */}
            {abaAtiva === 'ADOCAO' && (
              <View>
                <Text style={styles.sectionLabelVerde}>EXIGÊNCIAS PARA ADOÇÃO</Text>
                <View style={styles.column}>
                  {renderCheck("TERMO DE ADOÇÃO")}
                  {renderCheck("FOTOS DA CASA")}
                  {renderCheck("VISITA PRÉVIA AO ANIMAL")}
                  {renderCheck("ACOMPANHAMENTO PÓS ADOÇÃO")}
                </View>
                {selecoes.includes("ACOMPANHAMENTO PÓS ADOÇÃO") && (
                  <View style={styles.subOptions}>
                    {renderCheck("1 MÊS")}{renderCheck("3 MESES")}{renderCheck("6 MESES")}
                  </View>
                )}
              </View>
            )}

            {/* SEÇÕES EXCLUSIVAS: APADRINHAR (LAYOUT 2.2) */}
            {abaAtiva === 'APADRINHAR' && (
              <View>
                <Text style={styles.sectionLabelVerde}>EXIGÊNCIAS PARA APADRINHAMENTO</Text>
                <View style={styles.column}>
                  {renderCheck("TERMO DE APADRINHAMENTO")}
                  {renderCheck("AUXÍLIO FINANCEIRO")}
                  {selecoes.includes("AUXÍLIO FINANCEIRO") && (
                    <View style={styles.subOptions}>
                      {renderCheck("ALIMENTAÇÃO")}{renderCheck("SAÚDE")}{renderCheck("OBJETOS")}
                    </View>
                  )}
                  {renderCheck("VISITAS AO ANIMAL")}
                </View>
              </View>
            )}

            {/* SEÇÕES EXCLUSIVAS: AJUDA (LAYOUT 3.3) */}
            {abaAtiva === 'AJUDA' && (
              <View>
                <Text style={styles.sectionLabelVerde}>NECESSIDADES DO ANIMAL</Text>
                <View style={styles.column}>
                  {renderCheck("ALIMENTO")}
                  {renderCheck("AUXÍLIO FINANCEIRO")}
                  {renderCheck("MEDICAMENTO")}
                  {selecoes.includes("MEDICAMENTO") && (
                    <TextInput style={styles.input} placeholder="Nome do medicamento" placeholderTextColor="#bdbdbd" value={nomeMedicamento} onChangeText={setNomeMedicamento} />
                  )}
                  {renderCheck("OBJETOS")}
                  {selecoes.includes("OBJETOS") && (
                    <TextInput style={styles.input} placeholder="Especifique o(s) objeto(s)" placeholderTextColor="#bdbdbd" value={especificacaoObjetos} onChangeText={setEspecificacaoObjetos} />
                  )}
                </View>
              </View>
            )}

            <Text style={styles.sectionLabelVerde}>SOBRE O ANIMAL</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Compartilhe a história do animal" 
              placeholderTextColor="#bdbdbd"
              multiline value={sobre} onChangeText={setSobre} 
            />

            <TouchableOpacity 
              style={styles.buttonFinal} 
              onPress={salvarAnimal}
            >
              <Text style={styles.buttonText}>
                {abaAtiva === 'ADOCAO' ? "COLOCAR PARA ADOÇÃO" : abaAtiva === 'APADRINHAR' ? "PROCURAR PADRINHO" : "PROCURAR AJUDA"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  infoText: { fontSize: 14, color: '#757575', textAlign: 'center', marginBottom: 15 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tabBtn: { backgroundColor: '#EDEDED', flex: 1, marginHorizontal: 2, height: 40, justifyContent: 'center', alignItems: 'center' },
  tabBtnSelected: { backgroundColor: '#88C9BF' },
  tabText: { fontSize: 11, color: '#757575', fontWeight: '500' },
  tabTextSelected: { color: '#fff' },
  dynamicContent: { marginTop: 10 },
  activeLabel: { fontSize: 16, color: '#434343', fontWeight: '500', marginBottom: 10 },
  sectionLabelVerde: { fontSize: 12, color: '#88C9BF', marginTop: 15, marginBottom: 8, fontWeight: '500' },
  input: { borderBottomWidth: 1, borderBottomColor: '#bdbdbd', paddingVertical: 5, fontSize: 14, color: '#434343', marginBottom: 10 },
  photoBox: { backgroundColor: '#F1F2F2', height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  plus: { fontSize: 24, color: '#757575' },
  photoText: { fontSize: 14, color: '#757575' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  column: { flexDirection: 'column', gap: 8 },
  subOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 20, marginTop: 5 },
  rectBtn: { backgroundColor: '#EDEDED', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 2, minWidth: 90, alignItems: 'center' },
  rectBtnSelected: { backgroundColor: '#88C9BF' },
  rectText: { fontSize: 12, color: '#757575' },
  rectTextSelected: { color: '#fff', fontWeight: 'bold' },
  buttonFinal: { backgroundColor: '#88C9BF', height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 40 },
  buttonText: { color: '#434343', fontWeight: 'bold' }
});