import { Link } from 'react-router-dom';

export function Navbar({ isLoggedIn, onLogout }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-gray-800">
        <Link to="/">MeuApp</Link>
      </div>

      {/* Links de Navegação */}
      <div className="hidden md:flex space-x-6 text-gray-600">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/sobre" className="hover:text-blue-600">Sobre</Link>
      </div>

      {/* Botões de Autenticação */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Minha Conta
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}