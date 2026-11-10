export interface Profissionais {
    id: number;
    nome: string;
    status: boolean;

}

export interface ProfissionaisHorariosResponse {
    status: number;
    dados: Profissionais[];
}