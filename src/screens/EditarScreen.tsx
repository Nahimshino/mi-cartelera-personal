import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCartelera } from '../context/CarteleraContext';
import { Poster } from '../components/Poster';
import { Chip } from '../components/Chip';
import { Estrellas } from '../components/Estrellas';
import { Boton } from '../components/Boton';
import { Vacio } from '../components/Estado';
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_TIPO, MAX_COMENTARIO, type EstadoVisto } from '../types/lista';
import type { AppStackParamList } from '../types/navegacion';
import { colores, espacio } from '../utils/tema';

type Props = NativeStackScreenProps<AppStackParamList, 'Editar'>;

const AVISO_PENDIENTE = 'Sin conexión: el cambio se guardó en el teléfono y se enviará a la nube al reconectar.';

export function EditarScreen({ route, navigation }: Props) {
  const { itemId } = route.params;
  const { buscarEnLista, actualizar, eliminar } = useCartelera();
  const elemento = buscarEnLista(itemId);

  const [estado, setEstado] = useState<EstadoVisto>(elemento?.estado ?? 'por_ver');
  const [calificacion, setCalificacion] = useState<number | null>(elemento?.calificacionPersonal ?? null);
  const [comentario, setComentario] = useState(elemento?.comentario ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!elemento) {
    return (
      <View style={styles.pantalla}>
        <Vacio icono="help-circle-outline" titulo="Esta obra ya no está en tu lista" />
      </View>
    );
  }

  const puedeCalificar = estado === 'vista';
  const huboCambios =
    estado !== elemento.estado ||
    (puedeCalificar ? calificacion : null) !== elemento.calificacionPersonal ||
    comentario !== elemento.comentario;

  const cambiarEstado = (nuevo: EstadoVisto) => {
    setEstado(nuevo);
    // Regla de negocio: solo se califica lo que ya se vio.
    if (nuevo !== 'vista') setCalificacion(null);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const { pendiente } = await actualizar(itemId, {
        estado,
        calificacionPersonal: puedeCalificar ? calificacion : null,
        comentario: comentario.trim(),
      });
      if (pendiente) Alert.alert('Guardado sin conexión', AVISO_PENDIENTE);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      setGuardando(false);
    }
  };

  const confirmarQuitar = () => {
    Alert.alert('Quitar de mi lista', `¿Seguro que quieres quitar “${elemento.titulo}” de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            const { pendiente } = await eliminar(itemId);
            if (pendiente) Alert.alert('Quitado sin conexión', AVISO_PENDIENTE);
            navigation.goBack();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo quitar.');
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecera}>
          <Poster path={elemento.posterPath} ancho={70} />
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{elemento.titulo}</Text>
            <Text style={styles.meta}>
              {ETIQUETA_TIPO[elemento.tipo]} · {elemento.anio || 'Sin año'}
            </Text>
          </View>
        </View>

        <Text style={styles.seccion}>Estado</Text>
        <View style={styles.fila}>
          {ESTADOS.map((e) => (
            <Chip key={e} texto={ETIQUETA_ESTADO[e]} activo={estado === e} onPress={() => cambiarEstado(e)} />
          ))}
        </View>

        <Text style={styles.seccion}>Mi calificación</Text>
        <Estrellas valor={calificacion} onCambiar={setCalificacion} tamano={30} deshabilitado={!puedeCalificar} />
        <Text style={styles.ayuda}>
          {puedeCalificar ? 'Toca de 1 a 5 estrellas.' : 'Marca la obra como “Vista” para poder calificarla.'}
        </Text>

        <Text style={styles.seccion}>Comentario</Text>
        <TextInput
          value={comentario}
          onChangeText={setComentario}
          maxLength={MAX_COMENTARIO}
          multiline
          placeholder="¿Qué te pareció?"
          placeholderTextColor={colores.textoSuave}
          style={styles.comentario}
          accessibilityLabel="Comentario"
        />
        <Text style={[styles.ayuda, { textAlign: 'right' }]}>
          {comentario.length}/{MAX_COMENTARIO}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Boton titulo="Guardar cambios" onPress={guardar} cargando={guardando} deshabilitado={!huboCambios} />
        <Boton titulo="Quitar de mi lista" variante="peligro" onPress={confirmarQuitar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.l, gap: espacio.m, paddingBottom: espacio.xl * 2 },
  cabecera: { flexDirection: 'row', gap: espacio.m, alignItems: 'center' },
  titulo: { color: colores.texto, fontSize: 20, fontWeight: '800' },
  meta: { color: colores.textoSuave, fontSize: 14 },
  seccion: { color: colores.texto, fontSize: 16, fontWeight: '700', marginTop: espacio.s },
  fila: { flexDirection: 'row', gap: espacio.s, flexWrap: 'wrap' },
  ayuda: { color: colores.textoSuave, fontSize: 13 },
  comentario: {
    minHeight: 110,
    backgroundColor: colores.superficie,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    color: colores.texto,
    padding: espacio.m,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  error: { color: colores.peligro },
});
