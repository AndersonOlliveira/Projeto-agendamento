
import { apiPost } from "../../services/api";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErro("");

        if (!email || !senha) {
            setErro("Informe e-mail e senha.");
            return;
        }

        try {
            setCarregando(true);

            const resultado = await apiPost<{
                status: number;
                mensagem: string;
                usuario?: {
                    id: number;
                    nome: string;
                    email: string;
                    perfil: string;
                };
            }>("/admin/login", {
                email,
                senha
            });

            if (resultado.status !== 1) {
                setErro(resultado.mensagem || "E-mail ou senha inválidos.");
                return;
            }

            navigate("/admin/usuarios");

        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao realizar login."
            );

        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1>BarberPro</h1>

                <p>Área administrativa</p>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>E-mail</label>

                        <input
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Senha</label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>

                    {erro && (
                        <p style={{ color: "red" }}>
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={carregando}
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>

                </form>

            </div>
        </div>
    );
}
