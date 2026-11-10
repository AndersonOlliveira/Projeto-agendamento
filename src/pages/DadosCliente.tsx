
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

interface DadosAgendamento {
    servicoId: number;
    servicoNome: string;
    profissionalId: number;
    profissionalNome: string;
    data: string;
    horario: {
        inicio: string;
        fim: string;
        hora_inicio: string;
        hora_fim: string;
    };
}

export default function DadosCliente() {
    const location = useLocation();
    const navigate = useNavigate();

    const dados = location.state as DadosAgendamento | null;

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");

    if (!dados) {
        return (
            <div>
                <p>Dados do agendamento não encontrados.</p>
                <button onClick={() => navigate("/")}>
                    Voltar
                </button>
            </div>
        );
    }

    const confirmarAgendamento = () => {
        console.log("Agendamento:", dados);
        console.log("Cliente:", { nome, telefone, email });

        // Próxima etapa: enviar os dados para a API.
    };

    return (
        <div className="dados-cliente-container">
            <h1>Confirme seus dados</h1>

            <div className="resumo-agendamento">
                <h3>Resumo do agendamento</h3>

                <p>Serviço: {dados.servicoNome}</p>
                <p>Profissional: {dados.profissionalNome}</p>
                <p>Data: {dados.data}</p>
                <p>Horário: {dados.horario.hora_inicio}</p>
            </div>

            <div className="form-cliente">
                <h3>Seus dados</h3>

                <label>Nome completo</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <label>Telefone</label>
                <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                />

                <label>E-mail</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="button"
                    onClick={confirmarAgendamento}
                >
                    Confirmar agendamento
                </button>
            </div>
        </div>
    );
}
