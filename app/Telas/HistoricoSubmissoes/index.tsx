import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { styles } from "./style";

// ─── Tipos ───────────────────────────────────────────────

type StatusSubmissao = "PENDENTE" | "APROVADA" | "REPROVADA";

interface CertificadoDTO {
  id: number;
  nomeArquivo: string;
  urlArquivo: string;
}

interface HistoricoSubmissao {
  id: number;
  identificacao: string;
  tipo: string;
  dataSubmissao: string;
  alunoNome: string;
  cursoNome: string;
  status: StatusSubmissao;
  quantidadeRegistros: number;
  observacao?: string | null;
  certificados: CertificadoDTO[];
}

type Filtro = "TODAS" | StatusSubmissao;

const currentUser = {
  name: "Vitor Shampo",
  email: "vitorshampo@gmail.com",
};

const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
  "http://localhost:8080";

const MOCK_DATA: HistoricoSubmissao[] = [
  {
    id: 12,
    identificacao: "Engenharia de Software — Submissão #12",
    tipo: "Atividade Complementar",
    dataSubmissao: "2026-02-15T10:32:00",
    alunoNome: "Vitor Shampo",
    cursoNome: "Engenharia de Software",
    status: "PENDENTE",
    quantidadeRegistros: 1,
    observacao: null,
    certificados: [{ id: 22, nomeArquivo: "seminario-ia.pdf", urlArquivo: "" }],
  },
  {
    id: 9,
    identificacao: "Engenharia de Software — Submissão #9",
    tipo: "Atividade Complementar",
    dataSubmissao: "2026-01-20T14:05:00",
    alunoNome: "Vitor Shampo",
    cursoNome: "Engenharia de Software",
    status: "APROVADA",
    quantidadeRegistros: 2,
    observacao: "Avaliada por Ana Coordenadora",
    certificados: [
      { id: 18, nomeArquivo: "projeto-social.pdf", urlArquivo: "" },
      { id: 19, nomeArquivo: "comprovante-presenca.jpg", urlArquivo: "" },
    ],
  },
  {
    id: 7,
    identificacao: "Engenharia de Software — Submissão #7",
    tipo: "Atividade Complementar",
    dataSubmissao: "2025-12-10T09:14:00",
    alunoNome: "Vitor Shampo",
    cursoNome: "Engenharia de Software",
    status: "APROVADA",
    quantidadeRegistros: 1,
    observacao: "Avaliada por Ana Coordenadora",
    certificados: [
      { id: 15, nomeArquivo: "monitoria-calculo.pdf", urlArquivo: "" },
    ],
  },
  {
    id: 5,
    identificacao: "Engenharia de Software — Submissão #5",
    tipo: "Atividade Complementar",
    dataSubmissao: "2026-01-05T08:22:00",
    alunoNome: "Vitor Shampo",
    cursoNome: "Engenharia de Software",
    status: "REPROVADA",
    quantidadeRegistros: 1,
    observacao: "Avaliada por Ana Coordenadora",
    certificados: [{ id: 11, nomeArquivo: "grupo-teatro.jpg", urlArquivo: "" }],
  },
];

const statusColors: Record<StatusSubmissao, { bg: string; color: string }> = {
  PENDENTE: { bg: "#FEF3C7", color: "#B45309" },
  APROVADA: { bg: "#DCFCE7", color: "#15803D" },
  REPROVADA: { bg: "#FEE2E2", color: "#B91C1C" },
};

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "TODAS", label: "Todas" },
  { key: "PENDENTE", label: "Pendentes" },
  { key: "APROVADA", label: "Aprovadas" },
  { key: "REPROVADA", label: "Reprovadas" },
];

function formatarData(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  const hora = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

function StatusBadge({ status }: { status: StatusSubmissao }) {
  const c = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{status}</Text>
    </View>
  );
}

export default function HistoricoSubmissoesScreen() {
  const insets = useSafeAreaInsets();
  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("historico");

  const [items, setItems] = useState<HistoricoSubmissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [selecionada, setSelecionada] = useState<HistoricoSubmissao | null>(
    null,
  );

  const carregar = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_BASE}/submissoes/historico`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: HistoricoSubmissao[] = await resp.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      // Fallback de exibição enquanto a integração JWT não está habilitada no app
      setItems(MOCK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar(true);
  }, [carregar]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregar(false);
  }, [carregar]);

  const filtrados = useMemo(() => {
    if (filtro === "TODAS") return items;
    return items.filter((i) => i.status === filtro);
  }, [items, filtro]);

  const renderItem = ({ item }: { item: HistoricoSubmissao }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrapper}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.identificacao}
          </Text>
          <Text style={styles.cardSubtitle}>{item.tipo}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{formatarData(item.dataSubmissao)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item.alunoNome ?? "—"}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="document-text-outline" size={14} color="#6B7280" />
          <Text style={styles.metaTextStrong}>
            {item.quantidadeRegistros}{" "}
            {item.quantidadeRegistros === 1 ? "registro" : "registros"}
          </Text>
        </View>
      </View>

      {item.observacao ? (
        <View style={styles.observacaoBox}>
          <Text style={styles.observacaoText}>{item.observacao}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setSelecionada(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={16} color="#4F46E5" />
          <Text style={styles.detailsButtonText}>Visualizar detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.stateText}>Carregando histórico...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="alert-circle-outline" size={42} color="#EF4444" />
          <Text style={styles.stateTitle}>Não foi possível carregar</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => carregar(true)}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <Ionicons name="file-tray-outline" size={42} color="#9CA3AF" />
        <Text style={styles.stateTitle}>Nenhuma submissão por aqui</Text>
        <Text style={styles.stateText}>
          Quando você enviar uma atividade, ela aparecerá no histórico.
        </Text>
      </View>
    );
  };

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
          <Ionicons name="time-outline" size={18} color="#6366F1" />
          <Text style={styles.topBarTitle}>Histórico de Submissões</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24, flexGrow: 1 },
        ]}
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.pageTitle}>Meu Histórico</Text>
            <Text style={styles.pageSubtitle}>
              Acompanhe todas as suas submissões enviadas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              {FILTROS.map((f) => {
                const active = f.key === filtro;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFiltro(f.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        active && styles.chipLabelActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={renderEmpty}
      />

      <Modal
        visible={!!selecionada}
        transparent
        animationType="slide"
        onRequestClose={() => setSelecionada(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelecionada(null)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selecionada?.identificacao}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelecionada(null)}
              >
                <Ionicons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            {selecionada && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>{selecionada.tipo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <StatusBadge status={selecionada.status} />
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data/Hora</Text>
                  <Text style={styles.detailValue}>
                    {formatarData(selecionada.dataSubmissao)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Usuário</Text>
                  <Text style={styles.detailValue}>
                    {selecionada.alunoNome ?? "—"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Curso</Text>
                  <Text style={styles.detailValue}>
                    {selecionada.cursoNome ?? "—"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registros processados</Text>
                  <Text style={styles.detailValue}>
                    {selecionada.quantidadeRegistros}
                  </Text>
                </View>
                {selecionada.observacao && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Observação</Text>
                    <Text style={styles.detailValue}>
                      {selecionada.observacao}
                    </Text>
                  </View>
                )}

                {selecionada.certificados &&
                  selecionada.certificados.length > 0 && (
                    <>
                      <Text style={styles.modalSectionTitle}>
                        Certificados anexados
                      </Text>
                      {selecionada.certificados.map((c) => (
                        <View key={c.id} style={styles.certificadoItem}>
                          <Ionicons
                            name="document-attach-outline"
                            size={18}
                            color="#4F46E5"
                          />
                          <Text style={styles.certificadoName} numberOfLines={1}>
                            {c.nomeArquivo}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="historico"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
