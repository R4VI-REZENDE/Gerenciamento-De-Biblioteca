const API_URL = "http://localhost:5109/api/Materiais";

const USAR_MOCK = false;

const MATERIAIS_INICIAIS = [
  { id: 1, tipo: "Livro", titulo: "Dom Casmurro", anoPublicacao: 1899, autor: "Machado de Assis", paginas: 256 },
  { id: 2, tipo: "Revista", titulo: "Superinteressante", anoPublicacao: 2024, edicao: 455, mesPublicacao: 3 },
  { id: 3, tipo: "Revista", titulo: "Piauí", anoPublicacao: 2023, edicao: 198, mesPublicacao: 11 },
];

function lerMock() {
  const salvo = localStorage.getItem("mock-materiais");
  return salvo ? JSON.parse(salvo) : MATERIAIS_INICIAIS;
}

function salvarMock(lista) {
  localStorage.setItem("mock-materiais", JSON.stringify(lista));
}


async function criarErroHttp(resposta) {
  const erro = new Error("Erro " + resposta.status);
  erro.detalhes = [];
  try {
    const corpo = await resposta.json();
    if (Array.isArray(corpo.erros)) {
      erro.detalhes = corpo.erros;
    } else if (corpo.mensagem) {
      erro.detalhes = [corpo.mensagem];
    }
  } catch (e) {
   
  }
  return erro;
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


async function buscarMaterialPorId(id) {
  if (USAR_MOCK) {
    const item = lerMock().find((material) => material.id === id);
    if (!item) {
      throw new Error("Erro 404");
    }
    return item;
  }

  const resposta = await fetch(API_URL + "/" + id);
  if (!resposta.ok) {
    throw await criarErroHttp(resposta);
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

async function atualizarMaterial(tipo, id, dados) {
  if (USAR_MOCK) {
    const lista = lerMock();
    const posicao = lista.findIndex((item) => item.id === id);
    if (posicao === -1) {
      throw new Error("Erro 404");
    }
    lista[posicao] = { ...lista[posicao], ...dados, id };
    salvarMock(lista);
    return lista[posicao];
  }

  const resposta = await fetch(API_URL + "/" + tipo + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    throw await criarErroHttp(resposta);
  }
  return resposta.json();
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


async function emprestarMaterial(id) {
  if (USAR_MOCK) {
    const lista = lerMock();
    const item = lista.find((material) => material.id === id);
    if (!item) {
      throw new Error("Erro 404");
    }
    if (item.tipo !== "Livro") {
      throw new Error("Erro 400");
    }
    return "O livro '" + item.titulo + "' foi emprestado por 14 dias.";
  }

  const resposta = await fetch(API_URL + "/" + id + "/emprestar", { method: "POST" });
  if (!resposta.ok) {
    throw await criarErroHttp(resposta);
  }
  const corpo = await resposta.json();
  return corpo.mensagem;
}
