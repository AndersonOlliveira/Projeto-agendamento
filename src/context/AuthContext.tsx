export interface AgendamentoSelecionado {
  servicoId: number;
  profissionalId: number;
  data: string;
  horario: string;
}

export interface DadosCliente {
  nome: string;
  telefone: string;
  email?: string;
}