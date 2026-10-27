import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCartelera } from '../context/CarteleraContext';
import { Poster } from '../components/Poster';
import { Chip } from '../components/Chip';
import { Estrellas } from '../components/Estrellas';
import { AvisoSinConexion, Cargando, MensajeError, Vacio } from '../components/Estado';
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  type ElementoLista,
  type EstadoVisto,
  type FiltroEstado,
  type FiltroTipo,
} from '../types/lista';
import type { AppStackParamList } from '../types/navegacion';
import { colores, espacio } from '../utils/tema';

const COLOR_ESTADO: Record<EstadoVisto, string> = {
  por_ver: colores.textoSuave,
  viendo: colores.aviso,
  vista: colores.exito,
};

const ICONO_ESTADO: Record<EstadoVisto, keyof typeof Ionicons.glyphMap> = {
  por_ver: 'time-outline',
  viendo: 'play-circle-outline',
  vista: 'checkmark-done-circle-outline',
};

export function MiListaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { lista, estadoLista, copiaSinConexion, recargar } = useCartelera();
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [refrescando, setRefrescando] = useState(false);

  const filtrada = useMemo(
    () =>
      lista.filter(
        (e) => (filtroEstado === 'todos' || e.estado === filtroEstado) && (filtroTipo === 'todos' || e.tipo === filtroTipo),
      ),
    [lista, filtroEstado, filtroTipo],
  );

  const contar = (estado: EstadoVisto) =>
    lista.filter((e) => e.estado === estado && (filtroTipo === 'todos' || e.tipo === filtroTipo)).length;

  const refrescar = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  };

  const renderTarjeta = ({ item }: { item: ElementoLista }) => (
    <Pressable
      onPress={() => navigation.navigate('Editar', { itemId: item.id })}
      style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}, ${ETIQUETA_ESTADO[item.estado]}. Toca para editar`}
    >
      <Poster path={item.posterPath} ancho={70} />
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.meta}>
          {ETIQUETA_TIPO[item.tipo]} · {item.anio || 'Sin año'}
        </Text>
        <View style={styles.estado}>
          <Ionicons name={ICONO_ESTADO[item.estado]} size={16} color={COLOR_ESTADO[item.estado]} />
          <Text style={[styles.textoEstado, { color: COLOR_ESTADO[item.estado] }]}>{ETIQUETA_ESTADO[item.estado]}</Text>
        </View>
        {item.estado === 'vista' &&
          (item.calificacionPersonal !== null ? (
            <Estrellas valor={item.calificacionPersonal} tamano={16} />
          ) : (
            <Text style={styles.sinCalificar}>Sin calificar</Text>
          ))}
        {item.comentario ? (
          <Text style={styles.comentario} numberOfLines={2}>“{item.comentario}”</Text>
        ) : null}
      </View>
      <Ionicons name="create-outline" size={20} color={colores.textoSuave} />
    </Pressable>
  );

  const renderContenido = () => {
    switch (estadoLista.estado) {
      case 'cargando':
        return <Cargando texto="Cargando tu lista…" />;
      case 'error':
        return <MensajeError mensaje={estadoLista.mensaje} onReintentar={() => void recargar()} />;
      case 'exito':
        return (
          <FlatList
            data={filtrada}
            keyExtractor={(e) => e.id}
            renderItem={renderTarjeta}
            contentContainerStyle={[styles.lista, filtrada.length === 0 && { flex: 1 }]}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colores.primario} />}
            ListEmptyComponent={
              lista.length === 0 ? (
                <Vacio icono="albums-outline" titulo="Tu lista está vacía" texto="Busca una película o serie y agrégala." />
              ) : (
                <Vacio icono="filter-outline" titulo="Nada con estos filtros" texto="Prueba con otro estado o tipo." />
              )
            }
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      {copiaSinConexion !== null && <AvisoSinConexion fecha={copiaSinConexion} />}
      <Text style={styles.encabezado}>Mi lista</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros} style={styles.filaFiltros}>
        <Chip texto={`Todos (${lista.filter((e) => filtroTipo === 'todos' || e.tipo === filtroTipo).length})`} activo={filtroEstado === 'todos'} onPress={() => setFiltroEstado('todos')} />
        {ESTADOS.map((estado) => (
          <Chip
            key={estado}
            texto={`${ETIQUETA_ESTADO[estado]} (${contar(estado)})`}
            activo={filtroEstado === estado}
            onPress={() => setFiltroEstado(estado)}
          />
        ))}
      </ScrollView>
      <View style={[styles.filtros, { paddingHorizontal: espacio.l }]}>
        <Chip texto="Todo" activo={filtroTipo === 'todos'} onPress={() => setFiltroTipo('todos')} />
        <Chip texto="Películas" activo={filtroTipo === 'movie'} onPress={() => setFiltroTipo('movie')} />
        <Chip texto="Series" activo={filtroTipo === 'tv'} onPress={() => setFiltroTipo('tv')} />
      </View>

      {renderContenido()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  encabezado: { color: colores.texto, fontSize: 28, fontWeight: '800', paddingHorizontal: espacio.l, paddingTop: espacio.s },
  filaFiltros: { flexGrow: 0 },
  filtros: { flexDirection: 'row', gap: espacio.s, paddingHorizontal: espacio.l, paddingVertical: espacio.s },
  lista: { padding: espacio.l, gap: espacio.m },
  tarjeta: {
    flexDirection: 'row',
    gap: espacio.m,
    padding: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: 12,
    alignItems: 'center',
  },
  info: { flex: 1, gap: 3 },
  titulo: { color: colores.texto, fontSize: 16, fontWeight: '700' },
  meta: { color: colores.textoSuave, fontSize: 13 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoEstado: { fontSize: 13, fontWeight: '700' },
  sinCalificar: { color: colores.textoSuave, fontSize: 12, fontStyle: 'italic' },
  comentario: { color: colores.textoSuave, fontSize: 13, fontStyle: 'italic' },
});
