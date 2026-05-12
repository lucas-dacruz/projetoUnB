import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, query, where } from 'firebase/firestore';

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
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/detalhes_animal', params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.animalName}>{item.nome}</Text>
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
          <Text>Sem foto</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.animalDetails}>
          {(item.sexo || '').toUpperCase()} | {(item.porte || '').toUpperCase()} | {(item.idade || '').toUpperCase()}
        </Text>
        <Text style={styles.animalLocation}>BRASÍLIA - DF</Text>
      </View>
    </TouchableOpacity>
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
  card: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 4, elevation: 2, overflow: 'hidden' },
  cardHeader: { backgroundColor: '#cfe9e5', padding: 8 },
  animalName: { fontSize: 16, color: '#434343', fontWeight: 'bold' },
  animalImage: { width: '100%', height: 180 },
  imagePlaceholder: { width: '100%', height: 180, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cardFooter: { padding: 8, alignItems: 'center' },
  animalDetails: { fontSize: 12, color: '#434343' },
  animalLocation: { fontSize: 12, color: '#434343', marginTop: 2 }
});
