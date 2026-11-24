
import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import './cssAd/ProfissionaisCss.css';

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
                className="btns estiloBotao"
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

                        <table  className="estiloTabela">

                            <thead>

                                <tr>
                                    <th className="estiloCelula">ID</th>
                                    <th className="estiloCelula">Nome</th>
                                    <th className="estiloCelula">Status</th>
                                    <th className="estiloCelula">Ações</th>
                                </tr>

                            </thead>

                            <tbody>

                                {profissionais.map((profissional) => (

                                    <tr key={profissional.id}>

                                        <td className="estiloCelula">
                                            {profissional.id}
                                        </td>

                                        <td className="estiloCelula">
                                            {profissional.nome}
                                        </td>

                                        <td className="estiloCelula">
                                            {profissional.ativo ? "Ativo" : "Inativo"}
                                        </td>

                                        <td className="estiloCelula">

                                            <button
                                                type="button"
                                                className="btns"
                                                onClick={() => abrirEdicao(profissional)}
                                            >
                                                Editar
                                            </button>

                                            {" "}

                                            <button
                                                type="button"
                                                  className="btns"
                                                onClick={() => alterarStatusProfissional(profissional)}
                                            >
                                                {profissional.ativo ? "Desativar" : "Ativar"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btns"
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
                                           className="estiloCelula"
                                        >
                                            Nenhum profissional cadastrado.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>
                          {/* Modal de configuração do profissional */}

            {modalConfiguracao && (

                <div className="estiloFundoModal">

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
                                                       className="estiloInput"
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
                                                        className="estiloInput"
                                                    />

                                                    <button
                                                        type="button"
                                                        className="btns"
                                                        onClick={() => removerHorario(indice)}
                                                    >
                                                        Remover
                                                    </button>

                                                </div>

                                            );

                                        })}

                                        <button
                                            type="button"
                                            className="btns"
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

                        <div className="estiloBotoes">

                            <button
                                type="button"
                                className="btns"
                                onClick={fecharConfiguracao}
                                disabled={salvandoConfiguracao}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="btns agenda-btn-novo"
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

                <div className="estiloFundoModal">

                    <div style={estiloModal}>

                        <h2>
                            {idEditando !== null
                                ? "Editar profissional"
                                : "Novo profissional"}
                        </h2>

                        <form onSubmit={salvarProfissional}>

                            <div className="estiloCampo">

                                <label>Nome *</label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome do profissional"
                                    required
                                     className="estiloInput"
                                />

                            </div>

                            {erroFormulario && (

                                <p style={{ color: "red" }}>
                                    {erroFormulario}
                                </p>

                            )}

                            <div className="estiloBotoes">

                                <button
                                    type="button"
                                      className="btns"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                      className="btns"
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
