
import { useState } from "react";

import { criarAgendamento } from "../../services/agendamentos";

import type {
  CriarAgendamentoDTO,
} from "../../type/agendamento";

interface Props {
  servico: {
    id: number;
    nome: string;
  };
  profissionalId: number;
  dataSelecionada: string;
  horarioSelecionado: string;
}

export default function FormularioAgendamento({
  servico,
  profissionalId,
  dataSelecionada,
  horarioSelecionado,
}: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function confirmarAgendamento() {
    if (!horarioSelecionado) {
      alert("Selecione um horário.");
      return;
    }

    if (!nome.trim() || !telefone.trim()) {
      alert("Informe seu nome e telefone.");
      return;
    }

    const dados: CriarAgendamentoDTO = {
      servico_id: servico.id,
      profissional_id: profissionalId,
      data: dataSelecionada,
      horario: horarioSelecionado,
      cliente: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      },
    };

    try {
      setEnviando(true);

      const resultado = await criarAgendamento(dados);

      alert(resultado.message);

      console.log("Agendamento criado:", resultado);
    } catch (erro) {
      console.error("Erro ao agendar:", erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível realizar o agendamento."
      );
    } finally {
      setEnviando(false);
    }
  }

//   return (
//     <form
//       onSubmit={(evento) => {
//         evento.preventDefault();
//         void confirmarAgendamento();
//       }}
//     >
//       <h2>Agendar: {servico.nome}</h2>

//       <label>
//         Nome
//         <input
//           value={nome}
//           onChange={(e) => setNome(e.target.value)}
//           required
//         />
//       </label>

//       <label>
//         Telefone
//         <input
//           value={telefone}
//           onChange={(e) => setTelefone(e.target.value)}
//           required
//         />
//       </label>

//       <label>
//         E-mail
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </label>

//       <p>Data: {dataSelecionada}</p>
//       <p>Horário: {horarioSelecionado}</p>

//       <button type="submit" disabled={enviando}>
//         {enviando ? "Enviando..." : "Confirmar agendamento"}
//       </button>
//     </form>
//   );
}
