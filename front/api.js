
const API_URL = "https://localhost:7000/api/Materiais";

const USAR_MOCK = true;

const MATERIAIS_INICIAIS = [
  { id: 1, tipo: "Livro", titulo: "Dom Casmurro", anoPublicacao: 1899, autor: "Machado de Assis", numeroPaginas: 256 },
  { id: 2, tipo: "Revista", titulo: "Superinteressante", anoPublicacao: 2024, numeroEdicao: 455, mesPublicacao: 3 },
  { id: 3, tipo: "Revista", titulo: "Piauí", anoPublicacao: 2023, numeroEdicao: 198, mesPublicacao: 11 },
];

function lerMock() {
  const salvo = localStorage.getItem("mock-materiais");
  return salvo ? JSON.parse(salvo) : MATERIAIS_INICIAIS;
}

function salvarMock(lista) {
  localStorage.setItem("mock-materiais", JSON.stringify(lista));
}

async function listarMateriais() {
  if (USAR_MOCK) {
    return lerMock();
  }

  const resposta = await fetch(API_URL);
  if (!resposta.ok) {
    throw new Error("Erro " + resposta.status);
  }
  return resposta.json();
}

async function cadastrarMaterial(tipo, dados) {
  if (USAR_MOCK) {
    const lista = lerMock();
    const novoId = lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
    const nomeTipo = tipo === "livro" ? "Livro" : "Revista";
    lista.push({ id: novoId, tipo: nomeTipo, ...dados });
    salvarMock(lista);
    return;
  }

  const resposta = await fetch(API_URL + "/" + tipo, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    throw new Error("Erro " + resposta.status);
  }
}

async function excluirMaterial(id) {
  if (USAR_MOCK) {
    const lista = lerMock();
    const restantes = lista.filter((item) => item.id !== id);
    if (restantes.length === lista.length) {
      throw new Error("Erro 404");
    }
    salvarMock(restantes);
    return;
  }

  const resposta = await fetch(API_URL + "/" + id, { method: "DELETE" });
  if (!resposta.ok) {
    throw new Error("Erro " + resposta.status);
  }
}