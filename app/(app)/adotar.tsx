import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs } from 'firebase/firestore';

export default function ListaAnimais() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<{}>>();
  const [animais, setAnimais] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarAnimais = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "animais"));
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
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/detalhes_animal', params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.animalName}>{item.nome || "Sem nome"}</Text>
      </View>
      
      {item.imagemBase64 ? (
        <Image source={{ uri: item.imagemBase64 }} style={styles.animalImage} />
      ) : (
        <View style={styles.imagePlaceholder}><Text>Sem foto</Text></View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          {(item.sexo || "N/A").toUpperCase()} | {(item.porte || "N/A").toUpperCase()} | {(item.idade || "N/A").toUpperCase()}
        </Text>
        <Text style={styles.footerText}>{item.localizacao || "BRASÍLIA - DF"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}><Text style={styles.menuIcon}>≡</Text></TouchableOpacity>
        <Text style={styles.titleHeader}>Animais disponíveis</Text>
        <View style={{ width: 28 }} />
      </View>
      {carregando ? <ActivityIndicator size="large" color="#88c9bf" style={{ marginTop: 50 }} /> : (
        <FlatList data={animais} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.listContent} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { backgroundColor: '#88c9bf', height: 90, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15 },
  menuIcon: { fontSize: 28, color: '#434343' },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  listContent: { padding: 8 },
  card: { backgroundColor: '#fff', marginBottom: 8, borderRadius: 4, elevation: 2, overflow: 'hidden' },
  cardHeader: { backgroundColor: '#cfe9e5', padding: 8 },
  animalName: { fontSize: 16, color: '#434343', fontWeight: 'bold' },
  animalImage: { width: '100%', height: 183 },
  imagePlaceholder: { width: '100%', height: 183, backgroundColor: '#e6e7e8', justifyContent: 'center', alignItems: 'center' },
  cardFooter: { padding: 8, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#434343' }
});