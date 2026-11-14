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



export interface DadosAgendamento {
    servico_id: number;
    servicoNome: string;
    profissional_id: number;
    profissionalNome: string;
    cliente: string;
    telefone: string;
    data: string;
    email: string;
    inicio:string;
    horario: {
        inicio: string;
        fim: string;
        hora_inicio: string;
        hora_fim: string;
    };
}
