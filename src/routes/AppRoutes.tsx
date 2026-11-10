import { BrowserRouter, Routes, Route } from "react-router-dom";
// import {Home} from "../pages/Home";
import {Produtos} from "../pages/Produtos";
import Login from "../pages/Login";
import Cadastros from "../pages/Cadastros";
import Servicos from "../pages/Servicos";
import Calendario from "../pages/Calendario";
import Horarios from "../pages/Horarios";
import Clientes from "../pages/DadosCliente";
import Inicio from "../pages/Inicio";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/cadastro" element={<Cadastros />} />
        <Route path="/login" element={<Login />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/agendamento" element={<Calendario />}/>
        <Route path="/horarios" element={<Horarios />}/>
        <Route path="/preenchimento-dados" element={<Clientes />}/>
      </Routes>
    </BrowserRouter>
  );
}