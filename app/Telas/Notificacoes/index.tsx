import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { useAuth } from "../../../contexts/AuthContext";
import { getSubmissoesAluno, Submissao } from "../../../services/alunoService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

// ── Helpers ──────────────────────────────────────────────────────────────────

type StatusBackend = "PENDENTE" | "APROVADO" | "REPROVADO";

const STATUS_CONFIG: Record<
  StatusBackend,
  {
    label: string;
    color: string;
    bg: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  PENDENTE: {
    label: "Pendente",
    color: "#B45309",
    bg: "#FEF3C7",
    icon: "time-outline",
  },
  APROVADO: {
    label: "Aprovada",
    color: "#15803D",
    bg: "#DCFCE7",
    icon: "checkmark-circle-outline",
  },
  REPROVADO: {
    label: "Reprovada",
    color: "#B91C1C",
    bg: "#FEE2E2",
    icon: "close-circle-outline",
  },
};

function formatarData(dataISO: string) {
  try {
    const d = new Date(dataISO);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dataISO;
  }
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function NotificacoesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUser = useCurrentUser();

  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("notificacoes");

  const [submissoes, setSubmissoes] = useState<Submissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const todas = await getSubmissoesAluno();

        // Filtra apenas as submissões do aluno logado e ordena da mais recente
        const minhas = todas
          .filter((s) => s.id !== undefined)
          .sort(
            (a, b) =>
              new Date(b.dataSubmissao).getTime() -
              new Date(a.dataSubmissao).getTime(),
          );

        setSubmissoes(minhas);
      } catch {
        setErro("Não foi possível carregar suas atividades.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top bar ── */}
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
        <Text style={styles.pageTitle}>Notificações</Text>
        <Text style={styles.pageSubtitle}>
          Acompanhe o status das suas atividades submetidas
        </Text>

        {/* ── Loading ── */}
        {loading && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>
              Carregando atividades...
            </Text>
          </View>
        )}

        {/* ── Erro ── */}
        {!loading && erro && (
          <View
            style={[
              styles.card,
              { flexDirection: "row", alignItems: "center", gap: 10 },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
            <Text style={[styles.cardText, { color: "#B91C1C" }]}>{erro}</Text>
          </View>
        )}

        {/* ── Vazio ── */}
        {!loading && !erro && submissoes.length === 0 && (
          <View
            style={[styles.card, { alignItems: "center", paddingVertical: 32 }]}
          >
            <Ionicons
              name="notifications-off-outline"
              size={40}
              color="#D1D5DB"
            />
            <Text
              style={[
                styles.cardText,
                { marginTop: 12, textAlign: "center", color: "#9CA3AF" },
              ]}
            >
              Você ainda não tem atividades submetidas.
            </Text>
          </View>
        )}

        {/* ── Lista de submissões ── */}
        {!loading &&
          !erro &&
          submissoes.map((sub) => {
            const status = (sub.status ?? "PENDENTE") as StatusBackend;
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;

            return (
              <View
                key={sub.id}
                style={[
                  styles.card,
                  {
                    marginBottom: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: config.color,
                    padding: 16,
                  },
                ]}
              >
                {/* Título + badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={[
                      styles.cardText,
                      {
                        fontWeight: "700",
                        fontSize: 14.5,
                        flex: 1,
                        marginRight: 8,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {sub.titulo}
                  </Text>
                  <View
                    style={{
                      backgroundColor: config.bg,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={config.icon}
                      size={13}
                      color={config.color}
                    />
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontWeight: "600",
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </Text>
                  </View>
                </View>

                {/* Metadados */}
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                >
                  {sub.horas && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {sub.horas}h
                      </Text>
                    </View>
                  )}
                  {sub.dataSubmissao && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#9CA3AF"
                      />
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {formatarData(sub.dataSubmissao)}
                      </Text>
                    </View>
                  )}
                  {sub.curso?.nome && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="book-outline" size={13} color="#9CA3AF" />
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {sub.curso.nome}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Feedback do coordenador */}
                {sub.feedback && (
                  <View
                    style={{
                      marginTop: 10,
                      backgroundColor: config.bg,
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontWeight: "600",
                        color: config.color,
                        marginBottom: 2,
                      }}
                    >
                      Feedback do coordenador
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#374151", lineHeight: 18 }}
                    >
                      {sub.feedback}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
      </ScrollView>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="notificacoes"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
