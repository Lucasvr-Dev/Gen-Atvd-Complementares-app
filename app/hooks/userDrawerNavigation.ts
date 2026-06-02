import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { MenuItemKey } from "../componentes/SideDrawer";

const ROUTE_MAP: Record<MenuItemKey, string> = {
  dashboard: "/Telas/Dashboard",
  submissao: "/Telas/NovaSubmissao",
  historico: "/Telas/HistoricoSubmissoes",
  regras: "/Telas/RegrasCurso",
  notificacoes: "/Telas/Notificacoes",
};

interface UseDrawerNavigationResult {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  handleSelect: (item: MenuItemKey) => void;
  handleLogout: () => void;
}

export function useDrawerNavigation(
  currentItem: MenuItemKey,
): UseDrawerNavigationResult {
  const router = useRouter();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleSelect = useCallback(
    (item: MenuItemKey) => {
      if (item === currentItem) return;
      const route = ROUTE_MAP[item];
      router.replace(route as never);
    },
    [router, currentItem],
  );

  const handleLogout = useCallback(async () => {
    await logout(); // limpa AsyncStorage + seta user para null
    router.replace("/Telas/Login");
  }, [router, logout]);

  return {
    drawerOpen,
    openDrawer,
    closeDrawer,
    handleSelect,
    handleLogout,
  };
}
