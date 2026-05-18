import AnimalCard from '@/components/animal-card';
import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={!item.disponivel && styles.cardOculto}>
      <AnimalCard
        animal={item}
        onPress={() => router.push({ pathname: '/detalhes-animal', params: { id: item.id } })}
        headerRight={
          <View style={[styles.badge, item.disponivel ? styles.badgeVisivel : styles.badgeOculto]}>
            <Text style={styles.badgeText}>{item.disponivel ? 'Visível' : 'Oculto'}</Text>
          </View>
        }
        footer={
          <TouchableOpacity
            style={[styles.toggleBtn, item.disponivel ? styles.toggleBtnVisivel : styles.toggleBtnOculto]}
            onPress={() => toggleDisponivel(item.id, item.disponivel)}
          >
            <Text style={styles.toggleBtnText}>
              {item.disponivel ? '🙈 Ocultar da adoção' : '👁️ Mostrar na adoção'}
            </Text>
          </TouchableOpacity>
        }
      />
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
  cardOculto: { opacity: 0.5 },
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
