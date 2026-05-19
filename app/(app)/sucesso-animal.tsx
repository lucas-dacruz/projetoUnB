import PrimaryButton from '@/components/primary-button';
import ScreenHeader from '@/components/screen-header';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SucessoAnimal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Cadastro do Animal"
        leftText="←"
        onLeftPress={() => router.replace('/home')}
        style={styles.header}
        leftTextStyle={styles.backIcon}
        titleStyle={styles.titleHeader}
      />

      <View style={styles.content}>
        <Text style={styles.ebaText}>Eba!</Text>
        
        <Text style={styles.successText}>
          O cadastro do seu pet foi realizado com sucesso!
        </Text>

        <Text style={styles.infoText}>
          Certifique-se que permitiu o envio de notificações por push no campo privacidade do menu configurações do aplicativo. Assim, poderemos te avisar assim que alguém interessado entrar em contato!
        </Text>

        <PrimaryButton
          title="MEUS PETS"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => router.replace('/home')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#CFE9E5', paddingBottom: 15 },
  backIcon: { fontSize: 24, color: '#434343', marginRight: 20 },
  titleHeader: { fontSize: 20, color: '#434343', fontWeight: '500' },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  ebaText: { 
    fontSize: 53, 
    color: '#88C9BF', 
    fontFamily: 'Courgette_400Regular',
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
