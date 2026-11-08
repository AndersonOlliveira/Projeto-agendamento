export interface Servico {
    id: number;
    nome: string;
    descricao: string;
    duracao_minutos: number;
    preco: string;
}

export interface ServicosResponse {
    status: number;
    dados: Servico[];
}