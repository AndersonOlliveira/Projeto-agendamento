
import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost, apiPut, apiPatch } from "../../services/api";

interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
    criado_em: string;
}

interface RespostaUsuarios {
    status: number;
    mensagem?: string;
    usuarios: Usuario[];
}

interface RespostaCadastro {
    status: number;
    mensagem?: string;
}

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Controle do modal
    const [modalAberto, setModalAberto] = useState(false);

    // Dados do formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [perfil, setPerfil] = useState("usuario");

    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");

    const [idEditando, setIdEditando] = useState<number | null>(null);

    async function carregarUsuarios() {
        try {
            setCarregando(true);
            setErro("");

            const resultado = await apiGet<RespostaUsuarios>(
                "/admin/usuarios"
            );

            if (resultado.status !== 1) {
                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível listar os usuários."
                );
            }

            setUsuarios(resultado.usuarios || []);

        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar usuários."
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void carregarUsuarios();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    function abrirEdicao(usuario: Usuario) {
    setIdEditando(usuario.id);

    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha("");
    setPerfil(usuario.perfil);

    setErroFormulario("");
    setModalAberto(true);
}
async function alterarStatusUsuario(usuario: Usuario) {
    const novoStatus = !usuario.ativo;
    const acao = novoStatus ? "ativar" : "desativar";

    const confirmar = window.confirm(
        `Deseja realmente ${acao} o usuário ${usuario.nome}?`
    );

    if (!confirmar) {
        return;
    }

    try {
        const resultado = await apiPatch<RespostaCadastro>(
            `/admin/usuarios/${usuario.id}/status`,
            {
                ativo: novoStatus
            }
        );

        if (resultado.status !== 1) {
            throw new Error(
                resultado.mensagem || `Não foi possível ${acao} o usuário.`
            );
        }

        await carregarUsuarios();

    } catch (error) {
        setErro(
            error instanceof Error
                ? error.message
                : `Erro ao ${acao} usuário.`
        );
    }
}
    function abrirModal() {
        setNome("");
        setEmail("");
        setSenha("");
        setPerfil("usuario");
        setErroFormulario("");
        setModalAberto(true);
    }

    function fecharModal() {
        if (salvando) return;

        setModalAberto(false);
        setErroFormulario("");
    }

    async function cadastrarUsuario(e: FormEvent) {
    e.preventDefault();
    setErroFormulario("");

    if (!nome.trim() || !email.trim()) {
        setErroFormulario("Preencha nome e e-mail.");
        return;
    }

    if (idEditando === null && !senha) {
        setErroFormulario("Informe a senha.");
        return;
    }

    if (senha && senha.length < 8) {
        setErroFormulario(
            "A senha deve possuir pelo menos 8 caracteres."
        );
        return;
    }

    try {
        setSalvando(true);

        if (idEditando === null) {

            // Cadastro
            const resultado = await apiPost<RespostaCadastro>(
                "/admin/usuarios",
                {
                    nome: nome.trim(),
                    email: email.trim(),
                    senha,
                    perfil
                }
            );

            if (resultado.status !== 1) {
                throw new Error(
                    resultado.mensagem || "Erro ao cadastrar usuário."
                );
            }

        } else {

            // Edição
            const resultado = await apiPut<RespostaCadastro>(
                `/admin/usuarios/${idEditando}`,
                {
                    nome: nome.trim(),
                    email: email.trim(),
                    senha,
                    perfil
                }
            );

            if (resultado.status !== 1) {
                throw new Error(
                    resultado.mensagem || "Erro ao atualizar usuário."
                );
            }
        }

        setModalAberto(false);
        setIdEditando(null);

        setNome("");
        setEmail("");
        setSenha("");
        setPerfil("usuario");

        await carregarUsuarios();

    } catch (error) {
        setErroFormulario(
            error instanceof Error
                ? error.message
                : "Erro ao salvar usuário."
        );
    } finally {
        setSalvando(false);
    }
}

    return (
        <div style={{ padding: "30px" }}>

            <h1>Gerenciamento de usuários</h1>

            <p>Usuários cadastrados no BarberPro</p>

            <button
                type="button"
                onClick={abrirModal}
                style={estiloBotao}
            >
                + Novo usuário
            </button>

            {carregando && <p>Carregando usuários...</p>}

            {erro && (
                <p style={{ color: "red" }}>{erro}</p>
            )}

            {!carregando && !erro && (
                <>
                    <h3>Total de usuários: {usuarios.length}</h3>

                    <div style={{ overflowX: "auto" }}>
                        <table style={estiloTabela}>
                            <thead>
                               
                                <tr>
                                    <th style={estiloCelula}>ID</th>
                                    <th style={estiloCelula}>Nome</th>
                                    <th style={estiloCelula}>E-mail</th>
                                    <th style={estiloCelula}>Perfil</th>
                                    <th style={estiloCelula}>Status</th>
                                     <th style={estiloCelula}>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td style={estiloCelula}>
                                            {usuario.id}
                                        </td>

                                        <td style={estiloCelula}>
                                            {usuario.nome}
                                        </td>

                                        <td style={estiloCelula}>
                                            {usuario.email}
                                        </td>

                                        <td style={estiloCelula}>
                                            {usuario.perfil}
                                        </td>

                                        <td style={estiloCelula}>
                                            {usuario.ativo ? "Ativo" : "Inativo"}
                                        </td>
                                        <td style={estiloCelula}>
                                               <button
                                                type="button"
                                                onClick={() => abrirEdicao(usuario)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                            type="button"
                                            onClick={() => alterarStatusUsuario(usuario)}
                                        >
                                            {usuario.ativo ? "Desativar" : "Ativar"}
                                        </button>
                                        </td>
                                    </tr>
                                ))}

                                {usuarios.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={estiloCelula}
                                        >
                                            Nenhum usuário cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Modal de cadastro */}
            {modalAberto && (
                <div style={estiloFundoModal}>
                    <div style={estiloModal}>

                       <h2> {idEditando !== null ? "Editar usuário" : "Novo usuário"}</h2>

                        <form onSubmit={cadastrarUsuario}>

                            <div style={estiloCampo}>
                                <label>Nome</label>

                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome completo"
                                    required
                                    style={estiloInput}
                                />
                            </div>

                            <div style={estiloCampo}>
                                <label>E-mail</label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-mail do usuário"
                                    required
                                    style={estiloInput}
                                />
                            </div>

                            <div style={estiloCampo}>
                                <label>Senha</label>

                               <input
                                        type="password"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        placeholder={
                                            idEditando !== null
                                                ? "Deixe em branco para manter a senha atual"
                                                : "Mínimo de 8 caracteres"
                                        }
                                        minLength={8}
                                        style={estiloInput}
                                    />
                            </div>

                            <div style={estiloCampo}>
                                <label>Perfil</label>

                                <select
                                    value={perfil}
                                    onChange={(e) => setPerfil(e.target.value)}
                                    style={estiloInput}
                                >
                                    <option value="usuario">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
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
                                ? "Atualizar usuário"
                                : "Salvar usuário"}
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
