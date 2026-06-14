import { auth, db } from '@/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

type UsuarioLocalizacao = {
  nome?: string;
  latitude?: number;
  longitude?: number;
  cidade?: string;
  uf?: string;
};

type AnimalDocumento = {
  nome?: string;
  sobre?: string;
  ownerId?: string;
};

type AnimalMapData = {
  id: string;
  nome: string;
  sobre?: string;
  ownerId?: string;
  donoNome?: string;
  latitude: number;
  longitude: number;
  cidade?: string;
  uf?: string;
  distanciaKm?: number;
};

const BRASILIA = {
  latitude: -15.793889,
  longitude: -47.882778,
};

const INITIAL_REGION: Region = {
  ...BRASILIA,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function getFallbackCoordinate(index: number) {
  const offset = index * 0.003;

  return {
    latitude: BRASILIA.latitude + offset,
    longitude: BRASILIA.longitude + offset,
  };
}

function calcularDistanciaKm(origem: UsuarioLocalizacao | null, destino: { latitude: number; longitude: number }) {
  if (typeof origem?.latitude !== 'number' || typeof origem.longitude !== 'number') {
    return undefined;
  }

  const raioTerraKm = 6371;
  const lat1 = origem.latitude * Math.PI / 180;
  const lat2 = destino.latitude * Math.PI / 180;
  const deltaLat = (destino.latitude - origem.latitude) * Math.PI / 180;
  const deltaLon = (destino.longitude - origem.longitude) * Math.PI / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return raioTerraKm * c;
}

function formatarDistancia(distanciaKm?: number) {
  if (typeof distanciaKm !== 'number') {
    return 'Distância indisponível';
  }

  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)} m de você`;
  }

  return `${distanciaKm.toFixed(1)} km de você`;
}

export default function MapaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView | null>(null);
  const [animais, setAnimais] = useState<AnimalMapData[]>([]);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioLocalizacao | null>(null);
  const [animalSelecionado, setAnimalSelecionado] = useState<AnimalMapData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDadosMapa = async () => {
      try {
        const user = auth.currentUser;
        let localizacaoUsuario: UsuarioLocalizacao | null = null;

        if (user) {
          const usuarioSnap = await getDoc(doc(db, 'usuarios', user.uid));

          if (usuarioSnap.exists()) {
            localizacaoUsuario = usuarioSnap.data() as UsuarioLocalizacao;
            setUsuarioAtual(localizacaoUsuario);
          }
        }

        const animaisSnapshot = await getDocs(collection(db, 'animais'));

        const lista = await Promise.all(
          animaisSnapshot.docs.map(async (documento, index) => {
            const animal = documento.data() as AnimalDocumento;
            const fallback = getFallbackCoordinate(index);
            let dono: UsuarioLocalizacao | null = null;

            if (animal.ownerId) {
              const donoSnap = await getDoc(doc(db, 'usuarios', animal.ownerId));

              if (donoSnap.exists()) {
                dono = donoSnap.data() as UsuarioLocalizacao;
              }
            }

            const latitude = typeof dono?.latitude === 'number' ? dono.latitude : fallback.latitude;
            const longitude = typeof dono?.longitude === 'number' ? dono.longitude : fallback.longitude;
            const distanciaKm = calcularDistanciaKm(localizacaoUsuario, { latitude, longitude });

            return {
              id: documento.id,
              nome: animal.nome || 'Pet sem nome',
              sobre: animal.sobre,
              ownerId: animal.ownerId,
              donoNome: dono?.nome,
              latitude,
              longitude,
              cidade: dono?.cidade || 'Brasília',
              uf: dono?.uf || 'DF',
              distanciaKm,
            };
          })
        );

        setAnimais(lista);

        const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
        const animalFocado = lista.find((animal) => animal.id === idParam);
        const centroInicial = animalFocado
          ? { latitude: animalFocado.latitude, longitude: animalFocado.longitude }
          : (
            typeof localizacaoUsuario?.latitude === 'number' && typeof localizacaoUsuario.longitude === 'number'
              ? { latitude: localizacaoUsuario.latitude, longitude: localizacaoUsuario.longitude }
              : null
          );

        if (animalFocado) {
          setAnimalSelecionado(animalFocado);
        }

        if (centroInicial) {
          mapRef.current?.animateToRegion({
            latitude: centroInicial.latitude,
            longitude: centroInicial.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      } catch (error) {
        console.log('Erro ao carregar dados do mapa:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do mapa.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosMapa();
  }, [params.id]);

  const usuarioTemCoordenadas =
    typeof usuarioAtual?.latitude === 'number' &&
    typeof usuarioAtual.longitude === 'number';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
      >
        {usuarioTemCoordenadas && (
          <Marker
            coordinate={{ latitude: usuarioAtual.latitude!, longitude: usuarioAtual.longitude! }}
            title="Você"
            description={`${usuarioAtual?.cidade || 'Brasília'} - ${usuarioAtual?.uf || 'DF'}`}
            pinColor="#2F80ED"
          />
        )}

        {animais.map((animal) => (
          <Marker
            key={animal.id}
            coordinate={{ latitude: animal.latitude, longitude: animal.longitude }}
            title={animal.nome}
            description={formatarDistancia(animal.distanciaKm)}
            onPress={() => setAnimalSelecionado(animal)}
          >
            <Callout onPress={() => router.push({ pathname: '/detalhes-animal', params: { id: animal.id } })}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{animal.nome}</Text>
                <Text style={styles.calloutText}>{animal.donoNome ? `Tutor: ${animal.donoNome}` : 'Tutor não informado'}</Text>
                <Text style={styles.calloutText}>{formatarDistancia(animal.distanciaKm)}</Text>
                <Text style={styles.calloutLink}>Abrir detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {carregando && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#88c9bf" />
        </View>
      )}

      {animalSelecionado && (
        <View style={styles.bottomPanel}>
          <Text style={styles.panelTitle}>{animalSelecionado.nome}</Text>
          <Text style={styles.panelText}>
            {animalSelecionado.cidade || 'Brasília'} - {animalSelecionado.uf || 'DF'}
          </Text>
          <Text style={styles.panelText}>{formatarDistancia(animalSelecionado.distanciaKm)}</Text>

          <TouchableOpacity
            style={styles.panelButton}
            onPress={() => router.push({ pathname: '/detalhes-animal', params: { id: animalSelecionado.id } })}
          >
            <Text style={styles.panelButtonText}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  map: { flex: 1 },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  backButtonText: { fontSize: 24, color: '#434343' },
  callout: { width: 180 },
  calloutTitle: { fontSize: 14, fontWeight: 'bold', color: '#434343', marginBottom: 4 },
  calloutText: { fontSize: 12, color: '#757575', marginBottom: 4 },
  calloutLink: { fontSize: 12, color: '#589b9b', fontWeight: 'bold' },
  bottomPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 6,
    elevation: 4,
  },
  panelTitle: { fontSize: 16, fontWeight: 'bold', color: '#434343' },
  panelText: { fontSize: 13, color: '#757575', marginTop: 4 },
  panelButton: {
    height: 40,
    backgroundColor: '#88c9bf',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  panelButtonText: { color: '#434343', fontSize: 12, fontWeight: 'bold' },
});