import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { auth, db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UsuarioPerfil = {
  nome?: string;
  imagemBase64?: string | null;
};

function Divider() {
  return <View style={styles.divider} />;
}

function MenuItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CustomDrawer() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      const user = auth.currentUser;

      if (!user) {
        return;
      }

      try {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPerfil(docSnap.data() as UsuarioPerfil);
        }
      } catch (error) {
        console.log('Erro ao carregar perfil do usuário:', error);
      }
    };

    carregarPerfil();
  }, []);

  const nomeUsuario = perfil?.nome || auth.currentUser?.email || 'Usuário';
  const imagemPerfil = perfil?.imagemBase64;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          {imagemPerfil ? (
            <Image
              source={{ uri: imagemPerfil }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{nomeUsuario.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.headerBottom}>
            <Text style={styles.userName}>{nomeUsuario}</Text>
            <Text style={styles.expandIcon}>▾</Text>
          </View>
        </View>

        <MenuItem label="Meus pets" onPress={() => router.push(ROUTES.meusPets)} />
        <Divider />
        <MenuItem label="Adotar um pet" onPress={() => router.push(ROUTES.adotar)} />
        <Divider />
        <MenuItem label="Cadastrar um pet" onPress={() => router.push(ROUTES.registroAnimal)} />
        <Divider />
        <MenuItem label="Chat" onPress={() => router.push(ROUTES.chat)} />
        <Divider />
        <MenuItem label="Notificações" onPress={() => router.push(ROUTES.notificacoes)} />
        <Divider />
        <MenuItem label="Mapa completo" onPress={() => router.push({ pathname: ROUTES.mapa })} />
        <Divider />
        <MenuItem label="Créditos" onPress={() => router.push(ROUTES.creditos)} />

      </ScrollView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace(ROUTES.login)}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  scroll: {
    flex: 1,
  },

  header: {
    backgroundColor: '#88c9bf',
    height: 172,
    paddingTop: 40,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarFallback: {
    backgroundColor: '#cfe9e5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarInitial: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 24,
    color: '#434343',
  },

  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },

  userName: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
    color: '#434343',
  },

  menuItem: {
    height: 48,
    justifyContent: 'center',
    paddingLeft: 16,
    backgroundColor: '#f7f7f7',
  },

  menuItemText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#434343',
  },

  divider: {
    height: 1,
    backgroundColor: '#e6e7e8',
    marginLeft: 16,
    width: 256,
  },

  expandIcon: {
    fontSize: 20,
    color: '#757575',
  },

  // Botão Sair
  logoutButton: {
    height: 48,
    backgroundColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
    color: '#434343',
  },
});
