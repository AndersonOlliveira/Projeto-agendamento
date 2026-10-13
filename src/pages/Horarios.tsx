import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./css/Horarios.css";

export default function Horarios() {
  const location = useLocation();

  const servico = location.state?.servicoNome || "Serviço";

  const horariosDisponiveis = [
    "08:00",
    "08:40",
    "09:20",
    "10:00",
    "10:40",
    "11:20",
    "13:00",
    "13:40",
    "14:20",
    "15:00",
    "15:40",
    "16:20",
  ];

  const [horarioSelecionado, setHorarioSelecionado] =
    useState("");

  const confirmarAgendamento = () => {
    if (!horarioSelecionado) {
      alert("Selecione um horário.");
      return;
    }

    alert(
      `Agendamento confirmado para ${horarioSelecionado}`
    );

    console.log({
      servico,
      horarioSelecionado,
    });
  };

  return (
    <div className="horarios-container">
      <div className="horarios-card">
        <h1>Horários Disponíveis</h1>

        <p>
          Serviço selecionado:
          <strong> {servico}</strong>
        </p>

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
    </div>
  );
}