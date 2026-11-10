import type { ProfissionaisHorariosResponse } from "../type/profissionais";
import { apiGet } from "./api";
// const API_URL = import.meta.env.VITE_API_URL;



export function l_proff(
    servicoId: number
): Promise<ProfissionaisHorariosResponse> {

    return apiGet<ProfissionaisHorariosResponse>(
        "/proficionais",
        { servico_id: servicoId }
    );
}
