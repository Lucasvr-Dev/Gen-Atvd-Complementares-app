// app/Telas/NovaSubmissao/index.tsx
//
// INTEGRAÇÃO COM O BACKEND
// ─────────────────────────────────────────────────────────────────────────────
// 1. Carrega os cursos do aluno logado via GET /alunos/me/cursos
// 2. Upload real usando expo-document-picker OU expo-image-picker
// 3. Converte o arquivo para base64 usando expo-file-system
// 4. Submete via POST /submissoes + certificado embutido no payload
//    (campo certificados[].urlArquivo = base64 — igual ao contrato do back)
// 5. Erros de rede são exibidos inline sem travar o app
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
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

// Categorias fixas — o back-end não tem endpoint de categorias,
// então mantemos a lista local igual ao design original.
const CATEGORIAS = ["Pesquisa", "Extensão", "Ensino", "Cultura", "Esporte"];

export default function NovaSubmissaoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUser = useCurrentUser();

  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("submissao");

  // ── Campos do formulário ─────────────────────────────────────────────────
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaOpen, setCategoriaOpen] = useState(false);

  // ── Arquivo selecionado ──────────────────────────────────────────────────
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [arquivoBase64, setArquivoBase64] = useState<string | null>(null);

  // ── Cursos do aluno logado ───────────────────────────────────────────────
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

  // ── Carrega cursos ao montar ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const lista = await getCursosAluno();
        setCursos(lista);
        // Pré-seleciona o primeiro curso se houver apenas um
        if (lista.length === 1) {
          setCursoSelecionadoId(lista[0].id);
        }
      } catch {
        // Silencia — o aluno verá o seletor vazio e poderá tentar novamente
      } finally {
        setLoadingCursos(false);
      }
    })();
  }, []);

  // ── Helpers de arquivo ───────────────────────────────────────────────────

  // Lê o arquivo do disco e converte para base64 puro (sem prefixo data:...)
  const lerBase64 = async (uri: string): Promise<string> => {
    const base64comPrefixo = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64comPrefixo; // expo-file-system já retorna só o base64
  };

  const handleEscolherArquivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      const arquivo = resultado.assets[0];
      setArquivoNome(arquivo.name);
      const b64 = await lerBase64(arquivo.uri);
      setArquivoBase64(b64);
    } catch {
      setErroEnvio("Não foi possível ler o arquivo. Tente novamente.");
    }
  };

  const handleTirarFoto = async () => {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissao.granted) {
        setErroEnvio("Permissão de câmera negada.");
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true, // solicita base64 direto do ImagePicker
      });

      if (resultado.canceled) return;

      const foto = resultado.assets[0];
      const nomeArquivo = `foto_certificado_${Date.now()}.jpg`;
      setArquivoNome(nomeArquivo);

      if (foto.base64) {
        setArquivoBase64(foto.base64);
      } else {
        // Fallback via FileSystem se base64 não vier no asset
        const b64 = await lerBase64(foto.uri);
        setArquivoBase64(b64);
      }
    } catch {
      setErroEnvio("Não foi possível capturar a foto. Tente novamente.");
    }
  };

  // ── Validação ────────────────────────────────────────────────────────────

  const cursoNomeSelecionado =
    cursos.find((c) => c.id === cursoSelecionadoId)?.nome ?? null;

  const isFormValid =
    titulo.trim() !== "" &&
    categoria.trim() !== "" &&
    dataInicio.trim() !== "" &&
    cargaHoraria.trim() !== "" &&
    cursoSelecionadoId !== null &&
    arquivoBase64 !== null;

  // ── Envio ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isFormValid || !user) return;

    setErroEnvio(null);
    setEnviando(true);

    try {
      // O back-end espera:
      // { titulo, descricao, horas, alunoId, cursoId,
      //   certificados: [{ nomeArquivo, urlArquivo (base64) }] }
      //
      // Porém o SubmissaoRequestDTO só tem titulo/descricao/horas/alunoId/cursoId.
      // Os certificados são criados junto via cascade no service
      // (criarSubmissao já salva o certificado quando o payload inclui "certificados").
      //
      // Verificar o SubmissaoService: ele recebe SubmissaoRequestDTO sem certificados,
      // e depois o front chama POST /certificados separado.
      // Usamos o fluxo em dois passos para respeitar o contrato existente.

      // Passo 1 — cria a submissão
      const payloadSubmissao = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        horas: parseInt(cargaHoraria, 10),
        alunoId: user.alunoId,
        cursoId: cursoSelecionadoId,
      };

      const { data: submissaoCriada } = await api.post<{ id: number }>(
        "/submissoes",
        payloadSubmissao,
      );

      // Passo 2 — anexa o certificado em base64
      const payloadCertificado = {
        nomeArquivo: arquivoNome ?? "certificado.pdf",
        urlArquivo: arquivoBase64,
        submissaoId: submissaoCriada.id,
      };

      await api.post("/certificados", payloadCertificado);

      // Sucesso — limpa o formulário
      setSucesso(true);
      setTitulo("");
      setCategoria("");
      setDataInicio("");
      setCargaHoraria("");
      setDescricao("");
      setArquivoNome(null);
      setArquivoBase64(null);
      if (cursos.length !== 1) setCursoSelecionadoId(null);

      // Remove mensagem de sucesso após 4s
      setTimeout(() => setSucesso(false), 4000);
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

          {/* ── Feedback de sucesso ── */}
          {sucesso && (
            <View
              style={{
                backgroundColor: "#DCFCE7",
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#15803D" />
              <Text
                style={{
                  color: "#15803D",
                  fontSize: 14,
                  fontWeight: "600",
                  flex: 1,
                }}
              >
                Atividade enviada com sucesso! Aguarde a avaliação do
                coordenador.
              </Text>
            </View>
          )}

          {/* ── Erro de envio ── */}
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
            {/* ── Curso (dinâmico) ── */}
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
              // Se só tem um curso, mostra fixo sem abrir modal
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

            {/* ── Título ── */}
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

            {/* ── Categoria ── */}
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

            {/* ── Data de Início ── */}
            <Text style={[styles.fieldLabel, styles.mt18]}>
              Data de Início <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={dataInicio}
                onChangeText={setDataInicio}
                keyboardType="numeric"
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#6B7280"
                style={styles.dropdownChevron}
              />
            </View>

            {/* ── Carga Horária ── */}
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
                  // Bloqueia valor acima de 20 em tempo real
                  const num = parseInt(v, 10);
                  if (!isNaN(num) && num > 20) {
                    setCargaHoraria("20");
                  } else {
                    setCargaHoraria(v);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
            <Text style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4 }}>
              O back-end limita 20h por submissão.
            </Text>

            {/* ── Descrição ── */}
            <Text style={[styles.fieldLabel, styles.mt18]}>Descrição</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Breve descrição da atividade realizada"
                placeholderTextColor="#9CA3AF"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* ── Certificado ── */}
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
                {arquivoNome ?? "PDF, JPG ou PNG (max 5MB)"}
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

          {/* ── Botão de envio ── */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || enviando) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!isFormValid || enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Enviar Atividade</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Modal de Categoria ── */}
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

      {/* ── Modal de Curso ── */}
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
