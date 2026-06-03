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

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },

  // Seletor de curso
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  selectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
  },
  selectText: { flex: 1, fontSize: 14.5, color: "#111827" },

  // Banner informativo
  infoBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  infoBannerTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 2,
  },
  infoBannerText: { fontSize: 12.5, color: "#1D4ED8", lineHeight: 18 },

  // Estados (loading / vazio)
  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  stateTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  stateText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 19,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, color: "#B91C1C" },

  // Card da regra
  ruleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  ruleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  ruleIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleTitle: { fontSize: 15.5, fontWeight: "700", color: "#111827" },
  ruleSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  ruleHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  comprovanteBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comprovanteBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },

  // Itens
  itensContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
  },
  itemRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemDescricao: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  aproveitamentoBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aproveitamentoText: { fontSize: 12, fontWeight: "600" },

  explicacaoBox: {
    marginTop: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#C7D2FE",
    padding: 10,
  },
  explicacaoLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#6366F1",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  explicacaoText: { fontSize: 13, color: "#4B5563", lineHeight: 19 },

  semItens: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 14,
  },

  // Modal de curso
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  modalItemActive: { backgroundColor: "#EEF2FF" },
  modalItemLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  modalItemLabelActive: { color: "#6366F1", fontWeight: "700" },
});
