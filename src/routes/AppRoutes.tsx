import { BrowserRouter, Routes, Route } from "react-router-dom";
// import {Home} from "../pages/Home";
import Login from "../pages/Login";
import Inicio from "../pages/Inicio";
import Horarios from "../pages/Horarios";
import Servicos from "../pages/Servicos";
import {Produtos} from "../pages/Produtos";
import Cadastros from "../pages/Cadastros";
import Calendario from "../pages/Calendario";
import Clientes from "../pages/DadosCliente";
import Mgendamento from "../pages/ClienteAgendamentos";
import AdminLogin from "../pages/Ad/AdminLogin";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminUsuarios from "../pages/Ad/AdminUsuarios";
import AdminAgendamentos from "../pages/Ad/AdminAgendamentos";
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
        <Route  path="/meu-agendamento/:token" element={<Mgendamento />}/>
        {/* admim */}
        <Route path="/admin/login" element={<AdminLogin />} />
         <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/agendamentos" element={<AdminAgendamentos />} />
      </Route>
        
      </Routes>
    </BrowserRouter>
  );
}