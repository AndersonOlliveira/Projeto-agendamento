export interface HorarioDisponivel {
    horario: string;
}


export interface DisponibilidadeResponse {
    status: boolean;
    dados: HorarioDisponivel[];
}
