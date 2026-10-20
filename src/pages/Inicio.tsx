import "./css/Servicos.css";
import { useNavigate } from "react-router-dom";
import ServicoAccordion from "../components/ServicoAccordion";
import NavbarIndex from "../components/NavbarSing"


export default function Servicos() {

    const navigate = useNavigate();

  const servicos = [
    {
      id: 1,
      nome: "Corte Masculino",
      valor: "R$ 35,00",
      duracao: "40 min",
    },
    {
      id: 2,
      nome: "Barba",
      valor: "R$ 20,00",
      duracao: "20 min",
    },
    {
      id: 3,
      nome: "Corte + Barba",
      valor: "R$ 50,00",
      duracao: "60 min",
    },
    {
      id: 4,
      nome: "Sobrancelha",
      valor: "R$ 15,00",
      duracao: "15 min",
    },
  ];

  const selecionarServico = (id:number, nome:string) => {
    navigate("/agendamento", {
      state: {
        servicoId: id,
        servicoNome: nome,
      },
    });
  };

  return (
     <>
      <NavbarIndex isLoggedIn={false} />
    
    <div className="servicos-container">
      <div className="servicos-header">
        <h1>Escolha seu Serviço</h1>
        <p>Selecione o serviço desejado para continuar</p>
      </div>

      <div className="servicos-grid">
        {servicos.map((servico) => (
          <div key={servico.id} className="servico-card">
            <h2>{servico.nome}</h2>

            <div className="servico-info">
              <span>{servico.valor}</span>
              <span>{servico.duracao}</span>
            </div>

            <button
              onClick={() =>
                selecionarServico(servico.id, servico.nome)
              }
             >
              Selecionar
            </button>
             <ServicoAccordion servico={servico}  />
          </div>
        ))}
      </div>
    </div>
    </>
  );
  
}