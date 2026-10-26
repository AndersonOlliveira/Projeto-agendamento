
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';

interface NavbarIndexProps {
  isLoggedIn: boolean;
  // onLogout: boolean;
}

function NavbarIndex({ isLoggedIn, onLogout }:NavbarIndexProps) {
return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        {/* <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand> */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link> */}
           
          </Nav>
           <Nav>
          
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
           
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarIndex;