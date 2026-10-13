import { useState } from "react";
import "./css/Calendario.css";
import { useNavigate } from "react-router-dom";

export default function Calendario() {
  const navigate = useNavigate();
  const [dataSelecionada, setDataSelecionada] = useState("");

  const handleContinuar = () => {
    if (!dataSelecionada) {
      alert("Selecione uma data");
      return;
    }

    console.log("Data:", dataSelecionada);

    // futuramente:
    navigate("/horarios");
  };

  return (
    <div className="calendario-container">
      <div className="calendario-card">
        <h1>Escolha uma Data</h1>

        <p>
          Selecione o dia desejado para seu atendimento
        </p>

        <div className="campo-data">
          <label>Data do Agendamento</label>

          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) =>
              setDataSelecionada(e.target.value)
            }
          />
        </div>

        <button onClick={handleContinuar}>
          Ver Horários Disponíveis
        </button>
      </div>
    </div>
  );
}