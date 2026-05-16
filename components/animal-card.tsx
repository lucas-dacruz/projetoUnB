import { type ReactNode } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Animal = {
  nome?: string;
  sexo?: string;
  porte?: string;
  idade?: string;
  localizacao?: string;
  imagemBase64?: string | null;
};

type Props = {
  animal: Animal;
  onPress?: () => void;
  headerRight?: ReactNode;
  footer?: ReactNode;
};

export default function AnimalCard({ animal, onPress, headerRight, footer }: Props) {
  const imageUri = animal.imagemBase64
    ? animal.imagemBase64.startsWith('data:image')
      ? animal.imagemBase64
      : `data:image/jpeg;base64,${animal.imagemBase64}`
    : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.animalName}>{animal.nome}</Text>
          {headerRight}
        </View>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.animalImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Sem foto</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.animalDetails}>
            {(animal.sexo || '').toUpperCase()} | {(animal.porte || '').toUpperCase()} | {(animal.idade || '').toUpperCase()}
          </Text>
          <Text style={styles.animalLocation}>{animal.localizacao || 'BRASÍLIA - DF'}</Text>
        </View>
      </TouchableOpacity>

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginBottom: 12, borderRadius: 4, elevation: 2, overflow: 'hidden' },
  cardHeader: { backgroundColor: '#cfe9e5', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  animalName: { fontSize: 16, color: '#434343', fontWeight: 'bold' },
  animalImage: { width: '100%', height: 180 },
  imagePlaceholder: { width: '100%', height: 180, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cardFooter: { padding: 8, alignItems: 'center' },
  animalDetails: { fontSize: 12, color: '#434343' },
  animalLocation: { fontSize: 12, color: '#434343', marginTop: 2 }
});
