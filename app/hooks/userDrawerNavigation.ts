import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { MenuItemKey } from "../componentes/SideDrawer";

const ROUTE_MAP: Record<MenuItemKey, string> = {
  dashboard: "/Telas/Dashboard",
  submissao: "/Telas/NovaSubmissao",
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

  const handleLogout = useCallback(() => {
    // Limpar token/sessão aqui (AsyncStorage, contexto, etc.)
    router.replace("/Telas/Login");
  }, [router]);

  return {
    drawerOpen,
    openDrawer,
    closeDrawer,
    handleSelect,
    handleLogout,
  };
}
