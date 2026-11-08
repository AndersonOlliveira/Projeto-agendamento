import "./css/Servicos.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { l_servicos } from "../services/servicos";
import type { Servico } from "../type/servicos";

export default function Servicos() {
  const navigate = useNavigate();
  // const servicos = [
  //   {
  //     id: 1,
  //     nome: "Corte Masculino",
  //     valor: "R$ 35,00",
  //     duracao: "40 min",
  //   },
  //   {
  //     id: 2,
  //     nome: "Barba",
  //     valor: "R$ 20,00",
  //     duracao: "20 min",
  //   },
  //   {
  //     id: 3,
  //     nome: "Corte + Barba",
  //     valor: "R$ 50,00",
  //     duracao: "60 min",
  //   },
  //   {
  //     id: 4,
  //     nome: "Sobrancelha",
  //     valor: "R$ 15,00",
  //     duracao: "15 min",
  //   },
  // ];

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  
  useEffect(() => {

        l_servicos()
            .then((result) => {
               if(result.status == 1 ){
              setServicos(result.dados)
               }
            })
            .catch((error) => setErro(error.message))
            .finally(() => setCarregando(false));

    }, []);

    console.warn('CHAMANDO OS DADOS???');
    if (carregando) return <p>Carregando serviços...</p>;

    if (erro) return <p>{erro}</p>;

  const selecionarServico = (id: number, nome: string) => {
    console.log("Serviço selecionado:", id);
 

    // futuramente navegar para:
    { 
       navigate("/agendamento", {
      state: {
        servicoId: id,
        servicoNome: nome,
      },
    });
  };
  };

  return (
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
              <span>{servico.preco}</span>
              <span>{servico.duracao_minutos}</span>
            </div>

            <button
              onClick={() => selecionarServico(servico.id,servico.nome)}
            >
              Selecionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}