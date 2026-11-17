
import { useEffect, useState, type FormEvent, type CSSProperties } from "react";

import {
    apiGet,
    apiPost,
    apiPut,
    apiPatch
} from "../../services/api";

interface Profissional {
    id: number;
    nome: string;
    ativo: boolean;
}

interface RespostaProfissionais {
    status: number;
    mensagem?: string;
    dados: Profissional[];
}

interface RespostaCadastro {
    status: number;
    mensagem?: string;
    id?: number;
}


interface Servico {
    id: number;
    nome: string;
    descricao: string | null;
    duracao_minutos: number;
    preco: number | string;
    ativo: boolean;
}

interface HorarioTrabalho {
    id?: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
}

interface RespostaConfiguracao {
    status: number;
    mensagem?: string;
    dados: {
        profissional: Profissional;
        servicos: Servico[];
        horarios: HorarioTrabalho[];
    };
}


export default function AdminProfissionais() {

    const [profissionais, setProfissionais] = useState<Profissional[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Controle do modal.
    const [modalAberto, setModalAberto] = useState(false);

    // Dados do formulário.
    const [nome, setNome] = useState("");

    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");

    const [idEditando, setIdEditando] = useState<number | null>(null);


    // Controle da configuração do profissional.
    const [modalConfiguracao, setModalConfiguracao] = useState(false);

    const [profissionalConfigurando, setProfissionalConfigurando] =
        useState<Profissional | null>(null);

    const [todosServicos, setTodosServicos] = useState<Servico[]>([]);

    const [servicosSelecionados, setServicosSelecionados] =
        useState<number[]>([]);

    const [horarios, setHorarios] = useState<HorarioTrabalho[]>([]);

    const [carregandoConfiguracao, setCarregandoConfiguracao] =
        useState(false);

    const [salvandoConfiguracao, setSalvandoConfiguracao] =
        useState(false);

    const [erroConfiguracao, setErroConfiguracao] = useState("");

    async function carregarProfissionais() {

        try {

            setCarregando(true);
            setErro("");

            const resultado = await apiGet<RespostaProfissionais>(
                "/admin/profissionais"
            );

            if (resultado.status !== 1) {

                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível listar os profissionais."
                );
            }

            setProfissionais(resultado.dados || []);

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar profissionais."
            );

        } finally {

            setCarregando(false);
        }
    }

    useEffect(() => {

        const timeoutId = window.setTimeout(() => {
            void carregarProfissionais();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };

    }, []);

    function limparFormulario() {

        setIdEditando(null);
        setNome("");
        setErroFormulario("");
    }

    function abrirModal() {

        limparFormulario();
        setModalAberto(true);
    }

    function abrirEdicao(profissional: Profissional) {

        setIdEditando(profissional.id);
        setNome(profissional.nome);

        setErroFormulario("");
        setModalAberto(true);
    }

    function fecharModal() {

        if (salvando) return;

        setModalAberto(false);
        setErroFormulario("");
    }

    async function abrirConfiguracao(profissional: Profissional) {

    try {

        setCarregandoConfiguracao(true);
        setErroConfiguracao("");

        setProfissionalConfigurando(profissional);
        setModalConfiguracao(true);

        // Buscar a configuração atual do profissional.
        const resultado = await apiGet<RespostaConfiguracao>(
            `/admin/profissionais/${profissional.id}/configuracao`
        );

        if (resultado.status !== 1) {

            throw new Error(
                resultado.mensagem ||
                "Não foi possível carregar a configuração."
            );
        }

        // Buscar todos os serviços cadastrados.
        const respostaServicos = await apiGet<{
            status: number;
            mensagem?: string;
            dados: Servico[];
        }>("/admin/servicos");

        if (respostaServicos.status !== 1) {

            throw new Error(
                respostaServicos.mensagem ||
                "Não foi possível carregar os serviços."
            );
        }

        setTodosServicos(respostaServicos.dados || []);

        // Marcar os serviços já associados.
        setServicosSelecionados(
            resultado.dados.servicos.map(
                (servico) => Number(servico.id)
            )
        );

        // Carregar os horários cadastrados.
        setHorarios(resultado.dados.horarios || []);

    } catch (error) {

        setErroConfiguracao(
            error instanceof Error
                ? error.message
                : "Erro ao carregar configuração."
        );

    } finally {

        setCarregandoConfiguracao(false);
    }
}

    async function salvarProfissional(e: FormEvent) {

        e.preventDefault();

        setErroFormulario("");

        if (!nome.trim()) {

            setErroFormulario(
                "Informe o nome do profissional."
            );

            return;
        }

        try {

            setSalvando(true);

            const dados = {
                nome: nome.trim()
            };

            if (idEditando === null) {

                // Cadastro.
                const resultado = await apiPost<RespostaCadastro>(
                    "/admin/profissionais",
                    dados
                );

                if (resultado.status !== 1) {

                    throw new Error(
                        resultado.mensagem ||
                        "Erro ao cadastrar profissional."
                    );
                }

            } else {

                // Edição.
                const resultado = await apiPut<RespostaCadastro>(
                    `/admin/profissionais/${idEditando}`,
                    dados
                );

                if (resultado.status !== 1) {

                    throw new Error(
                        resultado.mensagem ||
                        "Erro ao atualizar profissional."
                    );
                }
            }

            setModalAberto(false);

            limparFormulario();

            await carregarProfissionais();

        } catch (error) {

            setErroFormulario(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar profissional."
            );

        } finally {

            setSalvando(false);
        }
    }
    function alternarServico(servicoId: number) {

    setServicosSelecionados((anteriores) => {

        if (anteriores.includes(servicoId)) {
            return anteriores.filter((id) => id !== servicoId);
        }

        return [...anteriores, servicoId];
    });
}

function adicionarHorario(diaSemana: number) {

    setHorarios((anteriores) => [
        ...anteriores,
        {
            dia_semana: diaSemana,
            hora_inicio: "09:00",
            hora_fim: "18:00"
        }
    ]);
}

function atualizarHorario(
    indice: number,
    campo: "dia_semana" | "hora_inicio" | "hora_fim",
    valor: string
) {

    setHorarios((anteriores) =>
        anteriores.map((horario, index) => {

            if (index !== indice) {
                return horario;
            }

            if (campo === "dia_semana") {
                return {
                    ...horario,
                    dia_semana: Number(valor)
                };
            }

            return {
                ...horario,
                [campo]: valor
            };
        })
    );
}

function removerHorario(indice: number) {

    setHorarios((anteriores) =>
        anteriores.filter((_, index) => index !== indice)
    );
}

async function salvarConfiguracao() {

    if (!profissionalConfigurando) {
        return;
    }

    try {

        setSalvandoConfiguracao(true);
        setErroConfiguracao("");

        const resultado = await apiPut<RespostaCadastro>(
            `/admin/profissionais/${profissionalConfigurando.id}/configuracao`,
            {
                servicos: servicosSelecionados,
                horarios: horarios
            }
        );

        if (resultado.status !== 1) {

            throw new Error(
                resultado.mensagem ||
                "Não foi possível salvar a configuração."
            );
        }

        setModalConfiguracao(false);
        setProfissionalConfigurando(null);

        alert("Configuração do profissional salva com sucesso!");

    } catch (error) {

        setErroConfiguracao(
            error instanceof Error
                ? error.message
                : "Erro ao salvar configuração."
        );

    } finally {

        setSalvandoConfiguracao(false);
    }
}

function fecharConfiguracao() {

    if (salvandoConfiguracao) {
        return;
    }

    setModalConfiguracao(false);
    setProfissionalConfigurando(null);
    setErroConfiguracao("");
}

    return (

        <div style={{ padding: "30px" }}>

            <h1>Gerenciamento de profissionais</h1>

            <p>Profissionais cadastrados no BarberPro</p>

            <button
                type="button"
                onClick={abrirModal}
                style={estiloBotao}
            >
                + Novo profissional
            </button>

            {carregando && (
                <p>Carregando profissionais...</p>
            )}

            {erro && (
                <p style={{ color: "red" }}>{erro}</p>
            )}

            {!carregando && (

                <>

                    <h3>
                        Total de profissionais: {profissionais.length}
                    </h3>

                    <div style={{ overflowX: "auto" }}>

                        <table style={estiloTabela}>

                            <thead>

                                <tr>
                                    <th style={estiloCelula}>ID</th>
                                    <th style={estiloCelula}>Nome</th>
                                    <th style={estiloCelula}>Status</th>
                                    <th style={estiloCelula}>Ações</th>
                                </tr>

                            </thead>

                            <tbody>

                                {profissionais.map((profissional) => (

                                    <tr key={profissional.id}>

                                        <td style={estiloCelula}>
                                            {profissional.id}
                                        </td>

                                        <td style={estiloCelula}>
                                            {profissional.nome}
                                        </td>

                                        <td style={estiloCelula}>
                                            {profissional.ativo ? "Ativo" : "Inativo"}
                                        </td>

                                        <td style={estiloCelula}>

                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(profissional)}
                                            >
                                                Editar
                                            </button>

                                            {" "}

                                            <button
                                                type="button"
                                                onClick={() => alterarStatusProfissional(profissional)}
                                            >
                                                {profissional.ativo ? "Desativar" : "Ativar"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => abrirConfiguracao(profissional)}
                                            >
                                                Configurar
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                                {profissionais.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={4}
                                            style={estiloCelula}
                                        >
                                            Nenhum profissional cadastrado.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>
                          {/* Modal de configuração do profissional */}

            {modalConfiguracao && (

                <div style={estiloFundoModal}>

                    <div style={{
                        ...estiloModal,
                        maxWidth: "750px"
                    }}>

                        <h2>
                            Configurar profissional
                        </h2>

                        <h3>
                            {profissionalConfigurando?.nome}
                        </h3>

                        {carregandoConfiguracao ? (

                            <p>Carregando configuração...</p>

                        ) : (

                            <>

                                {/* Serviços */}

                                <h3>Serviços disponíveis</h3>

                                {todosServicos.map((servico) => (

                                    <div
                                        key={servico.id}
                                        style={{
                                            marginBottom: "10px",
                                            padding: "10px",
                                            border: "1px solid #ddd",
                                            borderRadius: "5px"
                                        }}
                                    >

                                        <label style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>

                                            <input
                                                type="checkbox"
                                                checked={servicosSelecionados.includes(servico.id)}
                                                onChange={() => alternarServico(servico.id)}
                                            />

                                            <span>
                                                {servico.nome}
                                                {" - "}
                                                {servico.duracao_minutos} minutos
                                                {" - R$ "}
                                                {Number(servico.preco).toFixed(2).replace(".", ",")}

                                                {!servico.ativo && " (Inativo)"}
                                            </span>

                                        </label>

                                    </div>

                                ))}

                                {/* Horários */}

                                <h3>Horários de trabalho</h3>

                                {[
                                    { id: 0, nome: "Domingo" },
                                    { id: 1, nome: "Segunda-feira" },
                                    { id: 2, nome: "Terça-feira" },
                                    { id: 3, nome: "Quarta-feira" },
                                    { id: 4, nome: "Quinta-feira" },
                                    { id: 5, nome: "Sexta-feira" },
                                    { id: 6, nome: "Sábado" }
                                ].map((dia) => (

                                    <div
                                        key={dia.id}
                                        style={{
                                            border: "1px solid #ddd",
                                            borderRadius: "5px",
                                            padding: "12px",
                                            marginBottom: "12px"
                                        }}
                                    >

                                        <h4 style={{ marginTop: 0 }}>
                                            {dia.nome}
                                        </h4>

                                        {horarios.map((horario, indice) => {

                                            if (horario.dia_semana !== dia.id) {
                                                return null;
                                            }

                                            return (

                                                <div
                                                    key={indice}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px",
                                                        marginBottom: "10px",
                                                        flexWrap: "wrap"
                                                    }}
                                                >

                                                    <input
                                                        type="time"
                                                        value={horario.hora_inicio.substring(0, 5)}
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                indice,
                                                                "hora_inicio",
                                                                e.target.value
                                                            )
                                                        }
                                                        style={estiloInput}
                                                    />

                                                    <span>até</span>

                                                    <input
                                                        type="time"
                                                        value={horario.hora_fim.substring(0, 5)}
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                indice,
                                                                "hora_fim",
                                                                e.target.value
                                                            )
                                                        }
                                                        style={estiloInput}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => removerHorario(indice)}
                                                    >
                                                        Remover
                                                    </button>

                                                </div>

                                            );

                                        })}

                                        <button
                                            type="button"
                                            onClick={() => adicionarHorario(dia.id)}
                                        >
                                            + Adicionar horário
                                        </button>

                                    </div>

                                ))}

                            </>

                        )}

                        {erroConfiguracao && (

                            <p style={{ color: "red" }}>
                                {erroConfiguracao}
                            </p>

                        )}

                        <div style={estiloBotoes}>

                            <button
                                type="button"
                                onClick={fecharConfiguracao}
                                disabled={salvandoConfiguracao}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={salvarConfiguracao}
                                disabled={
                                    salvandoConfiguracao ||
                                    carregandoConfiguracao
                                }
                            >
                                {salvandoConfiguracao
                                    ? "Salvando..."
                                    : "Salvar configuração"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

                    </div>

                </>

            )}

            {/* Modal de cadastro e edição */}

            {modalAberto && (

                <div style={estiloFundoModal}>

                    <div style={estiloModal}>

                        <h2>
                            {idEditando !== null
                                ? "Editar profissional"
                                : "Novo profissional"}
                        </h2>

                        <form onSubmit={salvarProfissional}>

                            <div style={estiloCampo}>

                                <label>Nome *</label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome do profissional"
                                    required
                                    style={estiloInput}
                                />

                            </div>

                            {erroFormulario && (

                                <p style={{ color: "red" }}>
                                    {erroFormulario}
                                </p>

                            )}

                            <div style={estiloBotoes}>

                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? "Salvando..."
                                        : idEditando !== null
                                            ? "Atualizar profissional"
                                            : "Salvar profissional"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );
}

const estiloCelula: CSSProperties = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left"
};

const estiloTabela: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
};

const estiloBotao: CSSProperties = {
    padding: "10px 18px",
    marginTop: "15px",
    cursor: "pointer"
};

const estiloFundoModal: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "15px",
    boxSizing: "border-box"
};

const estiloModal: CSSProperties = {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#222"
};

const estiloCampo: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "15px"
};

const estiloInput: CSSProperties = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box"
};

const estiloBotoes: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px"
};
