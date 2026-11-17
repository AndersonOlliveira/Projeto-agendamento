
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiPost } from "../../services/api";
import "./cssLayout/AdminLayout.css";

export default function AdminLayout() {
    const [expandido, setExpandido] = useState(true);
    const [menuMobile, setMenuMobile] = useState(false);
    const [saindo, setSaindo] = useState(false);

    const navigate = useNavigate();


    type IconName =
    | "calendar"
    | "users"
    | "scissors"
    | "settings"
    | "globe"
    | "logout";

    function AdminIcon({ name }: { name: IconName }) {
    const paths: Record<IconName, React.ReactNode> = {
        calendar: (
            <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" />
                <path d="M8 15h2M14 15h2" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),
        scissors: (
            <>
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="m8.1 8.1 12.8 12.8M14 6l-3 3M8.1 15.9 20 4" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" transform="translate(-1 -1)" />
            </>
        ),
        globe: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17l5-5-5-5M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </>
        )
    };

    return (
        <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

    const itensMenu = [
    {
        nome: "Agendamentos",
        caminho: "/admin/agendamentos",
        icone: "calendar" as IconName
    },
    {
        nome: "Profissionais",
        caminho: "/admin/profissionais",
        icone: "users" as IconName
    },
    {
        nome: "Serviços",
        caminho: "/admin/servicos",
        icone: "scissors" as IconName
    },
    {
        nome: "Usuários",
        caminho: "/admin/usuarios",
        icone: "settings" as IconName
    }
];

    async function sair() {
        if (saindo) return;

        try {
            setSaindo(true);

            await apiPost("/admin/logout", {});

            navigate("/admin/login", { replace: true });

        } catch (error) {
            console.error("Erro ao sair:", error);
            alert("Não foi possível encerrar a sessão.");

        } finally {
            setSaindo(false);
        }
    }

    return (
        <div className="admin-container">

            {/* Sobreposição do menu mobile */}
            {menuMobile && (
                <div
                    className="admin-overlay"
                    onClick={() => setMenuMobile(false)}
                />
            )}

            {/* Menu lateral */}
            <aside
                className={`admin-sidebar ${
                    expandido ? "expandido" : "recolhido"
                } ${menuMobile ? "mobile-aberto" : ""}`}
            >

                {/* Cabeçalho */}
                <div className="admin-sidebar-header">

                    {expandido && (
                        <strong className="admin-logo">
                            BARBERPRO
                        </strong>
                    )}

                    <button
                        type="button"
                        className="admin-menu-toggle"
                        onClick={() => setExpandido(!expandido)}
                        title={expandido ? "Recolher menu" : "Expandir menu"}
                    >
                        ☰
                    </button>

                </div>

                {/* Navegação */}
                <nav className="admin-navigation">

                    {itensMenu.map((item) => (
                        <NavLink
                            key={item.caminho}
                            to={item.caminho}
                            onClick={() => setMenuMobile(false)}
                            title={!expandido ? item.nome : ""}
                            className={({ isActive }) =>
                                `admin-link ${isActive ? "ativo" : ""}`
                            }
                        >

                         <span className="admin-icon">
                              <AdminIcon name={item.icone} />
                        
                        </span>

                            {expandido && (
                                <span>{item.nome}</span>
                            )}

                        </NavLink>
                    ))}

                </nav>

                {/* Rodapé */}
                <div className="admin-sidebar-footer">

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-link-footer"
                        title={!expandido ? "Site público" : ""}
                    >
                        <span className="admin-icon"> 
                             <AdminIcon name="globe" />
                        </span>

                        {expandido && (
                            <span>Site público</span>
                        )}
                    </a>

                    <button
                        type="button"
                        onClick={sair}
                        disabled={saindo}
                        className="admin-button-logout"
                        title={!expandido ? "Sair" : ""}
                    >
                        <span className="admin-icon">
                             <AdminIcon name="logout" />
                         </span>

                        {expandido && (
                            <span>
                                {saindo ? "Saindo..." : "Sair"}
                            </span>
                        )}
                    </button>

                </div>

            </aside>

            {/* Conteúdo principal */}
            <main
                className={`admin-content ${
                    expandido
                        ? "menu-expandido"
                        : "menu-recolhido"
                }`}
            >

                {/* Cabeçalho exclusivo para celular */}
                <header className="admin-mobile-header">

                    <button
                        type="button"
                        className="admin-mobile-button"
                        onClick={() => setMenuMobile(true)}
                    >
                        ☰
                    </button>

                    <strong>BARBERPRO</strong>

                </header>

                {/* Páginas administrativas */}
                <div className="admin-content-area">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}
