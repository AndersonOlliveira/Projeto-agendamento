
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiGet } from "../services/api";

export default function ProtectedAdminRoute() {
    const [autorizado, setAutorizado] = useState(false);
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
        async function verificarSessao() {
            try {
                const resultado = await apiGet<{
                    status: number;
                    usuario: {
                        id: number;
                        nome: string;
                        email: string;
                        perfil: string;
                    };
                }>("/admin/me");

                if (
                    resultado.status === 1 &&
                    resultado.usuario.perfil === "admin"
                ) {
                    setAutorizado(true);
                } else {
                    setAutorizado(false);
                }

            } catch (error) {
                setAutorizado(false);

            } finally {
                setVerificando(false);
            }
        }

        verificarSessao();
    }, []);

    if (verificando) {
        return <p>Verificando autenticação...</p>;
    }

    if (!autorizado) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
