import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

// Ícones simples em texto (substitua por @expo/vector-icons se preferir)
function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    pets: '🐾',
    info: 'ℹ',
    settings: '⚙',
    expand: '▾',
  };
  return <Text style={styles.icon}>{icons[name] ?? '•'}</Text>;
}

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

function SectionHeader({
  icon,
  label,
  color,
  expanded,
  onToggle,
}: {
  icon: string;
  label: string;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: color }]}
      onPress={onToggle}
    >
      <Icon name={icon} />
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={[styles.expandIcon, expanded && styles.expandedIcon]}>▾</Text>
    </TouchableOpacity>
  );
}

export default function CustomDrawer() {
  const router = useRouter();
  const [atalhos, setAtalhos] = useState(true);
  const [informacoes, setInformacoes] = useState(true);
  const [configuracoes, setConfiguracoes] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/64' }}
            style={styles.avatar}
          />
          <View style={styles.headerBottom}>
            <Text style={styles.userName}>Emille Catarine</Text>
            <Text style={styles.expandIcon}>▾</Text>
          </View>
        </View>

        {/* Itens do perfil */}
        <MenuItem label="Meu perfil" />
        <Divider />
        <MenuItem label="Meus pets" onPress={() => router.push('/(app)/meusPets')} />
        <Divider />
        <MenuItem label="Favoritos" />
        <Divider />
        <MenuItem label="Chat" />

        {/* Seção Atalhos */}
        <SectionHeader
          icon="pets"
          label="Atalhos"
          color="#fee29b"
          expanded={atalhos}
          onToggle={() => setAtalhos(!atalhos)}
        />
        {atalhos && (
          <>
            <MenuItem label="Cadastrar um pet" onPress={() => router.push('/(app)/home')} />
            <Divider />
            <MenuItem label="Adotar um pet" onPress={() => router.push('/adotar')}/>
            <Divider />
            <MenuItem label="Ajudar um pet" />
            <Divider />
            <MenuItem label="Apadrinhar um pet" />
          </>
        )}

        {/* Seção Informações */}
        <SectionHeader
          icon="info"
          label="Informações"
          color="#cfe9e5"
          expanded={informacoes}
          onToggle={() => setInformacoes(!informacoes)}
        />
        {informacoes && (
          <>
            <MenuItem label="Dicas" />
            <Divider />
            <MenuItem label="Eventos" />
            <Divider />
            <MenuItem label="Legislação" />
            <Divider />
            <MenuItem label="Termo de adoção" />
            <Divider />
            <MenuItem label="Histórias de adoção" />
          </>
        )}

        {/* Seção Configurações */}
        <SectionHeader
          icon="settings"
          label="Configurações"
          color="#e6e7e8"
          expanded={configuracoes}
          onToggle={() => setConfiguracoes(!configuracoes)}
        />
        {configuracoes && (
          <>
            <MenuItem label="Privacidade" />
          </>
        )}

      </ScrollView>

      {/* Botão Sair */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace('/')}
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

  // Cabeçalho
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

  // Itens do menu
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

  // Seções colapsáveis
  sectionHeader: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
  },

  icon: {
    fontSize: 20,
    color: '#757575',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },

  sectionLabel: {
    flex: 1,
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
    color: '#434343',
  },

  expandIcon: {
    fontSize: 20,
    color: '#757575',
  },

  expandedIcon: {
    transform: [{ rotate: '180deg' }],
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