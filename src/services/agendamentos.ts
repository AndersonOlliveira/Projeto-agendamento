
import { apiPost} from "./api";
import type { DadosAgendamento } from "../type/agendamento";
// import type {
//   CriarAgendamentoDTO,
//   RespostaAgendamento,
// } from "../type/agendamento";

// export async function criarAgendamento(
//   dados: CriarAgendamentoDTO
// ): Promise<RespostaAgendamento> {
//   return apiPost<RespostaAgendamento>(
//     "/bookings",
//     dados
//   );
// }


// export interface DadosAgendamento {
//   servico_id: number;
//   horario: string;
//   nome: string;
//   telefone: string;
//   email: string;
// }
export interface RespostaAgendamento {
  success: boolean;
  message: string;
  booking_id?: number;
}

export function criarAgendamento(
  dados: DadosAgendamento
): Promise<RespostaAgendamento> {
  return apiPost<RespostaAgendamento>(
    "/agendamentos",
    dados
  );
}