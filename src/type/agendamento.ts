export interface DadosCliente {
  nome: string;
  telefone: string;
  email: string;
}

export interface CriarAgendamentoDTO {
  servico_id: number;
  profissional_id: number;
  data: string;
  horario: string;
  cliente: DadosCliente;
}

export interface RespostaAgendamento {
  success: boolean;
  message: string;
  booking_id?: number;
}