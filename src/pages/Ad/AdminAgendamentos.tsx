
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { apiGet, apiPatch,apiPost } from "../../services/api";
import "./cssAd/AgendamentoCss.css";

interface Agendamento {
    id: number;
    tipo_agendamento: "marcado" | "encaixe";
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
    status: number;
    mensagem?: string;
    agendamentos: Agendamento[];
}


const ALTURA_MINUTO = 1.5;
const ALTURA_CABECALHO = 65;
const ALTURA_HORA = ALTURA_CABECALHO * ALTURA_MINUTO;

function calcularLayoutAgendamentos(agendamentos: Agendamento[]) {
    const ordenados = [...agendamentos].sort((a, b) => {
        return new Date(a.inicio).getTime() - new Date(b.inicio).getTime();
    });

    // const resultado: Record<number, { coluna: number; totalColunas: number }> = {};

    const resultado: Record<string, { coluna: number; totalColunas: number }> = {};
    let grupo: Agendamento[] = [];
    let fimGrupo = 0;

    function processarGrupo() {
        if (grupo.length === 0) return;

        const finaisColunas: number[] = [];
        // const distribuicao: { id: number; coluna: number }[] = [];
        const distribuicao: { chave: string; coluna: number }[] = [];

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

            // distribuicao.push({
            //     id: agendamento.id,
            //     coluna
            // });
            distribuicao.push({
                    chave: `${agendamento.tipo_agendamento}-${agendamento.id}`,
                    coluna
                });
        });

        const totalColunas = finaisColunas.length;

        // distribuicao.forEach((item) => {
        //     resultado[item.id] = {
        //         coluna: item.coluna,
        //         totalColunas
        //     };
        // });
        distribuicao.forEach((item) => {
                resultado[item.chave] = {
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

    const [horariosDisponiveisNovo, setHorariosDisponiveisNovo] = useState<HorarioDisponivel[]>([]);

    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [semanaAtual, setSemanaAtual] = useState(new Date());

    const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

    const [cancelando, setCancelando] = useState(false);
    const [erroCancelamento, setErroCancelamento] = useState("");
    const [sucessoCancelamento, setSucessoCancelamento] = useState("");

    const [salvandoReagendamento, setSalvandoReagendamento] = useState(false);


    const [criandoAgendamento, setCriandoAgendamento] = useState(false); ///cria novos agendamento pelo o admim

            // Dados do novo atendimento
        const [nomeNovoCliente, setNomeNovoCliente] = useState("");
        const [telefoneNovoCliente, setTelefoneNovoCliente] = useState("");
        const [emailNovoCliente, setEmailNovoCliente] = useState("");

        const [tipoNovoAgendamento, setTipoNovoAgendamento] =
            useState<"marcado" | "encaixe">("marcado");

        const [servicoNovoAgendamento, setServicoNovoAgendamento] = useState("");
        const [profissionalNovoAgendamento, setProfissionalNovoAgendamento] = useState("");

        const [dataNovoAgendamento, setDataNovoAgendamento] = useState("");
        const [horarioNovoAgendamento, setHorarioNovoAgendamento] = useState("");

        const [salvandoNovoAgendamento, setSalvandoNovoAgendamento] = useState(false);
        const [erroNovoAgendamento, setErroNovoAgendamento] = useState("");
        const [sucessoNovoAgendamento, setSucessoNovoAgendamento] = useState("");

                // Filtros do calendário administrativo
        const [filtroProfissional, setFiltroProfissional] = useState("");
        const [filtroStatus, setFiltroStatus] = useState("");
        const [filtroTipo, setFiltroTipo] = useState("");
        const [filtroCliente, setFiltroCliente] = useState("");

        const [profissionaisFiltro, setProfissionaisFiltro] = useState<Profissional[]>([]);
        async function salvarNovoAgendamento() {

    setErroNovoAgendamento("");
    setSucessoNovoAgendamento("");

    if (
        !nomeNovoCliente.trim() ||
        !telefoneNovoCliente.trim() ||
        !servicoNovoAgendamento ||
        !profissionalNovoAgendamento
    ) {
        setErroNovoAgendamento(
            "Preencha nome, telefone, serviço e profissional."
        );
        return;
    }

    if (
        tipoNovoAgendamento === "marcado" &&
        !horarioNovoAgendamento
    ) {
        setErroNovoAgendamento(
            "Selecione um horário disponível."
        );
        return;
    }

    try {

        setSalvandoNovoAgendamento(true);

        const resultado = await apiPost<{
            status: number;
            mensagem: string;
        }>("/admin/agendamentos", {
            cliente_nome: nomeNovoCliente.trim(),
            cliente_telefone: telefoneNovoCliente.trim(),
            cliente_email: emailNovoCliente.trim(),

            servico_id: Number(servicoNovoAgendamento),
            profissional_id: Number(profissionalNovoAgendamento),

            tipo_agendamento: tipoNovoAgendamento,

            inicio: tipoNovoAgendamento === "marcado"
                ? horarioNovoAgendamento
                : null
        });

        if (resultado.status !== 1) {
            throw new Error(
                resultado.mensagem ||
                "Não foi possível criar o atendimento."
            );
        }

        setSucessoNovoAgendamento(
            resultado.mensagem || "Atendimento criado com sucesso."
        );

        await carregarAgendamentos();

    } catch (error) {

        setErroNovoAgendamento(
            error instanceof Error
                ? error.message
                : "Erro ao salvar atendimento."
        );

    } finally {

        setSalvandoNovoAgendamento(false);

    }
}

    async function confirmarReagendamento() {
    
     if (!agendamentoSelecionado ||
        agendamentoSelecionado.tipo_agendamento === "encaixe") {
        return;
    }

    if (
        !servicoSelecionado ||
        !profissionalSelecionado ||
        !dataReagendamento ||
        !horarioReagendamento
    ) {
        setErroReagendamento(
            "Selecione o serviço, profissional, data e horário."
        );
        return;
    }

    try {
        setSalvandoReagendamento(true);
        setErroReagendamento("");
        setSucessoReagendamento("");

        const resultado = await apiPatch<{
            status: number | boolean;
            mensagem?: string;
            agendamento?: any;
        }>(
            `/admin/agendamentos/${agendamentoSelecionado.id}/reagendar`,
            {
                servico_id: Number(servicoSelecionado),
                profissional_id: Number(profissionalSelecionado),
                inicio: horarioReagendamento
            }
        );

        if (resultado.status !== 1 && resultado.status !== true) {
            throw new Error(
                resultado.mensagem || "Não foi possível reagendar."
            );
        }

        await carregarAgendamentos();

        window.alert(
            resultado.mensagem || "Agendamento reagendado com sucesso!"
        );

        setAgendamentoSelecionado(null);
        setReagendando(false);
        setHorarioReagendamento("");

    } catch (error) {
        setErroReagendamento(
            error instanceof Error
                ? error.message
                : "Erro ao reagendar atendimento."
        );
    } finally {
        setSalvandoReagendamento(false);
    }
}


const carregarHorariosNovoAgendamento = useCallback(async () => {
    if (
        !servicoNovoAgendamento ||
        !profissionalNovoAgendamento ||
        !dataNovoAgendamento
    ) {
        setHorariosDisponiveisNovo([]);
        return;
    }

    try {
        setHorariosDisponiveisNovo([]);
        setErroNovoAgendamento("");

        const resultado = await apiGet<RespostaDisponibilidade>(
            `/disponibilidade?profissional_id=${profissionalNovoAgendamento}` +
            `&servico_id=${servicoNovoAgendamento}` +
            `&data=${dataNovoAgendamento}`
        );

        if (resultado.status !== 1 && resultado.status !== true) {
            throw new Error(
                resultado.mensagem ||
                resultado.msg ||
                "Não foi possível carregar os horários disponíveis."
            );
        }

        setHorariosDisponiveisNovo(resultado.dados || []);

   } catch (error) {
        setErroNovoAgendamento(
            error instanceof Error
                ? error.message
                : "Erro ao carregar horários disponíveis."
        );
    }

}, [
    servicoNovoAgendamento,
    profissionalNovoAgendamento,
    dataNovoAgendamento
]);
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
    async function carregarProfissionaisFiltro() {
    try {
        const resposta = await apiGet<RespostaProfissionais>(
            "/admin/profissionais"
        );

        if (resposta.status) {
            setProfissionaisFiltro(
                resposta.dados.filter((profissional) => profissional.ativo)
            );
        }
    } catch (error) {
        console.error("Erro ao carregar profissionais do filtro:", error);
    }
}
    async function carregarServicos(
    tipo: "reagendamento" | "novo" = "reagendamento"
) {
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
    const mensagem = error instanceof Error
        ? error.message
        : "Erro ao carregar serviços.";

    if (tipo === "novo") {
        setErroNovoAgendamento(mensagem);
    } else {
        setErroReagendamento(mensagem);
    }
}
}
async function carregarProfissionais(
    servicoId: string,
    profissionalIdInicial: string = "",
    tipo: "reagendamento" | "novo" = "reagendamento"
) {
    try {
       if (tipo === "novo") {
            setProfissionais([]);
            setProfissionalNovoAgendamento("");
        } else {
            setProfissionais([]);
            setProfissionalSelecionado("");
        }

        if (!servicoId) {
            return;
        }

        const resultado = await apiGet<RespostaProfissionais>(
            `/proficionais?servico_id=${servicoId}`
        );

        if (resultado.status !== 1 && resultado.status !== true) {
            throw new Error(
                resultado.mensagem ||
                "Não foi possível carregar os profissionais."
            );
        }

      setProfissionais(resultado.dados || []);

      if (profissionalIdInicial && resultado.dados.some((profissional) =>
            String(profissional.id) === profissionalIdInicial
    )
) {
    if (tipo === "novo") {
        setProfissionalNovoAgendamento(profissionalIdInicial);
    } else {
        setProfissionalSelecionado(profissionalIdInicial);
    }
}

   } catch (error) {
    const mensagem = error instanceof Error
        ? error.message
        : "Erro ao carregar profissionais.";

    if (tipo === "novo") {
        setErroNovoAgendamento(mensagem);
    } else {
        setErroReagendamento(mensagem);
    }
}
}

    
async function cancelarAgendamento() {

    if (!agendamentoSelecionado) {
        return;
    }

    const confirmar = window.confirm(
        "Tem certeza que deseja cancelar este atendimento?"
    );

    if (!confirmar) {
        return;
    }

    try {

        setCancelando(true);
        setErroCancelamento("");
        setSucessoCancelamento("");

        const ehEncaixe =
            agendamentoSelecionado.tipo_agendamento === "encaixe";

        const resultado = await apiPatch<{
            status: number;
            mensagem: string;
            agendamento?: {
                id: number;
                status: string;
            };
            encaixe?: {
                id: number;
                status: string;
            };
        }>(
            ehEncaixe
                ? `/admin/encaixes/${agendamentoSelecionado.id}/cancelar`
                : `/admin/agendamentos/${agendamentoSelecionado.id}/cancelar`,
            {}
        );

        if (resultado.status !== 1) {
            throw new Error(
                resultado.mensagem || "Não foi possível cancelar."
            );
        }

        // Atualizar somente o registro correto.
        setAgendamentos((atual) =>
            atual.map((item) =>
                item.id === agendamentoSelecionado.id &&
                item.tipo_agendamento === agendamentoSelecionado.tipo_agendamento
                    ? { ...item, status: "cancelado" }
                    : item
            )
        );

        // Atualizar os dados exibidos no modal.
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
                : "Erro ao cancelar atendimento."
        );

    } finally {

        setCancelando(false);

    }
}


const carregarHorariosDisponiveis = useCallback(async () => {
    if (
        !agendamentoSelecionado ||
        !servicoSelecionado ||
        !profissionalSelecionado ||
        !dataReagendamento
    ) {
        setHorariosDisponiveis([]);
        return;
    }

    try {
        setHorariosDisponiveis([]);
        setErroReagendamento("");

        const resultado = await apiGet<RespostaDisponibilidade>(
            `/disponibilidade?profissional_id=${profissionalSelecionado}` +
            `&servico_id=${servicoSelecionado}` +
            `&data=${dataReagendamento}` +
            `&agendamento_id=${agendamentoSelecionado.id}`
        );

        if (resultado.status !== 1 && resultado.status !== true) {
            throw new Error(
                resultado.mensagem ||
                resultado.msg ||
                "Não foi possível carregar os horários disponíveis."
            );
        }

        setHorariosDisponiveis(resultado.dados || []);

    } catch (error) {
        setErroReagendamento(
            error instanceof Error
                ? error.message
                : "Erro ao carregar horários disponíveis."
        );
    }
}, [
    agendamentoSelecionado,
    servicoSelecionado,
    profissionalSelecionado,
    dataReagendamento
]);

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
    // carregarAgendamentos();

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
        const timeoutId = window.setTimeout(() => {
            void carregarAgendamentos();
            void carregarProfissionaisFiltro();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);
     
        
    useEffect(() => {
        void carregarHorariosDisponiveis();
    }, [carregarHorariosDisponiveis]);

    useEffect(() => {
    if (!criandoAgendamento || tipoNovoAgendamento !== "marcado") {
        setHorariosDisponiveisNovo([]);
        return;
    }

    void carregarHorariosNovoAgendamento();

}, [
    criandoAgendamento,
    tipoNovoAgendamento,
    carregarHorariosNovoAgendamento
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
function abrirNovoAgendamento() {
    setNomeNovoCliente("");
    setTelefoneNovoCliente("");
    setEmailNovoCliente("");

    setTipoNovoAgendamento("marcado");

    setServicoNovoAgendamento("");
    setProfissionalNovoAgendamento("");

    setDataNovoAgendamento("");
    setHorarioNovoAgendamento("");

    setErroNovoAgendamento("");
    setSucessoNovoAgendamento("");

    setProfissionais([]);

    setCriandoAgendamento(true);

    void carregarServicos("novo");
}
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

   const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((agendamento) => {

        if (
            filtroProfissional !== "" &&
            String(agendamento.profissional_id) !== filtroProfissional
        ) {
            return false;
        }

        if (
            filtroStatus !== "" &&
            agendamento.status.toLowerCase() !== filtroStatus
        ) {
            return false;
        }

        if (
            filtroTipo !== "" &&
            agendamento.tipo_agendamento !== filtroTipo
        ) {
            return false;
        }

        if (filtroCliente.trim() !== "") {
            const termo = filtroCliente.trim().toLowerCase();
            const nome = (agendamento.cliente_nome || "").toLowerCase();
            const telefone = (agendamento.cliente_telefone || "")
                .replace(/\D/g, "");
            const telefoneBusca = filtroCliente.replace(/\D/g, "");

            const encontrouNome = nome.includes(termo);
            const encontrouTelefone =
                telefoneBusca !== "" &&
                telefone.includes(telefoneBusca);

            if (!encontrouNome && !encontrouTelefone) {
                return false;
            }
        }

        return true;
    });
}, [
    agendamentos,
    filtroProfissional,
    filtroStatus,
    filtroTipo,
    filtroCliente
]);

// Agendamentos da semana
const agendamentosSemana = useMemo(() => {
    const chaves = diasSemana.map(chaveData);

    return agendamentosFiltrados.filter((agendamento) => {
        const data = dataDoAgendamento(agendamento.inicio);

        return chaves.includes(chaveData(data));
    });
}, [agendamentosFiltrados, diasSemana]);

    const layoutAgendamentos = useMemo(() => {
    // const resultado: Record<
    //     number,
    //     { coluna: number; totalColunas: number }
    // > = {};

    const resultado: Record<
    string,
    { coluna: number; totalColunas: number }
> = {};
    diasSemana.forEach((dia) => {
     
       const agendamentosDia = agendamentosFiltrados.filter((agendamento) =>
            chaveData(dataDoAgendamento(agendamento.inicio)) ===
            chaveData(dia)
        );

        Object.assign(
            resultado,
            calcularLayoutAgendamentos(agendamentosDia)
        );
    });

    return resultado;
}, [agendamentosFiltrados, diasSemana]);

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
function selecionarServicoNovoAgendamento(servicoId: string) {
    setServicoNovoAgendamento(servicoId);
    setProfissionalNovoAgendamento("");

    setErroNovoAgendamento("");

    void carregarProfissionais(
        servicoId,
        "",
        "novo"
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
     <div className="agenda-pagina">

            <div className="agenda-cabecalho">
                <h1>Calendário de agendamentos</h1>
                <p>Visualização semanal da agenda BarberPro</p>
            </div>

           <div className="agenda-navegacao">
            <button
                        type="button"
                        onClick={() => mudarSemana(-1)}
                        className="agenda-btn"
                    >
                        ‹ Anterior
                    </button>

                    <button
                        type="button"
                        onClick={() => setSemanaAtual(new Date())}
                        className="agenda-btn"
                    >
                        Hoje
                    </button>

                    <button
                        type="button"
                        onClick={() => mudarSemana(1)}
                        className="agenda-btn"
                    >
                        Próxima ›
                    </button>

                    <button
                        type="button"
                        onClick={() => void carregarAgendamentos()}
                        className="agenda-btn"
                        disabled={carregando}
                    >
                        Atualizar
                    </button>

                    <button
                        type="button"
                        onClick={abrirNovoAgendamento}
                        className="agenda-btn agenda-btn-novo"
                    >
                        + Novo atendimento
                    </button>

                </div>

           <h3 className="agenda-titulo-semana"> {tituloSemana}</h3>
            <div className="agenda-filtros">

    {/* Filtro por profissional */}
    <div className="agenda-filtro-campo">
        <label>Profissional</label>
        <select
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
            className="agenda-campo-modal"
        >
            <option value="">Todos os profissionais</option>

            {profissionaisFiltro.map((profissional) => (
                <option key={profissional.id} value={String(profissional.id)}>
                    {profissional.nome}
                </option>
            ))}
        </select>
    </div>

    {/* Filtro por status */}
     <div className="agenda-filtro-campo">
        <label>Status</label>
        <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="agenda-campo-modal"
        >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
        </select>
    </div>

    {/* Filtro por tipo */}
    <div className="agenda-filtro-campo">
        <label>Tipo de atendimento</label>
        <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="agenda-campo-modal"
        >
            <option value="">Todos os tipos</option>
            <option value="marcado">Agendamento normal</option>
            <option value="encaixe">Encaixe</option>
        </select>
    </div>

    {/* Filtro por cliente */}
     <div className="agenda-filtro-campo">
        <label>Cliente</label>
        <input
            type="text"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Nome ou telefone"
            className="agenda-campo-modal"
        />
    </div>

</div>

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

                                            // const cores = corStatus(
                                            //     agendamento.status
                                            // );
                                            const cores = agendamento.tipo_agendamento === "encaixe" ? {
                                                  fundo: "#ffedd5",
                                                    borda: "#ea580c",
                                                    texto: "#9a3412" }
                                                    : corStatus(agendamento.status);
                                            
                                            const chaveAgendamento =
                                                `${agendamento.tipo_agendamento}-${agendamento.id}`;

                                            const layout = layoutAgendamentos[chaveAgendamento] || {
                                                coluna: 0,
                                                totalColunas: 1
                                            };

                                            // const layout = layoutAgendamentos[agendamento.id] || {
                                            //     coluna: 0,
                                            //     totalColunas: 1
                                            // };

                                            const largura = 100 / layout.totalColunas;

                                            const posicaoEsquerda = layout.coluna * largura;

                                            return (
                                                <div
                                                    key={chaveAgendamento}
                                                      onClick={() => setAgendamentoSelecionado(agendamento)}
                                                    title={`${agendamento.cliente_nome} - ${agendamento.servico_nome}`}
                                                    // className="estiloAgendamento"
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
                                                    {agendamento.tipo_agendamento === "encaixe" && (
                                                        <strong style={{ color: "#c2410c" }}>
                                                            ENCAIXE
                                                        </strong>
                                                    )}

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
                                                    <div className="agenda-fundo-modal">
                                                        <div className="agenda-modal">

                                                            <div className="estiloCabecalhoModal">
                                                                <h2>Detalhes do agendamento</h2>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAgendamentoSelecionado(null)}
                                                                   className="estiloFechar"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>

                                                            <p><strong>Código:</strong> {agendamentoSelecionado.id}</p>
                                                            <p>
                                                                    <strong>Tipo:</strong>{" "}
                                                                    {agendamentoSelecionado.tipo_agendamento === "encaixe"
                                                                        ? "ENCAIXE ADMINISTRATIVO"
                                                                        : "AGENDAMENTO NORMAL"}
                                                                </p>

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

                                                                <div className="estiloBotoesModal">
                                                                    {(agendamentoSelecionado.status === "pendente" ||
                                                                            agendamentoSelecionado.status === "confirmado") && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={cancelarAgendamento}
                                                                                disabled={cancelando}
                                                                                style={{
                                                                                    ...estiloBotaoModal,
                                                                                    background: "#dc2626",
                                                                                    color: "#fff",
                                                                                    border: "none",
                                                                                    marginRight: "10px",
                                                                                    opacity: cancelando ? 0.6 : 1,
                                                                                    cursor: cancelando ? "not-allowed" : "pointer"
                                                                                }}
                                                                            >
                                                                                {cancelando ? "Cancelando..." : "Cancelar"}
                                                                            </button>
                                                                        )}

                                                                  {agendamentoSelecionado.tipo_agendamento !== "encaixe" &&  
                                                                  (agendamentoSelecionado.status === "pendente" ||
                                                                  agendamentoSelecionado.status === "confirmado") && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setReagendando(!reagendando);
                                                                                    setErroReagendamento("");
                                                                                    setSucessoReagendamento("");
                                                                                }}
                                                                                style={{
                                                                                    ...estiloBotaoModal,
                                                                                    background: "#2563eb",
                                                                                    color: "#fff",
                                                                                    border: "none",
                                                                                    marginRight: "10px"
                                                                                }}
                                                                            >
                                                                                {reagendando ? "Fechar reagendamento" : "Reagendar"}
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
                                                                {reagendando && (
                                                            <div style={{ marginTop: "20px", marginBottom: "20px" }}>

                                                                <hr />

                                                                <h3>Reagendar atendimento</h3>

                                                                <label>Serviço</label>

                                                                <select
                                                                    value={servicoSelecionado}
                                                                    onChange={(e) => {
                                                                        setServicoSelecionado(e.target.value);
                                                                        setProfissionalSelecionado("");
                                                                        setHorarioReagendamento("");
                                                                        setHorariosDisponiveis([]);

                                                                        void carregarProfissionais(e.target.value);
                                                                    }}
                                                                    className="agenda-campo-modal"
                                                                >
                                                                    <option value="">Selecione um serviço</option>

                                                                    {servicos.map((servico) => (
                                                                        <option key={servico.id} value={servico.id}>
                                                                            {servico.nome} - {formatarValor(servico.preco)}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <label>Profissional</label>

                                                                <select
                                                                    value={profissionalSelecionado}
                                                                    onChange={(e) => {
                                                                        setProfissionalSelecionado(e.target.value);
                                                                        setHorarioReagendamento("");
                                                                    }}
                                                                    className="agenda-campo-modal"
                                                                    disabled={!servicoSelecionado}
                                                                >
                                                                    <option value="">Selecione um profissional</option>

                                                                    {profissionais.map((profissional) => (
                                                                        <option key={profissional.id} value={profissional.id}>
                                                                            {profissional.nome}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                <label>Data</label>

                                                                <input
                                                                    type="date"
                                                                    value={dataReagendamento}
                                                                    onChange={(e) => {
                                                                        setDataReagendamento(e.target.value);
                                                                        setHorarioReagendamento("");
                                                                    }}
                                                                    className="agenda-campo-modal"
                                                                />

                                                                <label>Horário disponível</label>

                                                                <select
                                                                    value={horarioReagendamento}
                                                                    onChange={(e) => setHorarioReagendamento(e.target.value)}
                                                                    className="agenda-campo-modal"
                                                                    disabled={horariosDisponiveis.length === 0}
                                                                >
                                                                    <option value="">Selecione um horário</option>

                                                                    {horariosDisponiveis.map((horario) => (
                                                                        <option
                                                                            key={horario.inicio}
                                                                            value={horario.inicio}
                                                                        >
                                                                            {horario.hora_inicio} até {horario.hora_fim}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {horariosDisponiveis.length === 0 && (
                                                                    <p style={{ color: "#777" }}>
                                                                        Nenhum horário disponível para os dados selecionados.
                                                                    </p>
                                                                )}

                                                                {erroReagendamento && (
                                                                    <p style={{ color: "#dc2626" }}>
                                                                        {erroReagendamento}
                                                                    </p>
                                                                )}

                                                                {sucessoReagendamento && (
                                                                    <p style={{ color: "#16a34a" }}>
                                                                        {sucessoReagendamento}
                                                                    </p>
                                                                )}
                                                                <button
                                                            type="button"
                                                            onClick={confirmarReagendamento}
                                                            disabled={salvandoReagendamento}
                                                            style={{
                                                                padding: "10px 16px",
                                                                background: "#16a34a",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: salvandoReagendamento ? "not-allowed" : "pointer",
                                                                opacity: salvandoReagendamento ? 0.6 : 1
                                                            }}
                                                        >
                                                            {salvandoReagendamento
                                                                ? "Salvando..."
                                                                : "Confirmar reagendamento"}
                                                        </button>

                                                            </div>
                                                        )}

                                                        </div>
                                                    </div>
                                                    
                                                )}

                                        {criandoAgendamento && (
                                            <div className="agenda-fundo-modal">
                                                <div className="agenda-modal">

                                                    <div className="estiloCabecalhoModal">
                                                        <h2>Novo atendimento</h2>

                                                        <button
                                                            type="button"
                                                            onClick={() => setCriandoAgendamento(false)}
                                                             className="estiloFechar"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>

                                                    <label>Nome do cliente *</label>
                                                    <input
                                                        type="text"
                                                        value={nomeNovoCliente}
                                                        onChange={(e) => setNomeNovoCliente(e.target.value)}
                                                        className="agenda-campo-modal"
                                                        placeholder="Nome completo"
                                                    />

                                                    <label>Telefone *</label>
                                                    <input
                                                        type="text"
                                                        value={telefoneNovoCliente}
                                                        onChange={(e) => setTelefoneNovoCliente(e.target.value)}
                                                        className="agenda-campo-modal"
                                                        placeholder="Telefone do cliente"
                                                    />

                                                    <label>E-mail (opcional)</label>
                                                    <input
                                                        type="email"
                                                        value={emailNovoCliente}
                                                        onChange={(e) => setEmailNovoCliente(e.target.value)}
                                                        className="agenda-campo-modal"
                                                        placeholder="E-mail do cliente"
                                                    />

                                                    <hr />

                                                    <label>Tipo de atendimento *</label>
                                                    <select
                                                        value={tipoNovoAgendamento}
                                                        onChange={(e) => {
                                                            setTipoNovoAgendamento(
                                                                e.target.value as "marcado" | "encaixe"
                                                            );
                                                            setHorarioNovoAgendamento("");
                                                            setErroNovoAgendamento("");
                                                        }}
                                                        className="agenda-campo-modal"
                                                    >
                                                        <option value="marcado">Atendimento marcado</option>
                                                        <option value="encaixe">Encaixe imediato</option>
                                                    </select>

                                                    <label>Serviço *</label>
                                                    <select
                                                        value={servicoNovoAgendamento}
                                                        onChange={(e) =>
                                                            selecionarServicoNovoAgendamento(e.target.value)
                                                        }
                                                        className="agenda-campo-modal"
                                                    >
                                                        <option value="">Selecione um serviço</option>

                                                        {servicos.map((servico) => (
                                                            <option key={servico.id} value={servico.id}>
                                                                {servico.nome} - {formatarValor(servico.preco)}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <label>Profissional *</label>
                                                    <select
                                                        value={profissionalNovoAgendamento}
                                                        onChange={(e) => {
                                                            setProfissionalNovoAgendamento(e.target.value);
                                                            setHorarioNovoAgendamento("");
                                                        }}
                                                        className="agenda-campo-modal"
                                                        disabled={!servicoNovoAgendamento}
                                                    >
                                                        <option value="">Selecione um profissional</option>

                                                        {profissionais.map((profissional) => (
                                                            <option key={profissional.id} value={profissional.id}>
                                                                {profissional.nome}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {tipoNovoAgendamento === "marcado" && (
                                                        <>
                                                            <label>Data *</label>
                                                            <input
                                                                type="date"
                                                                value={dataNovoAgendamento}
                                                                min={chaveData(new Date())}
                                                                onChange={(e) => {
                                                                    setDataNovoAgendamento(e.target.value);
                                                                    setHorarioNovoAgendamento("");
                                                                }}
                                                                className="agenda-campo-modal"
                                                                disabled={!profissionalNovoAgendamento}
                                                            />

                                                            <label>Horário disponível *</label>
                                                            <select
                                                                value={horarioNovoAgendamento}
                                                                onChange={(e) =>
                                                                    setHorarioNovoAgendamento(e.target.value)
                                                                }
                                                                className="agenda-campo-modal"
                                                                disabled={
                                                                    !dataNovoAgendamento ||
                                                                    horariosDisponiveisNovo.length === 0
                                                                }
                                                            >
                                                                <option value="">Selecione um horário</option>

                                                                {horariosDisponiveisNovo.map((horario) => (
                                                                    <option
                                                                        key={horario.inicio}
                                                                        value={horario.inicio}
                                                                    >
                                                                        {horario.hora_inicio} até {horario.hora_fim}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {dataNovoAgendamento &&
                                                                profissionalNovoAgendamento &&
                                                                horariosDisponiveisNovo.length === 0 && (
                                                                    <p style={{ color: "#777" }}>
                                                                        Nenhum horário disponível para os dados selecionados.
                                                                    </p>
                                                                )}
                                                        </>
                                                    )}

                                                    {erroNovoAgendamento && (
                                                        <p style={{ color: "#dc2626" }}>
                                                            {erroNovoAgendamento}
                                                        </p>
                                                    )}

                                                    {sucessoNovoAgendamento && (
                                                        <p style={{ color: "#16a34a" }}>
                                                            {sucessoNovoAgendamento}
                                                        </p>
                                                    )}

                                                    <div className="estiloBotoesModal">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCriandoAgendamento(false)}
                                                            style={{
                                                                ...estiloBotaoModal,
                                                                marginRight: "10px"
                                                            }}
                                                            disabled={salvandoNovoAgendamento}
                                                        >
                                                            Fechar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={salvarNovoAgendamento}
                                                            disabled={salvandoNovoAgendamento}
                                                            style={{
                                                                ...estiloBotaoModal,
                                                                background: "#16a34a",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                opacity: salvandoNovoAgendamento ? 0.6 : 1
                                                            }}
                                                        >
                                                            {salvandoNovoAgendamento
                                                                ? "Salvando..."
                                                                : "Salvar atendimento"}
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


const estiloCampoModal: CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box"
};