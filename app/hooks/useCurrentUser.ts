// app/hooks/useCurrentUser.ts
//
// Substitui o "currentUser" hardcoded em todas as telas.
// Usa o AuthContext que já está implementado.
//
// Uso:
//   const currentUser = useCurrentUser();
//   <SideDrawer user={currentUser} ... />

import { useAuth } from "../../contexts/AuthContext";

export function useCurrentUser() {
  const { user } = useAuth();

  return {
    name: user?.nome ?? "Usuário",
    email: user?.email ?? "",
  };
}
