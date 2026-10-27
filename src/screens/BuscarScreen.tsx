import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { buscar } from '../services/tmdbService';
import { useCartelera } from '../context/CarteleraContext';
import { Poster } from '../components/Poster';
import { Cargando, MensajeError, Vacio } from '../components/Estado';
import type { EstadoPeticion } from '../types/peticion';
import type { PaginaBusqueda, ResultadoBusqueda } from '../types/tmdb';
import type { AppStackParamList } from '../types/navegacion';
import { ETIQUETA_ESTADO, ETIQUETA_TIPO } from '../types/lista';
import { crearItemId } from '../utils/validaciones';
import { ALTURA_TOCABLE, colores, espacio } from '../utils/tema';

const ESPERA_ESCRITURA_MS = 500;

export function BuscarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { buscarEnLista } = useCartelera();
  const [texto, setTexto] = useState('');
  const [consulta, setConsulta] = useState('');
  const [peticion, setPeticion] = useState<EstadoPeticion<PaginaBusqueda> | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const ultimaPeticion = useRef(0);

  // Espera a que el usuario deje de escribir para no gastar el límite de peticiones de TMDB.
  useEffect(() => {
    const t = setTimeout(() => setConsulta(texto.trim()), ESPERA_ESCRITURA_MS);
    return () => clearTimeout(t);
  }, [texto]);

  const ejecutarBusqueda = async (termino: string) => {
    const id = ++ultimaPeticion.current;
    if (!termino) {
      setPeticion(null);
      return;
    }
    setPeticion({ estado: 'cargando' });
    try {
      const datos = await buscar(termino, 1);
      if (id === ultimaPeticion.current) setPeticion({ estado: 'exito', datos });
    } catch (error) {
      if (id === ultimaPeticion.current) {
        setPeticion({ estado: 'error', mensaje: error instanceof Error ? error.message : 'Error al buscar.' });
      }
    }
  };

  useEffect(() => {
    void ejecutarBusqueda(consulta);
  }, [consulta]);

  const cargarMas = async () => {
    if (peticion?.estado !== 'exito' || cargandoMas) return;
    const { pagina, totalPaginas, resultados } = peticion.datos;
    if (pagina >= totalPaginas) return;
    const id = ultimaPeticion.current;
    setCargandoMas(true);
    try {
      const siguiente = await buscar(consulta, pagina + 1);
      if (id !== ultimaPeticion.current) return;
      const vistos = new Set(resultados.map((r) => `${r.tipo}_${r.id}`));
      setPeticion({
        estado: 'exito',
        datos: {
          ...siguiente,
          resultados: [...resultados, ...siguiente.resultados.filter((r) => !vistos.has(`${r.tipo}_${r.id}`))],
        },
      });
    } catch {
      // Si falla una página extra se conservan los resultados ya cargados.
    } finally {
      setCargandoMas(false);
    }
  };

  const abrir = (r: ResultadoBusqueda) => navigation.navigate('Detalle', { tipo: r.tipo, id: r.id, titulo: r.titulo });

  const renderContenido = () => {
    if (!peticion) {
      return <Vacio icono="search" titulo="Busca una película o serie" texto="Escribe un título para comenzar." />;
    }
    switch (peticion.estado) {
      case 'cargando':
        return <Cargando texto="Buscando en TMDB…" />;
      case 'error':
        return <MensajeError mensaje={peticion.mensaje} onReintentar={() => void ejecutarBusqueda(consulta)} />;
      case 'exito':
        if (peticion.datos.resultados.length === 0) {
          return (
            <Vacio icono="sad-outline" titulo="Sin resultados" texto={`No encontramos nada para “${consulta}”.`} />
          );
        }
        return (
          <FlatList
            data={peticion.datos.resultados}
            keyExtractor={(r) => `${r.tipo}_${r.id}`}
            contentContainerStyle={styles.lista}
            onEndReached={() => void cargarMas()}
            onEndReachedThreshold={0.5}
            keyboardDismissMode="on-drag"
            ListFooterComponent={cargandoMas ? <ActivityIndicator color={colores.primario} style={{ margin: 16 }} /> : undefined}
            renderItem={({ item }) => {
              const enLista = buscarEnLista(crearItemId(item.tipo, item.id));
              return (
                <Pressable
                  onPress={() => abrir(item)}
                  style={({ pressed }) => [styles.fila, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.titulo}, ${ETIQUETA_TIPO[item.tipo]}, ${item.anio || 'sin año'}`}
                >
                  <Poster path={item.posterPath} ancho={60} />
                  <View style={styles.info}>
                    <Text style={styles.titulo} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.meta}>
                      {ETIQUETA_TIPO[item.tipo]} · {item.anio || 'Sin año'}
                    </Text>
                    {enLista && (
                      <Text style={styles.enLista}>
                        <Ionicons name="checkmark-circle" size={14} /> En tu lista · {ETIQUETA_ESTADO[enLista.estado]}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
                </Pressable>
              );
            }}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <Text style={styles.encabezado}>Buscar</Text>
      <View style={styles.buscador}>
        <Ionicons name="search" size={20} color={colores.textoSuave} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={() => setConsulta(texto.trim())}
          placeholder="Título de película o serie"
          placeholderTextColor={colores.textoSuave}
          returnKeyType="search"
          style={styles.input}
          accessibilityLabel="Buscar por título"
        />
        {texto.length > 0 && (
          <Pressable onPress={() => setTexto('')} style={styles.limpiar} accessibilityLabel="Borrar búsqueda">
            <Ionicons name="close-circle" size={20} color={colores.textoSuave} />
          </Pressable>
        )}
      </View>
      {renderContenido()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  encabezado: { color: colores.texto, fontSize: 28, fontWeight: '800', paddingHorizontal: espacio.l, paddingTop: espacio.s },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: espacio.l,
    paddingLeft: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espacio.s,
  },
  input: { flex: 1, minHeight: ALTURA_TOCABLE + 4, color: colores.texto, fontSize: 16 },
  limpiar: { minWidth: ALTURA_TOCABLE, minHeight: ALTURA_TOCABLE, alignItems: 'center', justifyContent: 'center' },
  lista: { paddingHorizontal: espacio.l, paddingBottom: espacio.xl, gap: espacio.s },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    padding: espacio.s,
    backgroundColor: colores.superficie,
    borderRadius: 12,
  },
  info: { flex: 1, gap: 2 },
  titulo: { color: colores.texto, fontSize: 16, fontWeight: '700' },
  meta: { color: colores.textoSuave, fontSize: 14 },
  enLista: { color: colores.exito, fontSize: 13, marginTop: 2 },
});
