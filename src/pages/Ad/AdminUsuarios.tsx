
import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";

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

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarUsuarios() {
        try {
            setCarregando(true);
            setErro("");

            const resultado = await apiGet<RespostaUsuarios>(
                "/admin/usuarios"
            );

            if (resultado.status !== 1) {
                throw new Error(
                    resultado.mensagem || "Não foi possível listar os usuários."
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
        carregarUsuarios();
    }, []);

    return (
        <div style={{ padding: "30px" }}>

            <h1>Gerenciamento de usuários</h1>

            <p>Usuários cadastrados no BarberPro</p>

            {carregando && <p>Carregando usuários...</p>}

            {erro && (
                <p style={{ color: "red" }}>{erro}</p>
            )}

            {!carregando && !erro && (
                <>
                    <h3>Total de usuários: {usuarios.length}</h3>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: "20px"
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={estiloCelula}>ID</th>
                                    <th style={estiloCelula}>Nome</th>
                                    <th style={estiloCelula}>E-mail</th>
                                    <th style={estiloCelula}>Perfil</th>
                                    <th style={estiloCelula}>Status</th>
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
                                    </tr>
                                ))}

                                {usuarios.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
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

        </div>
    );
}

const estiloCelula: React.CSSProperties = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left"
};
