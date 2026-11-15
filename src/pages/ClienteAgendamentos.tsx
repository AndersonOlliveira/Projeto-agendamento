
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/MeuAgendamento.css";

interface Agendamento {
    id: number;
    inicio: string;
    fim: string;
    preco: string;
    status: string;
    forma_pagamento: string;
    status_pagamento: string;
    cliente_nome: string;
    cliente_email: string;
    cliente_telefone: string;
    servico_nome: string;
    duracao_minutos: number;
    profissional_nome: string;
}

interface RespostaAPI {
    sucesso: boolean;
    mensagem?: string;
    erro?: string;
    dados?: Agendamento;
}

export default function Mgendamento() {

    const { token } = useParams<{ token: string }>();

    const [agendamento, setAgendamento] =
        useState<Agendamento | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {

        if (!token) {
            setErro("Link de acesso inválido.");
            setCarregando(false);
            return;
        }

        const consultarAgendamento = async () => {

            try {

                const resposta = await fetch(
                    `http://localhost:9890/api/meu-agendamento/${encodeURIComponent(token)}`
                );

                const resultado: RespostaAPI = await resposta.json();

                if (!resposta.ok || !resultado.sucesso || !resultado.dados) {
                    setErro(
                        resultado.erro || "Não foi possível localizar seu agendamento."
                    );
                    return;
                }

                setAgendamento(resultado.dados);

            } catch (error) {

                setErro("Erro ao consultar seu agendamento.");

            } finally {

                setCarregando(false);
            }
        };

        consultarAgendamento();

    }, [token]);

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatarHora = (data: string) => {
        return new Date(data).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatarPreco = (preco: string) => {
        return Number(preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };

    if (carregando) {
        return (
            <div className="meu-agendamento-container">
                <div className="meu-agendamento-card">
                    <p>Consultando seu agendamento...</p>
                </div>
            </div>
        );
    }

    if (erro || !agendamento) {
        return (
            <div className="meu-agendamento-container">
                <div className="meu-agendamento-card">
                    <h2>Agendamento não encontrado</h2>
                    <p>{erro || "Link inválido ou expirado."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="meu-agendamento-container">

            <div className="meu-agendamento-card">

                <h1>Meu Agendamento</h1>

                <p className="agendamento-sucesso">
                    Seu agendamento foi localizado!
                </p>

                <div className="agendamento-info">

                    <div>
                        <span>Serviço</span>
                        <strong>{agendamento.servico_nome}</strong>
                    </div>

                    <div>
                        <span>Profissional</span>
                        <strong>{agendamento.profissional_nome}</strong>
                    </div>

                    <div>
                        <span>Data</span>
                        <strong>{formatarData(agendamento.inicio)}</strong>
                    </div>

                    <div>
                        <span>Horário</span>
                        <strong>
                            {formatarHora(agendamento.inicio)}
                            {" até "}
                            {formatarHora(agendamento.fim)}
                        </strong>
                    </div>

                    <div>
                        <span>Valor</span>
                        <strong>{formatarPreco(agendamento.preco)}</strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>{agendamento.status}</strong>
                    </div>

                    <div>
                        <span>Pagamento</span>
                        <strong>{agendamento.status_pagamento}</strong>
                    </div>

                </div>

                <hr />

                <h2>Dados do cliente</h2>

                <div className="agendamento-info">

                    <div>
                        <span>Nome</span>
                        <strong>{agendamento.cliente_nome}</strong>
                    </div>

                    <div>
                        <span>E-mail</span>
                        <strong>{agendamento.cliente_email}</strong>
                    </div>

                    <div>
                        <span>Telefone</span>
                        <strong>{agendamento.cliente_telefone}</strong>
                    </div>

                </div>

            </div>

        </div>
    );
}
