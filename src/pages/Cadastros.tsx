import { useState } from "react";
import { Link } from "react-router-dom";
import "./css/Cadastro.css";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      nome,
      telefone,
      email,
      senha,
      confirmarSenha,
    });
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h1>BarberPro</h1>
        <p>Crie sua conta e agende seu horário</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome Completo</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Telefone</label>
            <input
              type="text"
              placeholder="(19) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

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
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Confirmar Senha</label>
            <input
              type="password"
              placeholder="Repita sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-cadastrar">
            Criar Conta
          </button>
        </form>

        <div className="links">
          <span>Já possui conta?</span>
          <Link to="/login"> Entrar</Link>
        </div>
      </div>
    </div>
  );
}