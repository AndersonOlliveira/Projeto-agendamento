import { useState } from "react";
import "../pages/css/Horarios.css";
import Accordion from "react-bootstrap/Accordion";
import {horariosDisponiveis} from "./ListHorarios";
import { criarAgendamento } from "../services/agendamentos";

// import { useLocation } from "react-router-dom";

interface Servico {
  id: number;
  nome: string;
  //   preco: number;
}

type ServicoAccordionProps = {
  servico: Servico;
};

export default function ServicoAccordion({ servico }: ServicoAccordionProps) {
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

 

  const confirmarAgendamento = async () => {
    if (!horarioSelecionado) {
      alert("Selecione um horário.");
      return;
    }

    alert(
      `Agendamento confirmado para ${servico.nome} às ${horarioSelecionado}`
    );

    console.warn('TENHO O CLICK AQUI???');
    
    
    console.log({
      servico,
      horarioSelecionado,
    });

    try{ 

     const dados = {
      servico_id: servico.id,
      horario: horarioSelecionado,
    };

    console.log("Dados enviados:", dados);

    const resultado = await criarAgendamento(dados);

    if (resultado.success) {
      alert(
        `Agendamento confirmado para ${servico.nome} às ${horarioSelecionado}`
      );

      console.log("Resposta da API:", resultado);
    } else {
      alert(resultado.message);
    }
  } catch (erro) {
    console.error("Erro ao realizar agendamento:", erro);

    alert(
      erro instanceof Error
        ? erro.message
        : "Não foi possível realizar o agendamento."
    );
  }
  };


    return (
    <Accordion className="mt-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          Mais informações
        </Accordion.Header>

        <Accordion.Body>
          
            {/* <strong>Horários</strong> {servico.valor} */}
        
            <div className="horarios-card">
             <h1>Horários Disponíveis</h1>
            <div className="horarios-grid">
              {horariosDisponiveis.map((hora) => (
            <button
              key={hora}
              className={`horario-btn ${
                horarioSelecionado === hora
                  ? "selecionado"
                  : ""
              }`}
              onClick={() =>
                setHorarioSelecionado(hora)
              }
            >
              {hora}
            </button>
          ))}
        </div>

        <button
          className="btn-confirmar"
          onClick={confirmarAgendamento}
        >
          Confirmar Agendamento
        </button>
        </div>
          

          <p>
            {/* <strong>Duração:</strong> {servico.duracao} */}
            <strong>Duração:</strong> 
          </p>

          <p>
            Serviço profissional realizado por barbeiros
            especializados.
          </p>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}