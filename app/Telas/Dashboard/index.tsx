import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { styles } from "./style";

const courses = [
  { id: 1, name: "Engenharia de Software", progress: 60, active: true },
  { id: 2, name: "Administracao", progress: 33, active: false },
];

const stats = [
  {
    icon: "checkmark-circle",
    label: "Horas Aprovadas",
    value: "120h",
    color: "#22C55E",
    bg: "#DCFCE7",
  },
  {
    icon: "time",
    label: "Horas Pendentes",
    value: "30h",
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    icon: "close-circle",
    label: "Horas Rejeitadas",
    value: "10h",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  {
    icon: "book",
    label: "Meta Total",
    value: "200h",
    color: "#6366F1",
    bg: "#E0E7FF",
  },
] as const;

const areaProgress = [
  { label: "Pesquisa", value: 35 },
  { label: "Extensao", value: 22 },
  { label: "Ensino", value: 30 },
  { label: "Cultura", value: 15 },
  { label: "Esporte", value: 10 },
];

type SubmissionStatus = "pendente" | "aprovada" | "rejeitada";
interface Submission {
  title: string;
  area: string;
  hours: string;
  date: string;
  status: SubmissionStatus;
}

const submissions: Submission[] = [
  {
    title: "Seminario de IA",
    area: "Pesquisa",
    hours: "10h",
    date: "2026-02-15",
    status: "pendente",
  },
  {
    title: "Projeto Social",
    area: "Extensao",
    hours: "20h",
    date: "2026-01-20",
    status: "aprovada",
  },
  {
    title: "Monitoria Calculo",
    area: "Ensino",
    hours: "30h",
    date: "2025-12-10",
    status: "aprovada",
  },
  {
    title: "Grupo de Teatro",
    area: "Cultura",
    hours: "8h",
    date: "2026-01-05",
    status: "rejeitada",
  },
  {
    title: "Hackathon 2025",
    area: "Pesquisa",
    hours: "15h",
    date: "2026-02-28",
    status: "pendente",
  },
  {
    title: "Jogos Universitarios",
    area: "Esporte",
    hours: "12h",
    date: "2026-03-01",
    status: "aprovada",
  },
];

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
        <Text style={styles.donutLabel}>concluido</Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const configs = {
    pendente: { bg: "#FEF3C7", color: "#B45309" },
    aprovada: { bg: "#DCFCE7", color: "#15803D" },
    rejeitada: { bg: "#FEE2E2", color: "#B91C1C" },
  };
  const c = configs[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>{status}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const maxAreaValue = Math.max(...areaProgress.map((a) => a.value), 60);

  const currentUser = useCurrentUser();

  const { drawerOpen, openDrawer, closeDrawer, handleSelect, handleLogout } =
    useDrawerNavigation("dashboard");

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greetingTitle}>Meu Painel</Text>
        <Text style={styles.greetingSubtitle}>
          Acompanhe seu progresso em atividades complementares
        </Text>

        <Text style={styles.sectionLabel}>Meus Cursos</Text>
        {courses.map((course) => (
          <View
            key={course.id}
            style={[
              styles.courseCard,
              course.active && styles.courseCardActive,
            ]}
          >
            <View
              style={[
                styles.courseIconBox,
                course.active
                  ? styles.courseIconBoxActive
                  : styles.courseIconBoxInactive,
              ]}
            >
              <Ionicons
                name="book"
                size={22}
                color={course.active ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseProgress}>
                {course.progress}% concluido
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progresso Geral</Text>
          <View style={styles.donutContainer}>
            <DonutChart approved={120} pending={30} rejected={10} />
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progresso por Area</Text>
          <View style={styles.barsContainer}>
            {areaProgress.map((area) => (
              <View key={area.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{area.label}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(area.value / maxAreaValue) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
            <View style={styles.axisRow}>
              <View style={styles.axisLabel} />
              <View style={styles.axisLine}>
                <Text style={styles.axisTick}>0</Text>
                <Text style={styles.axisTick}>15</Text>
                <Text style={styles.axisTick}>30</Text>
                <Text style={styles.axisTick}>45</Text>
                <Text style={styles.axisTick}>60</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Minhas Submissoes Recentes</Text>
          {submissions.map((sub, idx) => (
            <View
              key={idx}
              style={[
                styles.submissionRow,
                idx === submissions.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.submissionTitle}>{sub.title}</Text>
                <View style={styles.submissionMeta}>
                  <View style={styles.areaBadge}>
                    <Text style={styles.areaBadgeText}>{sub.area}</Text>
                  </View>
                  <Text style={styles.submissionMetaText}>{sub.hours}</Text>
                  <Text style={styles.submissionMetaText}>{sub.date}</Text>
                </View>
              </View>
              <StatusBadge status={sub.status} />
            </View>
          ))}
        </View>
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
