
import { useEffect, useState, type FormEvent } from "react";

import {
    apiGet,
    apiPost,
    apiPut,
    apiPatch
} from "../../services/api";

interface Servico {
    id: number;
    nome: string;
    descricao: string | null;
    duracao_minutos: number;
    preco: number | string;
    ativo: boolean;
}

interface RespostaServicos {
    status: number;
    mensagem?: string;
    dados: Servico[];
}

interface RespostaCadastro {
    status: number;
    mensagem?: string;
    id?: number;
}

export default function AdminServicos() {

    const [servicos, setServicos] = useState<Servico[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Controle do modal
    const [modalAberto, setModalAberto] = useState(false);

    // Dados do formulário
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [duracao, setDuracao] = useState("");
    const [preco, setPreco] = useState("");

    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");

    const [idEditando, setIdEditando] = useState<number | null>(null);

    async function carregarServicos() {

        try {

            setCarregando(true);
            setErro("");

            const resultado = await apiGet<RespostaServicos>(
                "/admin/servicos"
            );

            if (resultado.status !== 1) {

                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível listar os serviços."
                );
            }

            setServicos(resultado.dados || []);

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar serviços."
            );

        } finally {

            setCarregando(false);
        }
    }

    useEffect(() => {

        const timeoutId = window.setTimeout(() => {
            void carregarServicos();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };

    }, []);

    function limparFormulario() {

        setIdEditando(null);
        setNome("");
        setDescricao("");
        setDuracao("");
        setPreco("");
        setErroFormulario("");
    }

    function abrirModal() {

        limparFormulario();
        setModalAberto(true);
    }

    function abrirEdicao(servico: Servico) {

        setIdEditando(servico.id);

        setNome(servico.nome);
        setDescricao(servico.descricao || "");
        setDuracao(String(servico.duracao_minutos));
        setPreco(String(servico.preco));

        setErroFormulario("");
        setModalAberto(true);
    }

    function fecharModal() {

        if (salvando) return;

        setModalAberto(false);
        setErroFormulario("");
    }

    async function alterarStatusServico(servico: Servico) {

        const novoStatus = !servico.ativo;

        const acao = novoStatus ? "ativar" : "desativar";

        const confirmar = window.confirm(
            `Deseja realmente ${acao} o serviço ${servico.nome}?`
        );

        if (!confirmar) {
            return;
        }

        try {

            const resultado = await apiPatch<RespostaCadastro>(
                `/admin/servicos/${servico.id}/status`,
                {
                    ativo: novoStatus
                }
            );

            if (resultado.status !== 1) {

                throw new Error(
                    resultado.mensagem ||
                    `Não foi possível ${acao} o serviço.`
                );
            }

            await carregarServicos();

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : `Erro ao ${acao} serviço.`
            );
        }
    }

    async function salvarServico(e: FormEvent) {

        e.preventDefault();

        setErroFormulario("");

        if (
            !nome.trim() ||
            !duracao.trim() ||
            !preco.trim()
        ) {

            setErroFormulario(
                "Preencha nome, duração e preço."
            );

            return;
        }

        const duracaoNumero = Number(duracao);
        const precoNumero = Number(preco.replace(",", "."));

        if (
            !Number.isInteger(duracaoNumero) ||
            duracaoNumero <= 0
        ) {

            setErroFormulario(
                "Informe uma duração válida em minutos."
            );

            return;
        }

        if (
            !Number.isFinite(precoNumero) ||
            precoNumero < 0
        ) {

            setErroFormulario(
                "Informe um preço válido."
            );

            return;
        }

        try {

            setSalvando(true);

            const dados = {
                nome: nome.trim(),
                descricao: descricao.trim(),
                duracao_minutos: duracaoNumero,
                preco: precoNumero
            };

            if (idEditando === null) {

                // Cadastro
                const resultado = await apiPost<RespostaCadastro>(
                    "/admin/servicos",
                    dados
                );

                if (resultado.status !== 1) {

                    throw new Error(
                        resultado.mensagem ||
                        "Erro ao cadastrar serviço."
                    );
                }

            } else {

                // Edição
                const resultado = await apiPut<RespostaCadastro>(
                    `/admin/servicos/${idEditando}`,
                    dados
                );

                if (resultado.status !== 1) {

                    throw new Error(
                        resultado.mensagem ||
                        "Erro ao atualizar serviço."
                    );
                }
            }

            setModalAberto(false);

            limparFormulario();

            await carregarServicos();

        } catch (error) {

            setErroFormulario(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar serviço."
            );

        } finally {

            setSalvando(false);
        }
    }

    function formatarPreco(valor: number | string) {

        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    return (

        <div style={{ padding: "30px" }}>

            <h1>Gerenciamento de serviços</h1>

            <p>Serviços cadastrados no BarberPro</p>

            <button
                type="button"
                onClick={abrirModal}
                style={estiloBotao}
            >
                + Novo serviço
            </button>

            {carregando && (
                <p>Carregando serviços...</p>
            )}

            {erro && (
                <p style={{ color: "red" }}>{erro}</p>
            )}

            {!carregando && (

                <>

                    <h3>
                        Total de serviços: {servicos.length}
                    </h3>

                    <div style={{ overflowX: "auto" }}>

                        <table style={estiloTabela}>

                            <thead>

                                <tr>
                                    <th style={estiloCelula}>ID</th>
                                    <th style={estiloCelula}>Nome</th>
                                    <th style={estiloCelula}>Descrição</th>
                                    <th style={estiloCelula}>Duração</th>
                                    <th style={estiloCelula}>Preço</th>
                                    <th style={estiloCelula}>Status</th>
                                    <th style={estiloCelula}>Ações</th>
                                </tr>

                            </thead>

                            <tbody>

                                {servicos.map((servico) => (

                                    <tr key={servico.id}>

                                        <td style={estiloCelula}>
                                            {servico.id}
                                        </td>

                                        <td style={estiloCelula}>
                                            {servico.nome}
                                        </td>

                                        <td style={estiloCelula}>
                                            {servico.descricao || "-"}
                                        </td>

                                        <td style={estiloCelula}>
                                            {servico.duracao_minutos} min
                                        </td>

                                        <td style={estiloCelula}>
                                            {formatarPreco(servico.preco)}
                                        </td>

                                        <td style={estiloCelula}>
                                            {servico.ativo ? "Ativo" : "Inativo"}
                                        </td>

                                        <td style={estiloCelula}>

                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(servico)}
                                            >
                                                Editar
                                            </button>

                                            {" "}

                                            <button
                                                type="button"
                                                onClick={() => alterarStatusServico(servico)}
                                            >
                                                {servico.ativo ? "Desativar" : "Ativar"}
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                                {servicos.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            style={estiloCelula}
                                        >
                                            Nenhum serviço cadastrado.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </>

            )}

            {/* Modal de cadastro e edição */}

            {modalAberto && (

                <div style={estiloFundoModal}>

                    <div style={estiloModal}>

                        <h2>
                            {idEditando !== null
                                ? "Editar serviço"
                                : "Novo serviço"}
                        </h2>

                        <form onSubmit={salvarServico}>

                            <div style={estiloCampo}>

                                <label>Nome *</label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome do serviço"
                                    required
                                    style={estiloInput}
                                />

                            </div>

                            <div style={estiloCampo}>

                                <label>Descrição</label>

                                <textarea
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descrição do serviço"
                                    rows={3}
                                    style={estiloInput}
                                />

                            </div>

                            <div style={estiloCampo}>

                                <label>Duração em minutos *</label>

                                <input
                                    type="number"
                                    value={duracao}
                                    onChange={(e) => setDuracao(e.target.value)}
                                    placeholder="Ex.: 30"
                                    min="1"
                                    step="1"
                                    required
                                    style={estiloInput}
                                />

                            </div>

                            <div style={estiloCampo}>

                                <label>Preço (R$) *</label>

                                <input
                                    type="number"
                                    value={preco}
                                    onChange={(e) => setPreco(e.target.value)}
                                    placeholder="Ex.: 45.00"
                                    min="0"
                                    step="0.01"
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
                                            ? "Atualizar serviço"
                                            : "Salvar serviço"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );
}

const estiloCelula: React.CSSProperties = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left"
};

const estiloTabela: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
};

const estiloBotao: React.CSSProperties = {
    padding: "10px 18px",
    marginTop: "15px",
    cursor: "pointer"
};

const estiloFundoModal: React.CSSProperties = {
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

const estiloModal: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#222"
};

const estiloCampo: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "15px"
};

const estiloInput: React.CSSProperties = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box"
};

const estiloBotoes: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px"
};
