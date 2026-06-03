import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

import SideDrawer from "../../../app/componentes/SideDrawer";
import { useDrawerNavigation } from "../../../app/hooks/userDrawerNavigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
    DashboardData,
    getDashboardData,
} from "../../../services/dashboardService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

// ── Tipos ────────────────────────────────────────────────────────────────────

type SubmissionStatus = "PENDENTE" | "APROVADA" | "REPROVADA";

// ── Componente DonutChart ────────────────────────────────────────────────────

function DonutChart({
  approved,
  pending,
  rejected,
}: {
  approved: number;
  pending: number;
  rejected: number;
}) {
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = approved + pending + rejected;

  if (total === 0) {
    return (
      <View style={styles.donutWrapper}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
          </G>
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutPercent}>0%</Text>
          <Text style={styles.donutLabel}>concluído</Text>
        </View>
      </View>
    );
  }

  const approvedLen = (approved / total) * circumference;
  const pendingLen = (pending / total) * circumference;
  const rejectedLen = (rejected / total) * circumference;
  const percent = Math.round((approved / total) * 100);

  return (
    <View style={styles.donutWrapper}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#22C55E"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${approvedLen} ${circumference}`}
            strokeDashoffset={0}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${pendingLen} ${circumference}`}
            strokeDashoffset={-approvedLen}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${rejectedLen} ${circumference}`}
            strokeDashoffset={-(approvedLen + pendingLen)}
          />
        </G>
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutPercent}>{percent}%</Text>
        <Text style={styles.donutLabel}>concluído</Text>
      </View>
    </View>
  );
}

// ── Componente StatusBadge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const configs: Record<
    SubmissionStatus,
    { bg: string; color: string; label: string }
  > = {
    PENDENTE: { bg: "#FEF3C7", color: "#B45309", label: "pendente" },
    APROVADA: { bg: "#DCFCE7", color: "#15803D", label: "aprovada" },
    REPROVADA: { bg: "#FEE2E2", color: "#B91C1C", label: "reprovada" },
  };
  const c = configs[status] ?? configs.PENDENTE;
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>
        {c.label}
      </Text>
    </View>
  );
}

// ── Tela principal ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUser = useCurrentUser();

  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("dashboard");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const result = await getDashboardData(user.alunoId);
      setData(result);
    } catch (err: any) {
      setError("Não foi possível carregar os dados. Tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ── Derivados para o gráfico de barras ──────────────────────────────────

  const maxAreaValue = Math.max(
    ...(data?.progressoPorArea.map((a) => a.value) ?? [0]),
    1,
  );

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>
          Carregando painel...
        </Text>
      </View>
    );
  }

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        {/* Saudação */}
        <Text style={styles.greetingTitle}>
          Olá, {user?.nome?.split(" ")[0] ?? "Aluno"} 👋
        </Text>
        <Text style={styles.greetingSubtitle}>
          Acompanhe seu progresso em atividades complementares
        </Text>

        {/* Erro */}
        {error && (
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
            <Ionicons name="alert-circle" size={18} color="#B91C1C" />
            <Text style={{ color: "#B91C1C", fontSize: 13, flex: 1 }}>
              {error}
            </Text>
            <TouchableOpacity onPress={fetchData}>
              <Text
                style={{ color: "#B91C1C", fontWeight: "700", fontSize: 13 }}
              >
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meus cursos */}
        {data && data.cursos.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Meus Cursos</Text>
            {data.cursos.map((course, idx) => (
              <View
                key={course.id}
                style={[
                  styles.courseCard,
                  idx === 0 && styles.courseCardActive,
                ]}
              >
                <View
                  style={[
                    styles.courseIconBox,
                    idx === 0
                      ? styles.courseIconBoxActive
                      : styles.courseIconBoxInactive,
                  ]}
                >
                  <Ionicons
                    name="book"
                    size={22}
                    color={idx === 0 ? "#FFFFFF" : "#9CA3AF"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName}>{course.nome}</Text>
                  <Text style={styles.courseProgress}>
                    Meta: {course.cargaHorariaMinima}h
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Stats grid */}
        {data && (
          <View style={styles.statsGrid}>
            {[
              {
                icon: "checkmark-circle" as const,
                label: "Horas Aprovadas",
                value: `${data.stats.horasAprovadas}h`,
                color: "#22C55E",
                bg: "#DCFCE7",
              },
              {
                icon: "time" as const,
                label: "Horas Pendentes",
                value: `${data.stats.horasPendentes}h`,
                color: "#F59E0B",
                bg: "#FEF3C7",
              },
              {
                icon: "close-circle" as const,
                label: "Horas Rejeitadas",
                value: `${data.stats.horasRejeitadas}h`,
                color: "#EF4444",
                bg: "#FEE2E2",
              },
              {
                icon: "book" as const,
                label: "Meta Total",
                value: `${data.stats.metaTotal}h`,
                color: "#6366F1",
                bg: "#E0E7FF",
              },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <View
                  style={[styles.statIconBox, { backgroundColor: stat.bg }]}
                >
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gráfico donut */}
        {data && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progresso Geral</Text>
            <View style={styles.donutContainer}>
              <DonutChart
                approved={data.stats.horasAprovadas}
                pending={data.stats.horasPendentes}
                rejected={data.stats.horasRejeitadas}
              />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#22C55E" }]}
                />
                <Text style={styles.legendText}>Aprovadas</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F59E0B" }]}
                />
                <Text style={styles.legendText}>Pendentes</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
                />
                <Text style={styles.legendText}>Rejeitadas</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico de barras por área */}
        {data && data.progressoPorArea.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progresso por Área</Text>
            <View style={styles.barsContainer}>
              {data.progressoPorArea.map((area) => (
                <View key={area.label} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {area.label}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.round((area.value / maxAreaValue) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      marginLeft: 6,
                      minWidth: 28,
                    }}
                  >
                    {area.value}h
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Submissões recentes */}
        {data && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {data.submissoesRecentes.length > 0
                ? "Minhas Submissões Recentes"
                : "Nenhuma submissão ainda"}
            </Text>
            {data.submissoesRecentes.length === 0 ? (
              <Text
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  textAlign: "center",
                  paddingVertical: 16,
                }}
              >
                Você ainda não enviou nenhuma atividade.{"\n"}
                Use o menu para enviar sua primeira submissão!
              </Text>
            ) : (
              data.submissoesRecentes.map((sub, idx) => (
                <View
                  key={sub.id}
                  style={[
                    styles.submissionRow,
                    idx === data.submissoesRecentes.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.submissionTitle}>{sub.titulo}</Text>
                    <View style={styles.submissionMeta}>
                      <View style={styles.areaBadge}>
                        <Text style={styles.areaBadgeText}>{sub.area}</Text>
                      </View>
                      <Text style={styles.submissionMetaText}>
                        {sub.horas}h
                      </Text>
                      <Text style={styles.submissionMetaText}>
                        {sub.dataSubmissao}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={sub.status} />
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <SideDrawer
        visible={drawerOpen}
        onClose={closeDrawer}
        user={currentUser}
        activeItem="dashboard"
        onSelect={handleSelect}
        onLogout={handleLogout}
      />
    </View>
  );
}
