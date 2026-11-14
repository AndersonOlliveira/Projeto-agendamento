import "./css/Clientes.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { criarAgendamento } from "../services/agendamentos";
import type { DadosAgendamento } from "../type/agendamento";





export default function DadosCliente() {
    const location = useLocation();
    const navigate = useNavigate();

    const dados = location.state as DadosAgendamento | null;

    console.log("PEGANOD OS DADOS VINDO DO LACATION STATE " ,  dados);

    const [cliente, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [proff, setProff] = useState<RespostaAgendamento[]>([]);

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
    // Validação opcional
    if (!cliente) {
        setErro("Nome do cliente não informado.");
        return;
    }

    // Configura os estados de carregamento
    setCarregando(true);
    setErro("");

    // Monta o objeto combinado com a nova interface
    const dadosParaEnviar = {
        servico_id: dados.servicoId,
        servicoNome: dados.servicoNome,
        horario: dados.horario,
        inicio: dados.horario.inicio,
        profissional_id: dados.profissionalId,
        profissionalNome: dados.profissionalNome,
        data: dados.data,
        cliente: { nome: cliente, email, telefone }
    } as unknown as DadosAgendamento;

    // CHAMA A API DIRETO (Sem useEffect aqui dentro!)
    criarAgendamento(dadosParaEnviar)
      .then((result) => {
          if (result.status) {
              setProff(result.dados);
          } else {
              setProff([]);
              setErro("Nenhum profissional encontrado para este serviço.");
          }
      })
      .catch((error) => {
          setErro(error.message || "Erro ao carregar profissionais.");
      })
      .finally(() => {
          setCarregando(false);
      });
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
                    value={cliente}
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
                <div className="botoes-acoes">
                    <button
                        type="button"
                        className="btn-voltar"
                        onClick={() => navigate("/agendamento", {
                            state: {
                                servicoId: dados.servicoId,
                                servicoNome: dados.servicoNome
                            }
                        })}
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        className="btn-confirmar"
                        onClick={confirmarAgendamento}
                    >
                        Confirmar agendamento
                    </button>
                </div>
            </div>
        </div>
    );
}
