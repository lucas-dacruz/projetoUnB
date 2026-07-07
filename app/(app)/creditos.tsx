import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Creditos() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Créditos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Projeto desenvolvido por:</Text>
          <Text style={styles.name}>Douglas Rocha</Text>
          <Text style={styles.name}>Lucas Cruz</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    backgroundColor: '#CFE9E5',
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6e7e8',
  },
  sectionTitle: {
    fontSize: 15,
    color: '#434343',
    fontWeight: '500',
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    color: '#589b9b',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
