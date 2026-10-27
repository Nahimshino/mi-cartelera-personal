import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartelera } from '../context/CarteleraContext';
import { Boton } from '../components/Boton';
import { validarFormulario, type DatosFormulario, type ErroresFormulario } from '../utils/validaciones';
import { ALTURA_TOCABLE, colores, espacio } from '../utils/tema';

type Modo = 'login' | 'registro';

export function LoginScreen() {
  const { entrar, registrarse } = useCartelera();
  const [modo, setModo] = useState<Modo>('login');
  const [datos, setDatos] = useState<DatosFormulario>({ correo: '', contrasena: '', confirmacion: '' });
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const esRegistro = modo === 'registro';

  const cambiar = (campo: keyof DatosFormulario) => (valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
    setErrorServidor(null);
  };

  const alternarModo = () => {
    setModo(esRegistro ? 'login' : 'registro');
    setErrores({});
    setErrorServidor(null);
  };

  const enviar = async () => {
    const nuevosErrores = validarFormulario(datos, esRegistro);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setEnviando(true);
    try {
      if (esRegistro) await registrarse(datos.correo, datos.contrasena);
      else await entrar(datos.correo, datos.contrasena);
      // Al cambiar la sesión, la navegación condicional muestra la app.
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'No se pudo continuar.');
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.marca}>
            <Ionicons name="film" size={56} color={colores.primario} />
            <Text style={styles.nombreApp}>Mi Cartelera</Text>
            <Text style={styles.lema}>Tus películas y series, en orden.</Text>
          </View>

          <Text style={styles.tituloForm}>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</Text>

          <Campo
            etiqueta="Correo"
            valor={datos.correo}
            onCambiar={cambiar('correo')}
            error={errores.correo}
            teclado="email-address"
            autoComplete="email"
          />
          <Campo
            etiqueta="Contraseña"
            valor={datos.contrasena}
            onCambiar={cambiar('contrasena')}
            error={errores.contrasena}
            secreto
            autoComplete={esRegistro ? 'new-password' : 'current-password'}
          />
          {esRegistro && (
            <Campo
              etiqueta="Confirmar contraseña"
              valor={datos.confirmacion}
              onCambiar={cambiar('confirmacion')}
              error={errores.confirmacion}
              secreto
              autoComplete="new-password"
            />
          )}

          {errorServidor && (
            <View style={styles.errorServidor} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={18} color={colores.peligro} />
              <Text style={styles.textoErrorServidor}>{errorServidor}</Text>
            </View>
          )}

          <Boton titulo={esRegistro ? 'Registrarme' : 'Entrar'} onPress={enviar} cargando={enviando} />

          <Pressable onPress={alternarModo} style={styles.alternar} accessibilityRole="button">
            <Text style={styles.textoAlternar}>
              {esRegistro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
              <Text style={styles.enlace}>{esRegistro ? 'Inicia sesión' : 'Regístrate'}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface CampoProps {
  etiqueta: string;
  valor: string;
  onCambiar: (v: string) => void;
  error?: string;
  secreto?: boolean;
  teclado?: 'default' | 'email-address';
  autoComplete: 'email' | 'new-password' | 'current-password';
}

function Campo({ etiqueta, valor, onCambiar, error, secreto, teclado = 'default', autoComplete }: CampoProps) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={onCambiar}
        secureTextEntry={secreto}
        keyboardType={teclado}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        placeholderTextColor={colores.textoSuave}
        style={[styles.input, error && styles.inputError]}
        accessibilityLabel={etiqueta}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espacio.xl, gap: espacio.m, flexGrow: 1, justifyContent: 'center' },
  marca: { alignItems: 'center', marginBottom: espacio.xl, gap: espacio.xs },
  nombreApp: { color: colores.texto, fontSize: 32, fontWeight: '800' },
  lema: { color: colores.textoSuave, fontSize: 15 },
  tituloForm: { color: colores.texto, fontSize: 20, fontWeight: '700' },
  campo: { gap: espacio.xs },
  etiqueta: { color: colores.textoSuave, fontSize: 14 },
  input: {
    minHeight: ALTURA_TOCABLE + 4,
    backgroundColor: colores.superficie,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    color: colores.texto,
    paddingHorizontal: espacio.m,
    fontSize: 16,
  },
  inputError: { borderColor: colores.peligro },
  error: { color: colores.peligro, fontSize: 13 },
  errorServidor: {
    flexDirection: 'row',
    gap: espacio.s,
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.12)',
    padding: espacio.m,
    borderRadius: 10,
  },
  textoErrorServidor: { color: colores.peligro, flex: 1 },
  alternar: { minHeight: ALTURA_TOCABLE, justifyContent: 'center', alignItems: 'center' },
  textoAlternar: { color: colores.textoSuave, fontSize: 15 },
  enlace: { color: colores.primario, fontWeight: '700' },
});
