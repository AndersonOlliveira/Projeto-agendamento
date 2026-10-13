import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import "../pages/css/Horarios.css";

// import { useLocation } from "react-router-dom";
import {horariosDisponiveis} from "./ListHorarios";

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

  const confirmarAgendamento = () => {
    if (!horarioSelecionado) {
      alert("Selecione um horário.");
      return;
    }

    alert(
      `Agendamento confirmado para ${servico.nome} às ${horarioSelecionado}`
    );

    console.log({
      servico,
      horarioSelecionado,
    });
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