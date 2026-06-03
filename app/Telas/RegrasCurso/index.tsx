import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { api } from "../../../lib/api";
import { CursoAluno, getCursosAluno } from "../../../services/alunoService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

// Habilita LayoutAnimation no Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Tipos (espelham RegraAtividade do back-end, igual ao web) ────────────────

interface ItemRegra {
  id: number;
  descricao: string;
  aproveitamento: string;
  explicacao?: string;
}

interface Regra {
  id: string;
  area: string;
  limiteHoras: number;
  exigeComprovante: boolean;
  itens: ItemRegra[];
}

// ── Paleta por índice (mesma ideia do web) ───────────────────────────────────

const PALETAS = [
  { borda: "#6366F1", chipBg: "#EEF2FF", chipText: "#6366F1" },
  { borda: "#22C55E", chipBg: "#DCFCE7", chipText: "#15803D" },
  { borda: "#A855F7", chipBg: "#F3E8FF", chipText: "#7E22CE" },
  { borda: "#F59E0B", chipBg: "#FEF3C7", chipText: "#B45309" },
  { borda: "#EC4899", chipBg: "#FCE7F3", chipText: "#BE185D" },
];

function iconeArea(area: string): keyof typeof Ionicons.glyphMap {
  const lower = (area ?? "").toLowerCase();
  if (lower.includes("pesquisa")) return "flask-outline";
  if (lower.includes("exten")) return "people-outline";
  return "book-outline";
}

export default function RegrasCursoScreen() {
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("regras");

  // ── Cursos ─────────────────────────────────────────────────────────────────
  const [cursos, setCursos] = useState<CursoAluno[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<CursoAluno | null>(
    null,
  );
  const [cursoModalOpen, setCursoModalOpen] = useState(false);

  // ── Regras ───────────────────────────────────────────────────────────────
  const [regras, setRegras] = useState<Regra[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // ── Acordeões ──────────────────────────────────────────────────────────────
  const [areaAberta, setAreaAberta] = useState<string | null>(null);
  const [itemAberto, setItemAberto] = useState<string | null>(null);

  // Carrega os cursos do aluno logado
  useEffect(() => {
    (async () => {
      try {
        const lista = await getCursosAluno();
        setCursos(lista);
        if (lista.length > 0) setCursoSelecionado(lista[0]);
        else setLoading(false);
      } catch {
        setErro("Não foi possível carregar seus cursos.");
        setLoading(false);
      }
    })();
  }, []);

  // Busca as regras sempre que o curso selecionado mudar
  const carregarRegras = useCallback(async (cursoId: number) => {
    setLoading(true);
    setErro(null);
    setAreaAberta(null);
    setItemAberto(null);
    try {
      // Mesmo endpoint usado pela versão web — reflete o que o coordenador cadastrou
      const { data } = await api.get<Regra[]>(`/regras/curso/${cursoId}`);
      setRegras(Array.isArray(data) ? data : []);
    } catch {
      setErro("Não foi possível carregar as regras deste curso.");
      setRegras([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cursoSelecionado) carregarRegras(cursoSelecionado.id);
  }, [cursoSelecionado, carregarRegras]);

  const toggleArea = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAreaAberta((prev) => (prev === id ? null : id));
    setItemAberto(null);
  };

  const toggleItem = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItemAberto((prev) => (prev === key ? null : key));
  };

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Regras do Curso</Text>
        <Text style={styles.pageSubtitle}>
          Consulte os limites de horas, atividades permitidas e requisitos de
          envio para cada área.
        </Text>

        {/* Seletor de curso (só aparece se houver mais de um) */}
        {cursos.length > 1 && (
          <>
            <Text style={styles.fieldLabel}>Curso</Text>
            <TouchableOpacity
              style={styles.selectWrapper}
              onPress={() => setCursoModalOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectText} numberOfLines={1}>
                {cursoSelecionado?.nome ?? "Selecione o curso"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>
          </>
        )}

        {/* Banner informativo */}
        {!loading && !erro && regras.length > 0 && cursoSelecionado && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBannerTitle}>
                Carga horária total exigida:{" "}
                {cursoSelecionado.cargaHorariaMinima}h
              </Text>
              <Text style={styles.infoBannerText}>
                As atividades devem estar dentro das áreas e limites definidos
                pelo coordenador.
              </Text>
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.stateText}>Carregando regras...</Text>
          </View>
        )}

        {/* Erro */}
        {!loading && erro && (
          <View style={[styles.card, styles.errorCard]}>
            <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        {/* Vazio */}
        {!loading && !erro && regras.length === 0 && (
          <View style={styles.stateBox}>
            <Ionicons name="book-outline" size={42} color="#D1D5DB" />
            <Text style={styles.stateTitle}>Nenhuma regra cadastrada</Text>
            <Text style={styles.stateText}>
              O coordenador ainda não configurou as regras de atividades
              complementares para este curso.
            </Text>
          </View>
        )}

        {/* Lista de regras */}
        {!loading &&
          !erro &&
          regras.map((regra, idx) => {
            const paleta = PALETAS[idx % PALETAS.length];
            const aberta = areaAberta === regra.id;

            return (
              <View
                key={regra.id}
                style={[styles.ruleCard, { borderLeftColor: paleta.borda }]}
              >
                {/* Cabeçalho da regra */}
                <TouchableOpacity
                  style={styles.ruleHeader}
                  onPress={() => toggleArea(regra.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ruleHeaderLeft}>
                    <View
                      style={[
                        styles.ruleIcon,
                        { backgroundColor: paleta.chipBg },
                      ]}
                    >
                      <Ionicons
                        name={iconeArea(regra.area)}
                        size={20}
                        color={paleta.chipText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ruleTitle}>{regra.area}</Text>
                      <Text style={styles.ruleSubtitle}>
                        Limite de {regra.limiteHoras} horas por curso
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ruleHeaderRight}>
                    {regra.exigeComprovante && (
                      <View style={styles.comprovanteBadge}>
                        <Text style={styles.comprovanteBadgeText}>
                          Comprovante
                        </Text>
                      </View>
                    )}
                    <Ionicons
                      name={aberta ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>

                {/* Itens da regra */}
                {aberta && (
                  <View style={styles.itensContainer}>
                    {regra.itens && regra.itens.length > 0 ? (
                      regra.itens.map((item, i) => {
                        const itemKey = `${regra.id}-${i}`;
                        const itemAbertoAtual = itemAberto === itemKey;
                        return (
                          <View key={item.id ?? itemKey} style={styles.itemRow}>
                            <TouchableOpacity
                              style={styles.itemHeader}
                              onPress={() => toggleItem(itemKey)}
                              activeOpacity={0.7}
                              disabled={!item.explicacao}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={styles.itemDescricao}>
                                  {item.descricao}
                                </Text>
                                <View
                                  style={[
                                    styles.aproveitamentoBadge,
                                    { backgroundColor: paleta.chipBg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.aproveitamentoText,
                                      { color: paleta.chipText },
                                    ]}
                                  >
                                    {item.aproveitamento}
                                  </Text>
                                </View>
                              </View>
                              {!!item.explicacao && (
                                <Ionicons
                                  name={
                                    itemAbertoAtual
                                      ? "chevron-up"
                                      : "chevron-down"
                                  }
                                  size={16}
                                  color={
                                    itemAbertoAtual ? "#6366F1" : "#9CA3AF"
                                  }
                                />
                              )}
                            </TouchableOpacity>

                            {itemAbertoAtual && !!item.explicacao && (
                              <View style={styles.explicacaoBox}>
                                <Text style={styles.explicacaoLabel}>
                                  Detalhes adicionais
                                </Text>
                                <Text style={styles.explicacaoText}>
                                  {item.explicacao}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.semItens}>
                        Nenhum item detalhado para esta área.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
      </ScrollView>

      {/* Modal de seleção de curso */}
      <Modal
        visible={cursoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCursoModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCursoModalOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecionar Curso</Text>
            {cursos.map((curso) => {
              const active = curso.id === cursoSelecionado?.id;
              return (
                <TouchableOpacity
                  key={curso.id}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setCursoSelecionado(curso);
                    setCursoModalOpen(false);
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
        activeItem="regras"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
