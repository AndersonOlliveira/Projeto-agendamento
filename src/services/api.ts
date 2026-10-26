
const API_URL = import.meta.env.VITE_API_URL;

export async function apiPost<T>(
  endpoint: string,
  dados: unknown
): Promise<T> {

  console.log('DADOS VINDO AQUI ???',dados);


  const resposta = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(dados),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.message || "Erro ao comunicar com a API."
    );
  }

  return resultado as T;
}




export async function apiGet<T>(
  endpoint: string,
  dados?: Record<string, unknown>
): Promise<T> {
  const params = new URLSearchParams();

  if (dados && typeof dados === "object") {
    Object.entries(dados).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const url = params.toString()
    ? `${API_URL}${endpoint}?${params.toString()}`
    : `${API_URL}${endpoint}`;

  const resposta = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.message || "Erro ao comunicar com a API."
    );
  }

  return resultado as T;
}
