
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

    profissional_id: number;
    servico_id: number;
}

interface RespostaAPI {
    sucesso: boolean;
    mensagem?: string;
    erro?: string;
    dados?: Agendamento;
}


interface HorarioDisponivel {
    inicio: string;
    fim: string;
    hora_inicio: string;
    hora_fim: string;
}

interface RespostaDisponibilidade {
    status: boolean;
    dados: HorarioDisponivel[];
    msg?: string;
}


export default function Mgendamento() {

    const { token } = useParams<{ token: string }>();

    const [agendamento, setAgendamento] =
        useState<Agendamento | null>(null);

    const [carregando, setCarregando] = useState(true);
    const [cancelando , setCancelando] = useState(false);
    const [mensagem, setMensagem] = useState("")

    const [mostrarReagendamento, setMostrarReagendamento] = useState(false);

    const [dataNova, setDataNova] = useState("");

    const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);

    const [horarioSelecionado, setHorarioSelecionado] =
        useState<HorarioDisponivel | null>(null);

    const [carregandoHorarios, setCarregandoHorarios] = useState(false);

    const [reagendando, setReagendando] = useState(false);

    const [erroReagendamento, setErroReagendamento] = useState("");


    console.warn('DADOS DO AGEDAMENTO ' ,agendamento);
    const [erro, setErro] = useState("");

    useEffect(() => {

        if (!token) {
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

    useEffect(() => {

    if (!mostrarReagendamento || !dataNova || !agendamento) {
        return;
    }

    const consultarHorarios = async () => {

        try {

            setCarregandoHorarios(true);
            setErroReagendamento("");
            setHorarios([]);
            setHorarioSelecionado(null);

            const parametros = new URLSearchParams({
                profissional_id: String(agendamento.profissional_id),
                servico_id: String(agendamento.servico_id),
                data: dataNova
            });

            const resposta = await fetch(
                `http://localhost:9890/api/disponibilidade?${parametros.toString()}`
            );

            const resultado: RespostaDisponibilidade =
                await resposta.json();

            if (!resposta.ok || !resultado.status) {
                setErroReagendamento(
                    resultado.msg || "Não foi possível consultar os horários."
                );
                return;
            }

            setHorarios(resultado.dados || []);

        } catch (error) {

            setErroReagendamento("Erro ao consultar horários disponíveis.");

        } finally {

            setCarregandoHorarios(false);
        }
    };

    consultarHorarios();

}, [mostrarReagendamento, dataNova, agendamento]);

const confirmarReagendamento = async () => {

    if (!token || !horarioSelecionado) {
        return;
    }

    if (!window.confirm("Deseja confirmar o novo horário?")) {
        return;
    }

    try {

        setReagendando(true);
        setErroReagendamento("");
        setMensagem("");

        const resposta = await fetch(
            "http://localhost:9890/api/agendamentos/reagendar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token,
                    novo_inicio: horarioSelecionado.inicio
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {

            setErroReagendamento(
                resultado.erro || "Não foi possível reagendar."
            );

            return;
        }

        setAgendamento(prev => {

            if (!prev) return null;

            return {
                ...prev,
                inicio: horarioSelecionado.inicio,
                fim: horarioSelecionado.fim
            };
        });

        setMostrarReagendamento(false);
        setHorarios([]);
        setHorarioSelecionado(null);

        setMensagem("Agendamento reagendado com sucesso!");

    } catch (error) {

        setErroReagendamento("Erro ao comunicar com o servidor.");

    } finally {

        setReagendando(false);
    }
};

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


    const cancelarAgendamento = async () => {

    if (!token || !agendamento) {
        return;
    }

    const confirmar = window.confirm(
        "Deseja realmente cancelar este agendamento?"
    );

    if (!confirmar) {
        return;
    }

    try {

        setCancelando(true);
        setMensagem("");
        setErro("");

        const resposta = await fetch(
            "http://localhost:9890/api/agendamentos/cancelar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            setErro(
                resultado.erro || "Não foi possível cancelar o agendamento."
            );
            return;
        }

        setAgendamento(prev => {
            if (!prev) return null;

            return {
                ...prev,
                status: "cancelado"
            };
        });

        setMensagem("Agendamento cancelado com sucesso!");

    } catch (error) {

        setErro("Erro ao comunicar com o servidor.");

    } finally {

        setCancelando(false);
    }
};

    if (!token) {
        return (
            <div className="meu-agendamento-container">
                <div className="meu-agendamento-card">
                    <h2>Agendamento não encontrado</h2>
                    <p>Link de acesso inválido.</p>
                </div>
            </div>
        );
    }

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
                {["pendente", "confirmado"].includes(
                            agendamento.status.toLowerCase()
                        ) && (

                            <div className="acoes-agendamento">

                                <button
                                    type="button"
                                    className="btn-cancelar-agendamento"
                                    onClick={cancelarAgendamento}
                                    disabled={cancelando}
                                >
                                    {cancelando
                                        ? "Cancelando..."
                                        : "Cancelar agendamento"}
                                </button>
                                <br></br>
                               <button
                                    type="button"
                                    className="btn-reagendar-agendamento"
                                    onClick={() => {
                                        setMostrarReagendamento(!mostrarReagendamento);
                                        setErroReagendamento("");
                                        setDataNova("");
                                        setHorarios([]);
                                        setHorarioSelecionado(null);
                                    }}
                                >
                                    Reagendar
                                </button>

                            </div>

                        )}
                        
                        {mostrarReagendamento && (

                        <div className="reagendamento-container">

                            <h2>Escolha uma nova data</h2>

                            <input
                                type="date"
                                value={dataNova}
                                min={new Date().toLocaleDateString("en-CA")}
                                onChange={e => setDataNova(e.target.value)}
                            />

                            {carregandoHorarios && (
                                <p>Consultando horários disponíveis...</p>
                            )}

                            {!carregandoHorarios && horarios.length > 0 && (

                                <div className="lista-horarios">

                                    <h3>Horários disponíveis</h3>

                                    {horarios.map((horario, index) => (

                                        <button
                                            key={index}
                                            type="button"
                                             className={
                                                    horarioSelecionado?.inicio === horario.inicio
                                                        ? "btn-horario horario-selecionado"
                                                        : "btn-horario"
                                                }
                                            onClick={() => setHorarioSelecionado(horario)}
                                        >
                                            {horario.hora_inicio} até {horario.hora_fim}
                                        </button>

                                    ))}

                                </div>
                            )}

                        {!carregandoHorarios && dataNova && horarios.length === 0 && !erroReagendamento && (
                            <p>Não existem horários disponíveis para esta data.</p>
                        )}

                        {erroReagendamento && (
                            <p className="mensagem-erro">
                                {erroReagendamento}
                            </p>
                        )}

                        {horarioSelecionado && (

                            <button
                                type="button"
                                onClick={confirmarReagendamento}
                                disabled={reagendando}
                            >
                                {reagendando
                                    ? "Reagendando..."
                                    : "Confirmar novo horário"}
                            </button>

                        )}

                    </div>
                )}

                        {mensagem && (
                            <p className="mensagem-sucesso">
                                {mensagem}
                            </p>
                        )}

                        {erro && (
                            <p className="mensagem-erro">
                                {erro}
                            </p>
                        )}

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
