
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { apiGet, apiPatch } from "../../services/api";

interface Agendamento {
    id: number;
    servico_id: number;
    profissional_id: number;
    inicio: string;
    fim: string;
    preco: number | string;
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

interface Servico {
    id: number;
    nome: string;
    descricao: string;
    duracao_minutos: number;
    preco: number | string;
}

interface Profissional {
    id: number;
    nome: string;
    ativo: boolean;
}

interface RespostaServicos {
    status: boolean | number;
    mensagem?: string;
    dados: Servico[];
}

interface RespostaProfissionais {
    status: boolean | number;
    mensagem?: string;
    dados: Profissional[];
}
interface HorarioDisponivel {
    inicio: string;
    fim: string;
    hora_inicio: string;
    hora_fim: string;
}

interface RespostaDisponibilidade {
    status: boolean | number;
    mensagem?: string;
    msg?: string;
    dados: HorarioDisponivel[];
    duracao_minutos?: number;
    preco?: number | string;
}
interface RespostaAgendamentos {
    status: number | boolean;
    mensagem?: string;
    agendamentos: Agendamento[];
}

const ALTURA_MINUTO = 1.5;
const ALTURA_CABECALHO = 65;
const ALTURA_HORA = 60 * ALTURA_MINUTO;

function calcularLayoutAgendamentos(agendamentos: Agendamento[]) {
    const ordenados = [...agendamentos].sort((a, b) => {
        return new Date(a.inicio).getTime() - new Date(b.inicio).getTime();
    });

    const resultado: Record<number, { coluna: number; totalColunas: number }> = {};

    let grupo: Agendamento[] = [];
    let fimGrupo = 0;

    function processarGrupo() {
        if (grupo.length === 0) return;

        const finaisColunas: number[] = [];
        const distribuicao: { id: number; coluna: number }[] = [];

        grupo.forEach((agendamento) => {
            const inicio = new Date(agendamento.inicio).getTime();
            const fim = new Date(agendamento.fim).getTime();

            let coluna = finaisColunas.findIndex(
                (final) => final <= inicio
            );

            if (coluna === -1) {
                coluna = finaisColunas.length;
                finaisColunas.push(fim);
            } else {
                finaisColunas[coluna] = fim;
            }

            distribuicao.push({
                id: agendamento.id,
                coluna
            });
        });

        const totalColunas = finaisColunas.length;

        distribuicao.forEach((item) => {
            resultado[item.id] = {
                coluna: item.coluna,
                totalColunas
            };
        });

        grupo = [];
        fimGrupo = 0;
    }

    ordenados.forEach((agendamento) => {
        const inicio = new Date(agendamento.inicio).getTime();
        const fim = new Date(agendamento.fim).getTime();

        if (grupo.length > 0 && inicio >= fimGrupo) {
            processarGrupo();
        }

        grupo.push(agendamento);
        fimGrupo = Math.max(fimGrupo, fim);
    });

    processarGrupo();

    return resultado;
}

export default function AdminAgendamentos() {

    const [reagendando, setReagendando] = useState(false);

    const [servicos, setServicos] = useState<Servico[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);

    const [servicoSelecionado, setServicoSelecionado] = useState("");
    const [profissionalSelecionado, setProfissionalSelecionado] = useState("");

    const [dataReagendamento, setDataReagendamento] = useState("");
    const [horarioReagendamento, setHorarioReagendamento] = useState("");

    const [erroReagendamento, setErroReagendamento] = useState("");
    const [sucessoReagendamento, setSucessoReagendamento] = useState("");

    const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);

    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [semanaAtual, setSemanaAtual] = useState(new Date());

    const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

    const [cancelando, setCancelando] = useState(false);
    const [erroCancelamento, setErroCancelamento] = useState("");
    const [sucessoCancelamento, setSucessoCancelamento] = useState("");
    async function carregarAgendamentos() {
        try {
            setCarregando(true);
            setErro("");

            const resultado = await apiGet<RespostaAgendamentos>(
                "/admin/agendamentos"
            );

            if (resultado.status !== 1) {
                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível listar os agendamentos."
                );
            }

            setAgendamentos(resultado.agendamentos || []);

        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar agendamentos."
            );
        } finally {
            setCarregando(false);
        }
    }
    async function carregarServicos() {
    try {
        const resultado = await apiGet<RespostaServicos>(
            "/list_services"
        );

        if (resultado.status !== 1 && resultado.status !== true) {
            throw new Error(
                resultado.mensagem || "Não foi possível carregar os serviços."
            );
        }

        setServicos(resultado.dados || []);

    } catch (error) {
        setErroReagendamento(
            error instanceof Error
                ? error.message
                : "Erro ao carregar serviços."
        );
    }
}
async function carregarProfissionais(
    servicoId: string,
    profissionalIdInicial: string = ""
) {
    // try {
    //     setProfissionais([]);
    //     setProfissionalSelecionado("");

    //     if (!servicoId) {
    //         return;
    //     }

    //     const resultado = await apiGet<RespostaProfissionais>(
    //         `/proficionais?servico_id=${servicoId}`
    //     );

    //     if (resultado.status !== 1 && resultado.status !== true) {
    //         throw new Error(
    //             resultado.mensagem ||
    //             "Não foi possível carregar os profissionais."
    //         );
    //     }

    //   setProfissionais(resultado.dados || []);

    //     if (
    //         profissionalIdInicial &&
    //         resultado.dados.some(
    //             (profissional) =>
    //                 String(profissional.id) === profissionalIdInicial
    //         )
    //     ) {
    //         setProfissionalSelecionado(profissionalIdInicial);
    //     }

    // } catch (error) {
    //     setErroReagendamento(
    //         error instanceof Error
    //             ? error.message
    //             : "Erro ao carregar profissionais."
    //     );
    // }
}

    async function cancelarAgendamento() {

    if (!agendamentoSelecionado) {
        return;
    }

    const confirmar = window.confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) {
        return;
    }

    try {

        setCancelando(true);
        setErroCancelamento("");
        setSucessoCancelamento("");

        const resultado = await apiPatch<{
            status: number;
            mensagem: string;
            agendamento: {
                id: number;
                status: string;
            };
        }>(
            `/admin/agendamentos/${agendamentoSelecionado.id}/cancelar`,
            {}
        );

        if (resultado.status !== 1) {
            throw new Error(
                resultado.mensagem || "Não foi possível cancelar."
            );
        }

        // Atualizar o agendamento na lista do calendário.
        setAgendamentos((atual) =>
            atual.map((item) =>
                item.id === agendamentoSelecionado.id
                    ? { ...item, status: "cancelado" }
                    : item
            )
        );

        // Atualizar também os dados exibidos no modal.
        setAgendamentoSelecionado((atual) =>
            atual
                ? { ...atual, status: "cancelado" }
                : null
        );

        setSucessoCancelamento(resultado.mensagem);

    } catch (error) {

        setErroCancelamento(
            error instanceof Error
                ? error.message
                : "Erro ao cancelar agendamento."
        );

    } finally {

        setCancelando(false);


    }
}

async function carregarHorariosDisponiveis() {
    // if (
    //     !agendamentoSelecionado ||
    //     !servicoSelecionado ||
    //     !profissionalSelecionado ||
    //     !dataReagendamento
    // ) {
    //     setHorariosDisponiveis([]);
    //     return;
    // }

    // try {
    //     setHorariosDisponiveis([]);
    //     setErroReagendamento("");

    //     const resultado = await apiGet<RespostaDisponibilidade>(
    //         `/disponibilidade?profissional_id=${profissionalSelecionado}` +
    //         `&servico_id=${servicoSelecionado}` +
    //         `&data=${dataReagendamento}` +
    //         `&agendamento_id=${agendamentoSelecionado.id}`
    //     );

    //     if (resultado.status !== 1 && resultado.status !== true) {
    //         throw new Error(
    //             resultado.mensagem ||
    //             resultado.msg ||
    //             "Não foi possível carregar os horários disponíveis."
    //         );
    //     }

    //     setHorariosDisponiveis(resultado.dados || []);

    // } catch (error) {
    //     setErroReagendamento(
    //         error instanceof Error
    //             ? error.message
    //             : "Erro ao carregar horários disponíveis."
    //     );
    // }
}

   useEffect(() => {
    if (!agendamentoSelecionado) {
        return;
    }

    setErroReagendamento("");
    setSucessoReagendamento("");

    const servicoId = String(agendamentoSelecionado.servico_id);
    const profissionalId = String(agendamentoSelecionado.profissional_id);

    setServicoSelecionado(servicoId);
    setProfissionalSelecionado(profissionalId);

    void carregarServicos();

    void carregarProfissionais(
        servicoId,
        profissionalId
    );

    const inicio = dataDoAgendamento(agendamentoSelecionado.inicio);

    const ano = inicio.getFullYear();
    const mes = String(inicio.getMonth() + 1).padStart(2, "0");
    const dia = String(inicio.getDate()).padStart(2, "0");

    setDataReagendamento(`${ano}-${mes}-${dia}`);

    setHorarioReagendamento(
        `${String(inicio.getHours()).padStart(2, "0")}:${String(
            inicio.getMinutes()
        ).padStart(2, "0")}`
    );

}, [agendamentoSelecionado]);

        useEffect(() => {
            void carregarHorariosDisponiveis();
        }, [
            agendamentoSelecionado,
            servicoSelecionado,
            profissionalSelecionado,
            dataReagendamento
]);
//     const inicio = dataDoAgendamento(agendamentoSelecionado.inicio);

//     const ano = inicio.getFullYear();
//     const mes = String(inicio.getMonth() + 1).padStart(2, "0");
//     const dia = String(inicio.getDate()).padStart(2, "0");

//     setDataReagendamento(`${ano}-${mes}-${dia}`);

//     setHorarioReagendamento(
//         `${String(inicio.getHours()).padStart(2, "0")}:${String(
//             inicio.getMinutes()
//         ).padStart(2, "0")}`
//     );

// }, [agendamentoSelecionado]);

    function inicioDaSemana(data: Date) {
        const inicio = new Date(data);
        inicio.setHours(0, 0, 0, 0);

        const dia = inicio.getDay();
        const diferenca = dia === 0 ? -6 : 1 - dia;

        inicio.setDate(inicio.getDate() + diferenca);

        return inicio;
    }

    function adicionarDias(data: Date, quantidade: number) {
        const novaData = new Date(data);
        novaData.setDate(novaData.getDate() + quantidade);
        return novaData;
    }

    function chaveData(data: Date) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }


    function dataDoAgendamento(valor: string) {
        return new Date(valor);
    }

    function formatarData(data: Date) {
        return data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit"
        });
    }

    function formatarDiaSemana(data: Date) {
        return data.toLocaleDateString("pt-BR", {
            weekday: "short"
        });
    }

    function formatarHorario(data: Date) {
        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatarValor(valor: number | string) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    const diasSemana = useMemo(() => {
        const inicio = inicioDaSemana(semanaAtual);

        return Array.from({ length: 7 }, (_, index) =>
            adicionarDias(inicio, index)
        );
    }, [semanaAtual]);

    const agendamentosSemana = useMemo(() => {
        
        const chaves = diasSemana.map(chaveData);


        return agendamentos.filter((agendamento) => {
            const data = dataDoAgendamento(agendamento.inicio);

            return chaves.includes(chaveData(data));
        });
    }, [agendamentos, diasSemana]);

    const layoutAgendamentos = useMemo(() => {
    const resultado: Record<
        number,
        { coluna: number; totalColunas: number }
    > = {};

    diasSemana.forEach((dia) => {
        const agendamentosDia = agendamentos.filter((agendamento) =>
            chaveData(dataDoAgendamento(agendamento.inicio)) ===
            chaveData(dia)
        );

        Object.assign(
            resultado,
            calcularLayoutAgendamentos(agendamentosDia)
        );
    });

    return resultado;
}, [agendamentos, diasSemana]);

    const faixaHorarios = useMemo(() => {
        if (agendamentosSemana.length === 0) {
            return { inicio: 8, fim: 20 };
        }

        const minutosInicio = agendamentosSemana.map((agendamento) => {
            const data = dataDoAgendamento(agendamento.inicio);
            return data.getHours() * 60 + data.getMinutes();
        });

        const minutosFim = agendamentosSemana.map((agendamento) => {
            const data = dataDoAgendamento(agendamento.fim);
            return data.getHours() * 60 + data.getMinutes();
        });

        const menor = Math.min(...minutosInicio);
        const maior = Math.max(...minutosFim);

        const inicio = Math.max(0, Math.floor(menor / 60) - 1);
        const fim = Math.min(24, Math.ceil(maior / 60) + 1);

        return {
            inicio,
            fim: Math.max(inicio + 1, fim)
        };
    }, [agendamentosSemana]);

    const quantidadeMinutos =
        (faixaHorarios.fim - faixaHorarios.inicio) * 60;

    const alturaCalendario =
        quantidadeMinutos * ALTURA_MINUTO;

    function mudarSemana(direcao: number) {
        setSemanaAtual((atual) =>
            adicionarDias(atual, direcao * 7)
        );
    }

    function corStatus(status: string) {
        const valor = status.toLowerCase();

        if (valor === "confirmado") {
            return {
                fundo: "#dbeafe",
                borda: "#2563eb",
                texto: "#1e40af"
            };
        }

        if (valor === "cancelado") {
            return {
                fundo: "#fee2e2",
                borda: "#dc2626",
                texto: "#991b1b"
            };
        }

        if (valor === "concluido" || valor === "concluído") {
            return {
                fundo: "#dcfce7",
                borda: "#16a34a",
                texto: "#166534"
            };
        }

        return {
            fundo: "#f3e8ff",
            borda: "#9333ea",
            texto: "#6b21a8"
        };
    }

    const tituloSemana =
        `${diasSemana[0].toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long"
        })} até ${diasSemana[6].toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })}`;

    return (
        <div style={estiloPagina}>

            <h1>Calendário de agendamentos</h1>

            <p>Visualização semanal da agenda BarberPro</p>

            <div style={estiloNavegacao}>
                <button
                    type="button"
                    onClick={() => mudarSemana(-1)}
                    style={estiloBotao}
                >
                    ‹ Anterior
                </button>

                <button
                    type="button"
                    onClick={() => setSemanaAtual(new Date())}
                    style={estiloBotao}
                >
                    Hoje
                </button>

                <button
                    type="button"
                    onClick={() => mudarSemana(1)}
                    style={estiloBotao}
                >
                    Próxima ›
                </button>

                <button
                    type="button"
                    onClick={() => void carregarAgendamentos()}
                    style={estiloBotao}
                    disabled={carregando}
                >
                    Atualizar
                </button>
            </div>

            <h3 style={estiloTituloSemana}>
                {tituloSemana}
            </h3>

            {carregando && <p>Carregando agendamentos...</p>}

            {erro && (
                <p style={{ color: "red" }}>{erro}</p>
            )}

            {!carregando && !erro && (
                <>
                    <p>
                        Agendamentos nesta semana: {agendamentosSemana.length}
                    </p>

                    <div style={estiloLegenda}>
                        <span style={estiloLegendaItem}>
                            <span style={{ ...estiloBolinha, background: "#2563eb" }} />
                            Confirmado
                        </span>

                        <span style={estiloLegendaItem}>
                            <span style={{ ...estiloBolinha, background: "#dc2626" }} />
                            Cancelado
                        </span>

                        <span style={estiloLegendaItem}>
                            <span style={{ ...estiloBolinha, background: "#16a34a" }} />
                            Concluído
                        </span>
                    </div>

                    <div style={estiloContainerCalendario}>

                        <div
                            style={{
                                ...estiloGrade,
                                gridTemplateColumns: "65px repeat(7, minmax(135px, 1fr))"
                            }}
                        >
                            <div style={estiloCabecalhoHora}>
                                Horário
                            </div>

                            {diasSemana.map((dia) => (
                                <div
                                    key={chaveData(dia)}
                                    style={estiloCabecalhoDia}
                                >
                                    <strong>
                                        {formatarDiaSemana(dia)}
                                    </strong>

                                    <span>{formatarData(dia)}</span>
                                </div>
                            ))}

                            <div
                                style={{
                                    position: "relative",
                                    height: alturaCalendario
                                }}
                            >
                                {Array.from(
                                    { length: quantidadeMinutos / 60 },
                                    (_, index) => {
                                        const hora = faixaHorarios.inicio + index;

                                        return (
                                            <div
                                                key={hora}
                                                style={{
                                                    ...estiloHora,
                                                    top: index * ALTURA_HORA
                                                }}
                                            >
                                                {String(hora).padStart(2, "0")}:00
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {diasSemana.map((dia) => {
                                const agendamentosDia =
                                    agendamentosSemana.filter((agendamento) =>
                                        chaveData(dataDoAgendamento(agendamento.inicio)) ===
                                        chaveData(dia)
                                    );

                                return (
                                    <div
                                        key={chaveData(dia)}
                                        style={{
                                            ...estiloColunaDia,
                                            height: alturaCalendario
                                        }}
                                    >
                                        {Array.from(
                                            { length: quantidadeMinutos / 30 },
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        ...estiloLinhaHorario,
                                                        top: index * 30 * ALTURA_MINUTO
                                                    }}
                                                />
                                            )
                                        )}

                                        {agendamentosDia.map((agendamento) => {
                                     

                                            const inicio = dataDoAgendamento(
                                                agendamento.inicio
                                            );

                                            const fim = dataDoAgendamento(
                                                agendamento.fim
                                            );

                                            const minutos =
                                                inicio.getHours() * 60 +
                                                inicio.getMinutes();

                                            const minutosFim =
                                                fim.getHours() * 60 +
                                                fim.getMinutes();

                                            const top =
                                                (minutos - faixaHorarios.inicio * 60) *
                                                ALTURA_MINUTO;

                                            const altura = Math.max(
                                                (minutosFim - minutos) * ALTURA_MINUTO,
                                                35
                                            );

                                            const cores = corStatus(
                                                agendamento.status
                                            );
                                            const layout = layoutAgendamentos[agendamento.id] || {
                                                coluna: 0,
                                                totalColunas: 1
                                            };

                                            const largura = 100 / layout.totalColunas;

                                            const posicaoEsquerda = layout.coluna * largura;

                                            return (
                                                <div
                                                    key={agendamento.id}
                                                      onClick={() => setAgendamentoSelecionado(agendamento)}
                                                    title={`${agendamento.cliente_nome} - ${agendamento.servico_nome}`}
                                                    style={{
                                                        ...estiloAgendamento,
                                                        top,
                                                        height: altura,
                                                        background: cores.fundo,
                                                        left: `calc(${posicaoEsquerda}% + 3px)`,
                                                        width: `calc(${largura}% - 6px)`,
                                                        right: "auto",
                                                        borderLeft: `4px solid ${cores.borda}`,
                                                        color: cores.texto,
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    
                                                    <strong>
                                                        {formatarHorario(inicio)} - {formatarHorario(fim)}
                                                    </strong>

                                                    <span>
                                                        {agendamento.cliente_nome}
                                                    </span>

                                                    <span>
                                                        {agendamento.servico_nome}
                                                    </span>

                                                    <span>
                                                        {agendamento.profissional_nome}
                                                    </span>

                                                    <small>
                                                        {agendamento.status}
                                                    </small>
                                                </div>
                                            );
                                        })}
                                        {agendamentoSelecionado && (
                                                    <div style={estiloFundoModal}>
                                                        <div style={estiloModal}>

                                                            <div style={estiloCabecalhoModal}>
                                                                <h2>Detalhes do agendamento</h2>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAgendamentoSelecionado(null)}
                                                                    style={estiloFechar}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>

                                                            <p><strong>Código:</strong> {agendamentoSelecionado.id}</p>

                                                            <p><strong>Cliente:</strong> {agendamentoSelecionado.cliente_nome}</p>

                                                            <p><strong>Telefone:</strong> {agendamentoSelecionado.cliente_telefone}</p>

                                                            <p><strong>E-mail:</strong> {agendamentoSelecionado.cliente_email}</p>

                                                            <hr />

                                                            <p><strong>Serviço:</strong> {agendamentoSelecionado.servico_nome}</p>

                                                            <p><strong>Profissional:</strong> {agendamentoSelecionado.profissional_nome}</p>

                                                            <p>
                                                                <strong>Data:</strong>{" "}
                                                                {formatarData(dataDoAgendamento(agendamentoSelecionado.inicio))}
                                                            </p>

                                                            <p>
                                                                <strong>Horário:</strong>{" "}
                                                                {formatarHorario(dataDoAgendamento(agendamentoSelecionado.inicio))}
                                                                {" até "}
                                                                {formatarHorario(dataDoAgendamento(agendamentoSelecionado.fim))}
                                                            </p>

                                                            <p><strong>Valor:</strong> {formatarValor(agendamentoSelecionado.preco)}</p>

                                                            <hr />

                                                            <p><strong>Status:</strong> {agendamentoSelecionado.status}</p>

                                                            <p><strong>Forma de pagamento:</strong> {agendamentoSelecionado.forma_pagamento}</p>

                                                            <p><strong>Status do pagamento:</strong> {agendamentoSelecionado.status_pagamento}</p>

                                                           {erroCancelamento && (
                                                                    <p style={{ color: "#dc2626" }}>
                                                                        {erroCancelamento}
                                                                    </p>
                                                                )}

                                                                {sucessoCancelamento && (
                                                                    <p style={{ color: "#16a34a" }}>
                                                                        {sucessoCancelamento}
                                                                    </p>
                                                                )}

                                                                <div style={estiloBotoesModal}>

                                                                    {(agendamentoSelecionado.status === "pendente" ||
                                                                    agendamentoSelecionado.status === "confirmado") && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void cancelarAgendamento()}
                                                                            disabled={cancelando}
                                                                            style={{
                                                                                ...estiloBotaoModal,
                                                                                background: "#dc2626",
                                                                                color: "#fff",
                                                                                border: "none",
                                                                                marginRight: "10px",
                                                                                opacity: cancelando ? 0.6 : 1
                                                                            }}
                                                                        >
                                                                            {cancelando ? "Cancelando..." : "Cancelar agendamento"}
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAgendamentoSelecionado(null)}
                                                                        style={estiloBotaoModal}
                                                                    >
                                                                        Fechar
                                                                    </button>

                                                                </div>

                                                        </div>
                                                    </div>
                                                )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const estiloPagina: CSSProperties = {
    padding: "30px",
    color: "#222"
};

const estiloNavegacao: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "20px"
};

const estiloBotao: CSSProperties = {
    padding: "10px 18px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "5px",
    background: "#fff"
};

const estiloTituloSemana: CSSProperties = {
    marginTop: "25px",
    textTransform: "capitalize"
};

const estiloLegenda: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    margin: "15px 0"
};

const estiloLegendaItem: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px"
};

const estiloBolinha: CSSProperties = {
    width: "11px",
    height: "11px",
    borderRadius: "50%"
};

const estiloContainerCalendario: CSSProperties = {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "6px"
};

const estiloGrade: CSSProperties = {
    display: "grid",
    minWidth: "1010px",
    position: "relative"
};

const estiloCabecalhoHora: CSSProperties = {
    padding: "15px 5px",
    borderBottom: "1px solid #ddd",
    background: "#f8f8f8",
    fontSize: "12px"
};

const estiloCabecalhoDia: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "10px",
    borderLeft: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    background: "#f8f8f8",
    textTransform: "capitalize",
    fontSize: "13px"
};

const estiloHora: CSSProperties = {
    position: "absolute",
    width: "100%",
    height: ALTURA_HORA,
    boxSizing: "border-box",
    borderTop: "1px solid #ddd",
    padding: "5px",
    fontSize: "12px",
    color: "#666"
};

const estiloColunaDia: CSSProperties = {
    position: "relative",
    borderLeft: "1px solid #ddd",
    background: "#fff"
};

const estiloLinhaHorario: CSSProperties = {
    position: "absolute",
    width: "100%",
    height: 1,
    borderTop: "1px solid #eee",
    boxSizing: "border-box"
};

const estiloAgendamento: CSSProperties = {
    position: "absolute",
    left: "3px",
    right: "3px",
    boxSizing: "border-box",
    padding: "5px",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    overflow: "hidden",
    fontSize: "11px",
    zIndex: 1
};

const estiloFundoModal: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "15px",
    boxSizing: "border-box"
};

const estiloModal: CSSProperties = {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#222"
};

const estiloCabecalhoModal: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
    marginBottom: "20px"
};

const estiloFechar: CSSProperties = {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer"
};

const estiloBotoesModal: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "25px"
};

const estiloBotaoModal: CSSProperties = {
    padding: "10px 20px",
    cursor: "pointer"
};