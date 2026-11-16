// Redirecionamento de páginas
const livros = document.querySelector("#livros");
const revistas = document.querySelector("#revistas");
const cadastrarItem = document.querySelector("#cadastrar");
const contadorDeItens = document.querySelector("#item-count");

livros.addEventListener("click", function () {
    window.location.href = "livros.html";
});
revistas.addEventListener("click", function () {
    window.location.href = "revistas.html";
});
cadastrarItem.addEventListener("click", function () {
    window.location.href = "cadastro.html";
});

// Contador de itens cadastrados

const API_URL = "http://localhost:5109/api/Materiais";

fetch(API_URL)

contadorDeItens.addEventListener ("", function () {

});

// Revistas

const campoBusca = document.querySelector("#busca");
const corpoTabela = document.querySelector("#tabela-corpo");
const aviso = document.querySelector("#aviso");

let revistas2 = [];

function mostrarAviso(texto, classe) {
  aviso.textContent = texto;
  aviso.className = "alert " + classe;
}

function esconderAviso() {
  aviso.className = "d-none";
}

function renderizar(lista) {
  corpoTabela.textContent = "";

  if (lista.length === 0) {
    mostrarAviso("Nenhuma revista encontrada.", "alert-warning");
    return;
  }

  esconderAviso();

  lista.forEach((revista) => {
    const linha = document.createElement("tr");
    const valores = [revista.titulo, revista.anoPublicacao, revista.numeroEdicao, revista.mesPublicacao];

    valores.forEach((valor) => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.append(celula);
    });

    corpoTabela.append(linha);
  });
}

function filtrar() {
  const termo = campoBusca.value.trim().toLowerCase();
  const filtradas = revistas.filter((revista) => revista.titulo.toLowerCase().includes(termo));
  renderizar(filtradas);
}

async function carregarRevistas() {
  try {
    const materiais = await listarMateriais();
    revistas = materiais.filter((material) => material.tipo === "Revista");
    filtrar();
  } catch (erro) {
    mostrarAviso("Não foi possível carregar as revistas. Confira se a API está rodando.", "alert-danger");
  }
}

campoBusca.addEventListener("input", filtrar);
carregarRevistas();
