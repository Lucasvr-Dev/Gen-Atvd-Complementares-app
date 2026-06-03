import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../lib/api";
import { CursoAluno, getCursosAluno } from "../../../services/alunoService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

const CATEGORIAS = ["Pesquisa", "Extensão", "Ensino", "Cultura", "Esporte"];

function formatarData(raw: string): string {
  const nums = raw.replace(/\D/g, "");
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
  return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
}

export default function NovaSubmissaoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUser = useCurrentUser();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("submissao");

  // ── Campos do formulário ─────────────────────────────────────────────────
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaOpen, setCategoriaOpen] = useState(false);

  // ── Arquivo ──────────────────────────────────────────────────────────────
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [arquivoBase64, setArquivoBase64] = useState<string | null>(null);

  // ── Cursos ───────────────────────────────────────────────────────────────
  const [cursos, setCursos] = useState<CursoAluno[]>([]);
  const [cursoSelecionadoId, setCursoSelecionadoId] = useState<number | null>(
    null,
  );
  const [cursoOpen, setCursoOpen] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // ── Estado de envio ──────────────────────────────────────────────────────
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Limpa o timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Carrega cursos ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const lista = await getCursosAluno();
        setCursos(lista);
        if (lista.length === 1) setCursoSelecionadoId(lista[0].id);
      } catch {
        setErroEnvio("Não foi possível carregar seus cursos.");
      } finally {
        setLoadingCursos(false);
      }
    })();
  }, []);

  // ── Helpers de arquivo ───────────────────────────────────────────────────
  const lerBase64 = async (uri: string): Promise<string> =>
    FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

  const handleEscolherArquivo = async () => {
    try {
      setErroEnvio(null);
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (resultado.canceled) return;
      const arquivo = resultado.assets[0];
      setArquivoNome(arquivo.name);
      setArquivoBase64(await lerBase64(arquivo.uri));
    } catch {
      setErroEnvio("Não foi possível ler o arquivo. Tente novamente.");
    }
  };

  const handleTirarFoto = async () => {
    try {
      setErroEnvio(null);
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissao.granted) {
        setErroEnvio("Permissão de câmera negada.");
        return;
      }
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
      });
      if (resultado.canceled) return;
      const foto = resultado.assets[0];
      setArquivoNome(`foto_certificado_${Date.now()}.jpg`);
      setArquivoBase64(foto.base64 ?? (await lerBase64(foto.uri)));
    } catch {
      setErroEnvio("Não foi possível capturar a foto. Tente novamente.");
    }
  };

  // ── Validação ────────────────────────────────────────────────────────────
  const horasNum = parseInt(cargaHoraria, 10);
  const horasValidas = !isNaN(horasNum) && horasNum >= 1 && horasNum <= 20;

  const isFormValid =
    titulo.trim() !== "" &&
    categoria.trim() !== "" &&
    dataInicio.trim().length === 10 &&
    horasValidas &&
    cursoSelecionadoId !== null &&
    arquivoBase64 !== null;

  const cursoNomeSelecionado =
    cursos.find((c) => c.id === cursoSelecionadoId)?.nome ?? null;

  // ── Envio ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid || !user || enviando) return;

    setErroEnvio(null);
    setEnviando(true);

    // Guarda os valores antes de limpar
    const tituloEnvio = titulo.trim();
    const horasEnvio = horasNum;
    const cursoEnvio = cursoSelecionadoId;
    const arquivoNomeEnvio = arquivoNome;
    const arquivoBase64Envio = arquivoBase64;
    const descricaoFinal = [
      `Categoria: ${categoria}`,
      `Data de início: ${dataInicio}`,
      descricao.trim() ? descricao.trim() : "",
    ]
      .filter(Boolean)
      .join(" | ");

    // Limpa o formulário imediatamente antes da requisição
    setTitulo("");
    setCategoria("");
    setDataInicio("");
    setCargaHoraria("");
    setDescricao("");
    setArquivoNome(null);
    setArquivoBase64(null);
    if (cursos.length !== 1) setCursoSelecionadoId(null);

    try {
      // Passo 1 — cria a submissão com os valores guardados
      const { data: submissaoCriada } = await api.post<{ id: number }>(
        "/submissoes",
        {
          titulo: tituloEnvio,
          descricao: descricaoFinal,
          horas: horasEnvio,
          alunoId: user.alunoId,
          cursoId: cursoEnvio,
        },
      );

      // Passo 2 — anexa o certificado
      await api.post("/certificados", {
        nomeArquivo: arquivoNomeEnvio ?? "certificado.pdf",
        urlArquivo: arquivoBase64Envio,
        submissaoId: submissaoCriada.id,
      });

      // Botão fica verde por 2.5s
      setSucesso(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSucesso(false);
      }, 2500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Erro ao enviar atividade. Verifique sua conexão e tente novamente.";
      setErroEnvio(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setEnviando(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Ionicons name="school" size={18} color="#6366F1" />
          <Text style={styles.topBarTitle}>Atividades Complementares</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Nova Atividade</Text>
          <Text style={styles.pageSubtitle}>
            Submeta um certificado de atividade complementar
          </Text>

          {/* Erro de envio */}
          {erroEnvio && (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#B91C1C" />
              <Text style={{ color: "#B91C1C", fontSize: 13, flex: 1 }}>
                {erroEnvio}
              </Text>
            </View>
          )}

          <View style={styles.card}>
            {/* Curso */}
            <Text style={styles.fieldLabel}>
              Curso <Text style={styles.required}>*</Text>
            </Text>
            {loadingCursos ? (
              <View
                style={[
                  styles.inputWrapper,
                  { justifyContent: "center", paddingVertical: 14 },
                ]}
              >
                <ActivityIndicator size="small" color="#6366F1" />
              </View>
            ) : cursos.length === 0 ? (
              <View style={[styles.inputWrapper, { paddingVertical: 14 }]}>
                <Text style={{ color: "#EF4444", fontSize: 13, flex: 1 }}>
                  Nenhum curso encontrado para sua conta.
                </Text>
              </View>
            ) : cursos.length === 1 ? (
              <View style={styles.inputWrapper}>
                <Text style={[styles.input, { color: "#111827" }]}>
                  {cursos[0].nome}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#22C55E"
                  style={styles.dropdownChevron}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setCursoOpen(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.input,
                    !cursoNomeSelecionado && { color: "#9CA3AF" },
                  ]}
                >
                  {cursoNomeSelecionado ?? "Selecione o curso"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#6B7280"
                  style={styles.dropdownChevron}
                />
              </TouchableOpacity>
            )}

            {/* Título */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Título da Atividade <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Seminário de Inteligência Artificial"
                placeholderTextColor="#9CA3AF"
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            {/* Categoria */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Categoria <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setCategoriaOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !categoria && { color: "#9CA3AF" }]}>
                {categoria || "Selecione uma categoria"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#6B7280"
                style={styles.dropdownChevron}
              />
            </TouchableOpacity>

            {/* Data de início */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Data de Início <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={dataInicio}
                onChangeText={(v) => setDataInicio(formatarData(v))}
                keyboardType="numeric"
                maxLength={10}
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#6B7280"
                style={styles.dropdownChevron}
              />
            </View>

            {/* Carga horária */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Carga Horária (horas) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 10  (máximo 20h por submissão)"
                placeholderTextColor="#9CA3AF"
                value={cargaHoraria}
                onChangeText={(v) => {
                  const num = parseInt(v, 10);
                  if (!isNaN(num) && num > 20) setCargaHoraria("20");
                  else setCargaHoraria(v.replace(/[^0-9]/g, ""));
                }}
                keyboardType="numeric"
              />
            </View>
            {cargaHoraria !== "" && !horasValidas && (
              <Text style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>
                Informe um valor entre 1 e 20 horas.
              </Text>
            )}
            <Text style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4 }}>
              Limite de 20h por submissão.
            </Text>

            {/* Descrição */}
            <Text style={[styles.fieldLabel, styles.mt18]}>Descrição</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Breve descrição da atividade realizada (opcional)"
                placeholderTextColor="#9CA3AF"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Certificado */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Certificado / Comprovante <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.uploadCard}>
              <View style={styles.uploadIconCircle}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={28}
                  color="#6366F1"
                />
              </View>
              <Text style={styles.uploadHint}>
                {arquivoNome ?? "PDF, JPG ou PNG (máx. 5MB)"}
              </Text>
              {arquivoBase64 && (
                <Text
                  style={{ fontSize: 11, color: "#22C55E", marginBottom: 8 }}
                >
                  ✓ Arquivo carregado e pronto para envio
                </Text>
              )}
              <View style={styles.uploadActions}>
                <TouchableOpacity
                  style={styles.uploadPrimaryBtn}
                  onPress={handleEscolherArquivo}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.uploadPrimaryText}>Escolher</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadSecondaryBtn}
                  onPress={handleTirarFoto}
                  activeOpacity={0.85}
                >
                  <Ionicons name="camera-outline" size={16} color="#374151" />
                  <Text style={styles.uploadSecondaryText}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botão de envio */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !sucesso && !isFormValid && styles.submitButtonDisabled,
              sucesso && {
                backgroundColor: "#22C55E",
                shadowColor: "#22C55E",
              },
            ]}
            onPress={sucesso ? undefined : handleSubmit}
            activeOpacity={sucesso ? 1 : 0.85}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : sucesso ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Enviado com sucesso!
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Enviar Atividade</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Categoria */}
      <Modal
        visible={categoriaOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoriaOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoriaOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Categoria</Text>
            {CATEGORIAS.map((cat) => {
              const active = cat === categoria;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setCategoria(cat);
                    setCategoriaOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemLabel,
                      active && styles.modalItemLabelActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color="#6366F1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Curso */}
      <Modal
        visible={cursoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCursoOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCursoOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar Curso</Text>
            {cursos.map((curso) => {
              const active = curso.id === cursoSelecionadoId;
              return (
                <TouchableOpacity
                  key={curso.id}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setCursoSelecionadoId(curso.id);
                    setCursoOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemLabel,
                      active && styles.modalItemLabelActive,
                    ]}
                  >
                    {curso.nome}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color="#6366F1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="submissao"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
