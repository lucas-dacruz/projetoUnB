import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SucessoAnimal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header mantendo o padrão visual */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Cadastro do Animal</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.ebaText}>Eba!</Text>
        
        <Text style={styles.successText}>
          O cadastro do seu pet foi realizado com sucesso!
        </Text>

        <Text style={styles.infoText}>
          Certifique-se que permitiu o envio de notificações por push no campo privacidade do menu configurações do aplicativo. Assim, poderemos te avisar assim que alguém interessado entrar em contato!
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.replace('/home')} // Ou para a tela de lista de pets se existir
        >
          <Text style={styles.buttonText}>MEUS PETS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    backgroundColor: '#CFE9E5', 
    height: 90, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20, 
    paddingBottom: 15 
  },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  ebaText: { 
    fontSize: 53, 
    color: '#88C9BF', 
    fontFamily: 'Courgette_400Regular', // Se tiver a fonte cursiva instalada
    marginBottom: 40 
  },
  successText: { 
    fontSize: 14, 
    color: '#757575', 
    textAlign: 'center', 
    marginBottom: 20,
    lineHeight: 20
  },
  infoText: { 
    fontSize: 14, 
    color: '#757575', 
    textAlign: 'center', 
    lineHeight: 20,
    marginBottom: 100
  },
  button: { 
    backgroundColor: '#88C9BF', 
    width: '80%', 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  buttonText: { color: '#434343', fontWeight: 'bold' }
});