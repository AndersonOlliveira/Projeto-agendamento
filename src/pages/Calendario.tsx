import "./css/Calendario.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { l_proff } from "../services/profissionais";
import type { Profissionais } from "../type/profissionais";
// export default function Calendario() {
//   const navigate = useNavigate();
//   const [dataSelecionada, setDataSelecionada] = useState("");

//   console.log('SAINDO NA TELA DE CALENDARIO? ');

//   const handleContinuar = () => {
//     if (!dataSelecionada) {
//       alert("Selecione uma data");
//       return;
//     }

//     interface DadosNavegacao {
//     servicoId: number;
//     servicoNome: string;
// }

//     console.log("Data:", dataSelecionada);

//     // futuramente:
//     // navigate("/horarios");
//   };

interface DadosNavegacao {
    servicoId: number;
    servicoNome: string;
}

 export default function Calendario() {
    const navigate = useNavigate();
    const location = useLocation();
    const [proff, setProff] = useState<Profissionais[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [profissionalSelecionado, setProfissionalSelecionado] = useState<number | null>(null);


   

    const dados = location.state as DadosNavegacao | null;

    const hoje = new Date();
    const dataHoje = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");

    const [dataSelecionada, setDataSelecionada] = useState(dataHoje);
    const servicoId = dados?.servicoId;
    const servicoNome = dados?.servicoNome;

      useEffect(() => {
          
          if (!servicoId) {
              setErro("Serviço não informado.");
              setCarregando(false);
              return;
          }
          setCarregando(true);
          setErro("");
          
          l_proff(servicoId)
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

          }, [servicoId]);

    // Protege o acesso caso a página seja aberta diretamente.
    if (!dados || !servicoId) {
        return (
            <div className="calendario-container">
                <div className="calendario-card">
                    <h2>Serviço não selecionado</h2>
                    <button onClick={() => navigate("/")}>
                        Escolher serviço
                    </button>
                </div>
            </div>
        );
    }
    
    console.log(profissionalSelecionado,dataSelecionada,servicoId)
    if (carregando) return <p>Carregando serviços...</p>;
     if (erro) return <p>{erro}</p>;

   
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataSelecionada(e.target.value);
    };

    

    return (
        <div className="calendario-container">
            <div className="calendario-card">

                <h1>Agende seu horário</h1>

                <p>Escolha seu profissional e horário</p>

                <div className="servico-selecionado">
                    <h3>Serviço selecionado</h3>
                    <strong>{servicoNome}</strong>
                </div>

                <div className="campo-data">
                    <label>Data do atendimento</label>

                    <input
                        type="date"
                        value={dataSelecionada}
                        min={dataHoje}
                        onChange={handleDataChange}
                    />
                </div>

               <div className="profissionais-container">

    <h3>Escolha seu profissional</h3>

    {proff.map((profissional) => (

        <div
            key={profissional.id}
            className={
                profissionalSelecionado === profissional.id
                    ? "profissional-item selecionado"
                    : "profissional-item"
            }
            onClick={() => {
                console.log("Profissional selecionado:", profissional.id);
                setProfissionalSelecionado(profissional.id);
            }}
        >
            <span style={{ color: "blue" }}>{profissional.nome}</span>

            {profissionalSelecionado === profissional.id && (
                <span> ✓ Selecionado</span>
            )}
              </div>

    ))}

</div>

                <div className="horarios-container">
                    <h3>Horários disponíveis</h3>

                    {/* Aqui vamos carregar os horários pela API */}
                </div>

            </div>
        </div>
    );
}
