import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';

export default function DetalhesAnimal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [animal, setAnimal] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (params.id) {
        try {
          const docRef = doc(db, "animais", params.id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAnimal(docSnap.data());
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/adotar')}>
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
            style={styles.buttonVoltar} 
            onPress={() => {
              if (!animal) return;

              const user = auth.currentUser;

              if (!user) {
                Alert.alert('Login necessário', 'Você precisa estar logado para iniciar uma conversa.');
                return;
              }

              if (!animal.ownerId) {
                Alert.alert('Erro', 'Este pet não possui dono associado.');
                return;
              }

              if (user.uid === animal.ownerId) {
                Alert.alert('Ação não permitida', 'Você não pode adotar seu próprio pet.');
                return;
              }
              
              // Redireciona para o chat passando os dados do animal e do dono via query params
              router.push({
                pathname: '/(app)/chat',
                params: { 
                  animalId: params.id,       // ID do documento do animal (ex: FCUa9P8Dhqr7r4FJW6PR)
                  ownerId: animal.ownerId,    // ID do dono cadastrado no pet (ex: xxhgvBNLzlhoaLynRD7M3c2nWJp1)
                  animalNome: animal.nome
                }
              });
            }}
          >
            <Text style={styles.buttonText}>PRETENDO ADOTAR</Text>
          </TouchableOpacity>
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
  buttonVoltar: { backgroundColor: '#88c9bf', height: 40, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40, elevation: 2 },
  buttonText: { color: '#434343', fontSize: 12, fontWeight: 'bold' }
});
