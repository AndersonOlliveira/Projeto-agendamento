import type { DisponibilidadeResponse } from "../type/disponibilidades";
import { apiGet } from "./api";

export function l_disponibilidade(
    profissionalId: number,
    servicoId: number,
    data: string
): Promise<DisponibilidadeResponse> {

    return apiGet<DisponibilidadeResponse>(
        "/disponibilidade",
        {
            profissional_id: profissionalId,
            servico_id: servicoId,
            data: data
        }
    );
}