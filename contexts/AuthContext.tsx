import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "../lib/api";

export interface AuthUser {
  token: string;
  usuarioId: number;
  alunoId: number;
  nome: string;
  email: string;
}

interface AuthContextData {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão salva no AsyncStorage ao iniciar o app
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem("@token");
        const savedUser = await AsyncStorage.getItem("@user");

        if (savedToken && savedUser) {
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // sessão inválida — ignora
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    // Passo 1 — autenticação
    const { data } = await api.post<{ token: string }>("/api/auth/login", {
      email,
      senha,
    });
    const { token } = data;

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Valida role — só ALUNO pode usar o app mobile
    const payload = decodeJwtPayload(token);
    const roles: string[] = payload.roles ?? [];
    const role = roles[0] ?? "";

    if (!role.includes("ALUNO")) {
      throw new Error("Acesso restrito ao painel do aluno.");
    }

    // Passo 2 — busca dados do usuário
    const { data: usuarioData } = await api.get<{
      id: number;
      nome: string;
      email: string;
    }>("/usuarios/me");

    // Passo 3 — busca dados do aluno
    // O endpoint GET /alunos/me retorna AlunoDTO:
    //   { nome, email, matricula, cursoId, usuarioId }
    // O "usuarioId" do AlunoDTO é o ID real na tabela tb_alunos (PK = usuario_id).
    // É esse valor que o SubmissaoRequestDTO espera no campo "alunoId".
    const { data: alunoData } = await api.get<{
      usuarioId?: number;
      id?: number;
    }>("/alunos/me");

    const authUser: AuthUser = {
      token,
      usuarioId: usuarioData.id,
      // Preferencia: usuarioId do AlunoDTO; fallback: id genérico
      alunoId: alunoData.usuarioId ?? alunoData.id ?? usuarioData.id,
      nome: usuarioData.nome,
      email: usuarioData.email,
    };

    await AsyncStorage.setItem("@token", token);
    await AsyncStorage.setItem("@user", JSON.stringify(authUser));

    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
