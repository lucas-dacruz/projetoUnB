import AnimalCard from '@/components/animal-card';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function ListaAnimais() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [animais, setAnimais] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const buscarAnimais = async () => {
        setCarregando(true);
        try {
          const queryAvailable = query(
            collection(db, "animais"),
            where("disponivel", "==", true)
          );
          const querySnapshot = await getDocs(queryAvailable);
          const lista: any[] = [];
          querySnapshot.forEach((doc) => {
            lista.push({ id: doc.id, ...doc.data() });
          });
          setAnimais(lista);
        } catch (error) {
          console.error("Erro ao buscar animais:", error);
        } finally {
          setCarregando(false);
        }
      };

      buscarAnimais();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <AnimalCard
      animal={item}
      onPress={() => router.push({ pathname: '/detalhes_animal', params: { id: item.id } })}
    />
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>
        
        <Text style={styles.titleHeader}>Animais disponíveis</Text>
        
        <TouchableOpacity onPress={() => router.replace('/(app)/home')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#88c9bf" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={animais} 
          keyExtractor={(item) => item.id} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContent} 
        />
      )}
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
    paddingBottom: 15 
  },
  menuIcon: { fontSize: 32, color: '#434343', marginBottom: -2 },
  titleHeader: { fontSize: 18, color: '#434343', fontWeight: '500', paddingBottom: 5 },
  backIcon: { fontSize: 28, color: '#434343' },
  listContent: { padding: 8 },
});
