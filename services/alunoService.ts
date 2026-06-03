import { api } from "../lib/api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CursoAluno {
  id: number;
  nome: string;
  codCurso: string;
  cargaHorariaMinima: number;
}

export interface Submissao {
  id: number;
  titulo: string;
  descricao: string;
  horas: number;
  status: "PENDENTE" | "APROVADO" | "REPROVADO";
  dataSubmissao: string;
  feedback?: string;
  curso: { id: number; nome: string };
}

export interface RegraAtividade {
  id: number;
  area: string;
  limiteHoras: number;
  exigeComprovante: boolean;
  itens: {
    id: number;
    descricao: string;
    aproveitamento: string;
    explicacao?: string;
  }[];
}

export interface ProgressoCurso {
  horasAprovadas: number;
  horasPendentes: number;
  horasReprovadas: number;
  metaTotal: number;
}

// ─── Cursos do aluno ──────────────────────────────────────────────────────────

export async function getCursosAluno(): Promise<CursoAluno[]> {
  const { data } = await api.get<CursoAluno[]>("/alunos/me/cursos");
  return data;
}

// ─── Submissões ───────────────────────────────────────────────────────────────

export async function getSubmissoesAluno(): Promise<Submissao[]> {
  const { data } = await api.get<Submissao[]>("/submissoes/minhas");
  return data;
}

export interface CriarSubmissaoDTO {
  titulo: string;
  descricao?: string;
  horas: number;
  cursoId: number;
  arquivoBase64: string;
  nomeArquivo: string;
}

export async function criarSubmissao(
  dto: CriarSubmissaoDTO,
): Promise<Submissao> {
  const payload = {
    titulo: dto.titulo,
    descricao: dto.descricao ?? "",
    horas: dto.horas,
    cursoId: dto.cursoId,
    certificados: [
      {
        nomeArquivo: dto.nomeArquivo,
        urlArquivo: dto.arquivoBase64,
      },
    ],
  };
  const { data } = await api.post<Submissao>("/submissoes", payload);
  return data;
}

// ─── Regras de atividade por curso ────────────────────────────────────────────

export async function getRegrasCurso(
  cursoId: number,
): Promise<RegraAtividade[]> {
  const { data } = await api.get<RegraAtividade[]>(
    `/regras-atividade/curso/${cursoId}`,
  );
  return data;
}

// ─── Progresso do aluno num curso ─────────────────────────────────────────────

export async function getProgressoCurso(
  cursoId: number,
): Promise<ProgressoCurso> {
  const submissoes = await getSubmissoesAluno();
  const dosCurso = submissoes.filter((s) => s.curso?.id === cursoId);

  const horasAprovadas = dosCurso
    .filter((s) => s.status === "APROVADO")
    .reduce((acc, s) => acc + s.horas, 0);

  const horasPendentes = dosCurso
    .filter((s) => s.status === "PENDENTE")
    .reduce((acc, s) => acc + s.horas, 0);

  const horasReprovadas = dosCurso
    .filter((s) => s.status === "REPROVADO")
    .reduce((acc, s) => acc + s.horas, 0);

  return { horasAprovadas, horasPendentes, horasReprovadas, metaTotal: 0 };
}
