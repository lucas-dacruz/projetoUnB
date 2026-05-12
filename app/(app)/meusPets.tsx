import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/firebaseConfig'; 
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function MeusPets() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchMeusPets = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const q = query(collection(db, "animais"), where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const lista: any[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setPets(lista);
    } catch (error) {
      console.error("Erro ao buscar meus pets:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMeusPets();
  }, [fetchMeusPets]);

  const toggleDisponivel = async (petId: string, atual: boolean) => {
    try {
      const petRef = doc(db, "animais", petId);
      await updateDoc(petRef, { disponivel: !atual });
      await fetchMeusPets();
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, !item.disponivel && styles.cardOculto]}>

      <TouchableOpacity
        onPress={() => router.push({ pathname: '/detalhes_animal', params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.animalName}>{item.nome}</Text>
          <View style={[styles.badge, item.disponivel ? styles.badgeVisivel : styles.badgeOculto]}>
            <Text style={styles.badgeText}>{item.disponivel ? 'Visível' : 'Oculto'}</Text>
          </View>
        </View>

        {item.imagemBase64 ? (
          <Image 
            source={{ 
              uri: item.imagemBase64.startsWith('data:image') 
                ? item.imagemBase64 
                : `data:image/jpeg;base64,${item.imagemBase64}` 
            }} 
            style={styles.animalImage} 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Sem foto</Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.animalDetails}>
            {(item.sexo || '').toUpperCase()} | {(item.porte || '').toUpperCase()} | {(item.idade || '').toUpperCase()}
          </Text>
          <Text style={styles.animalLocation}>BRASÍLIA - DF</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggleBtn, item.disponivel ? styles.toggleBtnVisivel : styles.toggleBtnOculto]}
        onPress={() => toggleDisponivel(item.id, item.disponivel)}
      >
        <Text style={styles.toggleBtnText}>
          {item.disponivel ? '🙈 Ocultar da adoção' : '👁️ Mostrar na adoção'}
        </Text>
      </TouchableOpacity>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.containerCentro}>
        <ActivityIndicator size="large" color="#88c9bf" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 28 }} />
        <Text style={styles.titleHeader}>Meus Pets</Text>
        <TouchableOpacity onPress={() => router.replace('/(app)/home')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={pets} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.containerCentro}>
            <Text style={styles.msgVazio}>Você ainda não possui animais cadastrados.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { 
    backgroundColor: '#88c9bf', 
    height: 90, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 15,
    elevation: 3
  },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  backIcon: { fontSize: 28, color: '#434343' },
  containerCentro: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  listContent: { padding: 8 },
  card: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 4, elevation: 2, overflow: 'hidden' },
  cardOculto: { opacity: 0.5 },
  cardHeader: { backgroundColor: '#cfe9e5', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  animalName: { fontSize: 16, color: '#434343', fontWeight: 'bold' },
  animalImage: { width: '100%', height: 180 },
  imagePlaceholder: { width: '100%', height: 180, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#757575' },
  cardInfo: { padding: 8, alignItems: 'center' },
  animalDetails: { fontSize: 12, color: '#434343' },
  animalLocation: { fontSize: 12, color: '#434343', marginTop: 2 },
  msgVazio: { fontSize: 16, color: '#bdbdbd', textAlign: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeVisivel: { backgroundColor: '#c8f0c8' },
  badgeOculto: { backgroundColor: '#f0c8c8' },
  badgeText: { fontSize: 11, fontWeight: '500', color: '#434343' },
  toggleBtn: { margin: 8, padding: 10, borderRadius: 4, alignItems: 'center' },
  toggleBtnVisivel: { backgroundColor: '#f0c8c8' },
  toggleBtnOculto: { backgroundColor: '#c8f0c8' },
  toggleBtnText: { fontSize: 13, color: '#434343', fontWeight: '500' },
});
