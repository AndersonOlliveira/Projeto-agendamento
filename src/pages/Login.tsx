import { useState } from "react";
import validarCampos from "../function/validados";
import { Link, useNavigate } from "react-router-dom";
import "./css/Login.css";

export default function Login() {
  const navigate = useNavigate();
 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      email,
      senha,
    });

    validarCampos(email, senha);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>BarberPro</h1>
        <p>Entre para realizar seus agendamentos</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <div className="links">
          <Link to="/cadastro">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}