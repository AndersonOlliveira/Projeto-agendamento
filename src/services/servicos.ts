import type { ServicosResponse } from "../type/servicos";
import { apiGet } from "./api";
// const API_URL = import.meta.env.VITE_API_URL;


export function l_servicos(): Promise<ServicosResponse> {
    return apiGet<ServicosResponse>(
        "/list_services"
    );
}