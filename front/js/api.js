// Toda a comunicação com a API passa por este arquivo.
// Se a porta mudar, altere somente a constante abaixo.
const API_URL = "http://localhost:5109/api/Materiais";

// Lê o corpo de uma resposta de erro e monta um Error com:
//   erro.status   -> código HTTP (0 quando a API nem respondeu)
//   erro.detalhes -> lista de mensagens vindas da API
async function criarErroHttp(resposta) {
  const erro = new Error("Erro " + resposta.status);
  erro.status = resposta.status;
  erro.detalhes = [];

  try {
    const corpo = await resposta.json();
    if (Array.isArray(corpo.erros)) {
      erro.detalhes = corpo.erros;
    } else if (corpo.mensagem) {
      erro.detalhes = [corpo.mensagem];
    }
  } catch (e) {
    // corpo vazio ou que não é JSON: segue só com o status
  }

  return erro;
}

function criarErroDeRede() {
  const erro = new Error("API indisponível");
  erro.status = 0;
  erro.detalhes = [];
  return erro;
}

// Faz a requisição e lança o erro padronizado quando a resposta não for 2xx.
async function requisitar(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, opcoes);
  } catch (e) {
    throw criarErroDeRede();
  }

  if (!resposta.ok) {
    throw await criarErroHttp(resposta);
  }
  return resposta;
}

function opcoesJson(metodo, dados) {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  };
}

// ---------- Endpoints ----------

async function listarMateriais() {
  const resposta = await requisitar("");
  return resposta.json();
}

async function buscarMaterialPorId(id) {
  const resposta = await requisitar("/" + id);
  return resposta.json();
}

// tipo: "livro" ou "revista"
async function cadastrarMaterial(tipo, dados) {
  const resposta = await requisitar("/" + tipo, opcoesJson("POST", dados));
  return resposta.json();
}

async function atualizarMaterial(tipo, id, dados) {
  const resposta = await requisitar("/" + tipo + "/" + id, opcoesJson("PUT", dados));
  return resposta.json();
}

async function excluirMaterial(id) {
  await requisitar("/" + id, { method: "DELETE" });
}

// Devolve a mensagem de sucesso enviada pela API.
async function emprestarMaterial(id) {
  const resposta = await requisitar("/" + id + "/emprestar", { method: "POST" });
  const corpo = await resposta.json();
  return corpo.mensagem;
}
