import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  root: { flex: 1, backgroundColor: "#F3F4F8" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  menuButton: { padding: 4 },

  topBarCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },

  topBarTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  greetingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },

  sectionLabel: { fontSize: 13, color: "#6B7280", marginBottom: 10 },

  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },

  courseCardActive: { backgroundColor: "#EEF2FF", borderColor: "#6366F1" },

  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  courseIconBoxActive: { backgroundColor: "#6366F1" },
  courseIconBoxInactive: { backgroundColor: "#F3F4F6" },

  courseName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  courseProgress: { fontSize: 13, color: "#6B7280" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },

  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: { fontSize: 12.5, color: "#6B7280" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  donutContainer: { alignItems: "center", marginVertical: 8 },
  donutWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 180,
    height: 180,
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  donutPercent: { fontSize: 26, fontWeight: "800", color: "#111827" },
  donutLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12.5, color: "#374151" },

  barsContainer: { paddingRight: 8 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: {
    width: 70,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#C7D2FE", borderRadius: 5 },

  axisRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  axisLabel: { width: 70, marginRight: 8 },
  axisLine: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  axisTick: { fontSize: 10, color: "#9CA3AF" },

  submissionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  submissionTitle: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  submissionMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  areaBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  areaBadgeText: { fontSize: 11, color: "#6366F1", fontWeight: "600" },

  submissionMetaText: { fontSize: 11.5, color: "#9CA3AF" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    textTransform: "lowercase",
  },
});
