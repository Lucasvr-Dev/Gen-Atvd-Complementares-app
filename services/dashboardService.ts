import { api } from "../lib/api";
import { CursoAluno } from "./alunoService";

export interface DashboardStats {
  horasAprovadas: number;
  horasPendentes: number;
  horasRejeitadas: number;
  metaTotal: number;
}

export interface SubmissaoDashboard {
  id: number;
  titulo: string;
  area: string;
  horas: number;
  dataSubmissao: string;
  status: "PENDENTE" | "APROVADA" | "REPROVADA";
  cursoId: number;
}

export interface ProgressoArea {
  label: string;
  value: number;
}

export interface DashboardData {
  cursos: CursoAluno[];
  stats: DashboardStats;
  submissoesRecentes: SubmissaoDashboard[];
  progressoPorArea: ProgressoArea[];
}

export async function getDashboardData(
  alunoId: number,
): Promise<DashboardData> {
  const [cursosRes, submissoesRes] = await Promise.all([
    api.get<CursoAluno[]>("/alunos/me/cursos"),
    api.get<any[]>("/submissoes"),
  ]);

  const cursos = cursosRes.data;

  // Filtra apenas as submissões do aluno logado
  const minhasSubmissoes = submissoesRes.data.filter(
    (s) => s.alunoId === alunoId,
  );

  // Calcula stats
  const horasAprovadas = minhasSubmissoes
    .filter((s) => s.status === "APROVADA")
    .reduce((acc: number, s: any) => acc + s.horas, 0);

  const horasPendentes = minhasSubmissoes
    .filter((s) => s.status === "PENDENTE")
    .reduce((acc: number, s: any) => acc + s.horas, 0);

  const horasRejeitadas = minhasSubmissoes
    .filter((s) => s.status === "REPROVADA")
    .reduce((acc: number, s: any) => acc + s.horas, 0);

  // Meta total vem da soma das cargas horárias dos cursos
  const metaTotal = cursos.reduce((acc, c) => acc + c.cargaHorariaMinima, 0);

  // Progresso por área baseado nas submissões aprovadas
  const areaMap: Record<string, number> = {};
  minhasSubmissoes
    .filter((s) => s.status === "APROVADA")
    .forEach((s: any) => {
      const area = s.cursoNome ?? "Outros";
      areaMap[area] = (areaMap[area] ?? 0) + s.horas;
    });

  const progressoPorArea: ProgressoArea[] = Object.entries(areaMap).map(
    ([label, value]) => ({ label, value }),
  );

  // Submissões recentes (últimas 6, ordenadas por data)
  const submissoesRecentes: SubmissaoDashboard[] = minhasSubmissoes
    .sort(
      (a: any, b: any) =>
        new Date(b.dataSubmissao).getTime() -
        new Date(a.dataSubmissao).getTime(),
    )
    .slice(0, 6)
    .map((s: any) => ({
      id: s.id,
      titulo: s.titulo,
      area: s.cursoNome ?? "—",
      horas: s.horas,
      dataSubmissao: new Date(s.dataSubmissao).toLocaleDateString("pt-BR"),
      status: s.status,
      cursoId: s.cursoId,
    }));

  return {
    cursos,
    stats: { horasAprovadas, horasPendentes, horasRejeitadas, metaTotal },
    submissoesRecentes,
    progressoPorArea,
  };
}
