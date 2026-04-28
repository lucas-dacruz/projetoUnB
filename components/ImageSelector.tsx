import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  imagem: string | null;
  setImagem: (img: string | null) => void;
};

export default function ImageSelector({ imagem, setImagem }: Props) {
  
  const escolherOpcao = () => {
    if (Platform.OS === 'web') {
      escolherDaGaleria();
    } else {
      Alert.alert(
        'Selecionar imagem',
        'Escolha uma opção',
        [
          { text: 'Câmera', onPress: abrirCamera },
          { text: 'Galeria', onPress: escolherDaGaleria },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const abrirCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert('Permissão da câmera necessária!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImagem(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const escolherDaGaleria = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('Permissão da galeria necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImagem(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  return (
    <TouchableOpacity style={[
      styles.photoBox, 
      imagem && styles.photoBoxComImagem
    ]} onPress={escolherOpcao}>
      {imagem ? (
        <Image
          source={{ uri: imagem }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      ) : (
        <>
          <Text >+</Text>
          <Text >Adicionar foto</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    backgroundColor: '#F1F2F2',
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },

  photoBoxComImagem: {
    height: 400,
    width: 400,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: 10,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },
})