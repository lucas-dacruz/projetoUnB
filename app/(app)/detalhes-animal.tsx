import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { auth, db } from '@/services/firebase'; 
import { usuarioFoiRejeitadoParaPet } from '@/services/adoption';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

type UsuarioResumo = {
  nome?: string;
  usuario?: string;
};

export default function DetalhesAnimal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [animal, setAnimal] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [interesseBloqueado, setInteresseBloqueado] = useState(false);
  const [enviandoInteresse, setEnviandoInteresse] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      if (params.id) {
        try {
          const docRef = doc(db, "animais", params.id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dadosAnimal = docSnap.data();
            const user = auth.currentUser;

            setAnimal(dadosAnimal);

            if (user && user.uid !== dadosAnimal.ownerId) {
              const foiRejeitado = await usuarioFoiRejeitadoParaPet(params.id as string, user.uid);
              setInteresseBloqueado(foiRejeitado);
            } else {
              setInteresseBloqueado(false);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar detalhes:", error);
        } finally {
          setCarregando(false);
        }
      }
    };
    carregarDados();
  }, [params.id]);

  if (carregando) return <ActivityIndicator size="large" color="#88c9bf" style={{ flex: 1 }} />;
  if (!animal) return <View style={styles.container}><Text>Animal não encontrado.</Text></View>;

  const temSelecao = (termo: string) => {
    const lista = animal.selecoes || [];
    return lista.includes(termo) ? "Sim" : "Não";
  };

  const renderExigencias = () => {
    const exigenciasPossiveis = ["TERMO DE ADOÇÃO", "FOTOS DA CASA", "VISITA PRÉVIA AO ANIMAL", "ACOMPANHAMENTO PÓS ADOÇÃO"];
    const filtradas = (animal.selecoes || []).filter((item: string) => exigenciasPossiveis.includes(item));
    return filtradas.length > 0 ? filtradas.join(', ') : "Nenhuma exigência informada.";
  };

  const imageUri = Array.isArray(animal.imagemBase64) ? animal.imagemBase64[0] : animal.imagemBase64;
  const usuarioAtual = auth.currentUser;
  const ehDono = !!usuarioAtual && usuarioAtual.uid === animal.ownerId;
  const petIndisponivel = animal.disponivel === false;
  const exibirBotaoAdocao = !ehDono && !petIndisponivel && !interesseBloqueado;

  const carregarNomeUsuario = async (uid: string) => {
    const usuarioSnap = await getDoc(doc(db, 'usuarios', uid));

    if (!usuarioSnap.exists()) {
      return 'Usuario';
    }

    const usuario = usuarioSnap.data() as UsuarioResumo;
    return usuario.nome || usuario.usuario || 'Usuario';
  };

  const demonstrarInteresse = async () => {
    if (!animal || enviandoInteresse) return;

    const user = auth.currentUser;
    const petId = params.id as string;

    if (!user) {
      Alert.alert('Login necessario', 'Voce precisa estar logado para demonstrar interesse.');
      return;
    }

    if (!animal.ownerId) {
      Alert.alert('Erro', 'Este pet nao possui dono associado.');
      return;
    }

    if (user.uid === animal.ownerId) {
      Alert.alert('Acao nao permitida', 'Você não pode demonstrar interesse no seu próprio pet.');
      return;
    }

    if (animal.disponivel === false) {
      Alert.alert('Pet indisponivel', 'Este pet nao esta disponivel para adocao.');
      return;
    }

    try {
      setEnviandoInteresse(true);

      const petSnap = await getDoc(doc(db, 'animais', petId));

      if (!petSnap.exists()) {
        Alert.alert('Pet indisponivel', 'Este pet nao foi encontrado.');
        return;
      }

      const petAtual = petSnap.data();
      setAnimal(petAtual);

      if (!petAtual.ownerId) {
        Alert.alert('Erro', 'Este pet nao possui dono associado.');
        return;
      }

      if (user.uid === petAtual.ownerId) {
        Alert.alert('Acao nao permitida', 'Você não pode demonstrar interesse no seu próprio pet.');
        return;
      }

      if (petAtual.disponivel === false) {
        Alert.alert('Pet indisponivel', 'Este pet nao esta disponivel para adocao.');
        return;
      }

      const foiRejeitado = await usuarioFoiRejeitadoParaPet(petId, user.uid);

      if (foiRejeitado) {
        setInteresseBloqueado(true);
        Alert.alert('Solicitacao bloqueada', 'Sua solicitação de adoção para este pet foi rejeitada anteriormente.');
        return;
      }

      const notificacoesRef = collection(db, 'notificacoes');
      const chaveUnica = `${petId}_${petAtual.ownerId}_${user.uid}`;
      const notificacaoExistente = query(
        notificacoesRef,
        where('chaveUnica', '==', chaveUnica),
      );

      const existenteSnap = await getDocs(notificacaoExistente);

      if (!existenteSnap.empty) {
        Alert.alert('Interesse ja registrado', 'Ja existe um registro de interesse seu para este pet.');
        return;
      }

      const [donoNome, adotanteNome] = await Promise.all([
        carregarNomeUsuario(petAtual.ownerId),
        carregarNomeUsuario(user.uid),
      ]);

      await addDoc(notificacoesRef, {
        tipo: 'intencao_adocao',
        status: 'pendente',
        animalId: petId,
        petId,
        petNome: petAtual.nome || 'Pet',
        donoId: petAtual.ownerId,
        donoNome,
        interessadoId: user.uid,
        adotanteId: user.uid,
        adotanteNome,
        chatId: null,
        lidaDono: false,
        lidaAdotante: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        chaveUnica,
        pushPreparado: false,
      });

      Alert.alert('Interesse enviado', 'O dono do pet recebeu sua demonstracao de interesse.');
    } catch (error) {
      console.error('Erro ao criar notificacao de adocao:', error);
      Alert.alert('Erro', 'Nao foi possivel enviar seu interesse agora.');
    } finally {
      setEnviandoInteresse(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push(ROUTES.adotar)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titleHeader}>{animal.nome}</Text>
        </View>
        <TouchableOpacity style={styles.shareIcon}>
          <Text style={styles.iconText}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}><Text>Sem foto</Text></View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.animalTitle}>{animal.nome}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>SEXO</Text><Text style={styles.valueText}>{animal.sexo}</Text></View>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>PORTE</Text><Text style={styles.valueText}>{animal.porte}</Text></View>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>IDADE</Text><Text style={styles.valueText}>{animal.idade}</Text></View>
          </View>
          
          <View style={styles.divider} />
          <Text style={styles.labelVerde}>LOCALIZAÇÃO</Text>
          <Text style={styles.valueText}>{animal.localizacao || "Brasília - DF"}</Text>
          
          <View style={styles.divider} />
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>CASTRADO</Text><Text style={styles.valueText}>{temSelecao("CASTRADO")}</Text></View>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>VERMIFUGADO</Text><Text style={styles.valueText}>{temSelecao("VERMIFUGADO")}</Text></View>
          </View>
          
          <View style={styles.divider} />
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>VACINADO</Text><Text style={styles.valueText}>{temSelecao("VACINADO")}</Text></View>
            <View style={styles.infoItem}><Text style={styles.labelVerde}>DOENÇAS</Text><Text style={styles.valueText}>{animal.doencas || "Nenhuma"}</Text></View>
          </View>
          
          <View style={styles.divider} />
          <Text style={styles.labelVerde}>TEMPERAMENTO</Text>
          <Text style={styles.valueText}>
            {(animal.selecoes || []).filter((s: string) => ["CALMO", "BRINCALHÃO", "TÍMIDO", "GUARDA", "AMOROSO", "PREGUIÇOSO"].includes(s)).join(', ') || "Não informado"}
          </Text>
          
          <View style={styles.divider} />
          <Text style={styles.labelVerde}>EXIGÊNCIAS DO DOADOR</Text>
          <Text style={styles.valueText}>{renderExigencias()}</Text>
          
          <View style={styles.divider} />
          <Text style={styles.labelVerde}>MAIS SOBRE {animal.nome?.toUpperCase()}</Text>
          <Text style={styles.description}>{animal.sobre || "Sem descrição."}</Text>

          <TouchableOpacity
            style={styles.buttonMapa}
            onPress={() => router.push({ pathname: ROUTES.mapa, params: { id: params.id as string } })}
          >
            <Text style={styles.buttonText}>VER NO MAPA</Text>
          </TouchableOpacity>

          {exibirBotaoAdocao ? (
            <TouchableOpacity 
              style={styles.buttonVoltar} 
              onPress={demonstrarInteresse}
              disabled={enviandoInteresse}
            >
              <Text style={styles.buttonText}>{enviandoInteresse ? 'ENVIANDO...' : 'PRETENDO ADOTAR'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.adoptionBlockedText}>
              {interesseBloqueado
                ? 'Sua solicitação para este pet ja foi rejeitada.'
                : petIndisponivel
                  ? 'Este pet nao esta disponivel para adocao.'
                  : 'Este pet esta vinculado ao seu perfil.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { backgroundColor: '#CFE9E5', height: 90, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 15 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  shareIcon: { paddingBottom: 5 },
  iconText: { fontSize: 20 },
  imageContainer: { width: '100%', height: 184 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: 184, backgroundColor: '#e6e7e8', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  animalTitle: { fontSize: 16, color: '#434343', fontWeight: 'bold', marginBottom: 16 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  labelVerde: { fontSize: 12, color: '#589b9b', fontWeight: 'bold', marginBottom: 4 },
  valueText: { fontSize: 14, color: '#757575' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 },
  description: { fontSize: 14, color: '#757575', lineHeight: 20, marginBottom: 20 },
  buttonMapa: { backgroundColor: '#F2C94C', height: 40, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10, elevation: 2 },
  buttonVoltar: { backgroundColor: '#88c9bf', height: 40, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40, elevation: 2 },
  adoptionBlockedText: { color: '#757575', fontSize: 13, fontWeight: '500', marginTop: 20, marginBottom: 40, textAlign: 'center' },
  buttonText: { color: '#434343', fontSize: 12, fontWeight: 'bold' }
});
