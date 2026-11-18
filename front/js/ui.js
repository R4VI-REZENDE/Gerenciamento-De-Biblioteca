// Pequenas funções de interface usadas por mais de uma página.
// (Scripts clássicos, sem módulos, para o front continuar abrindo com duplo clique em file://.)

// ---------- Alertas do Bootstrap ----------

function mostrarAlerta(elemento, texto, classe) {
  elemento.textContent = texto;
  elemento.className = "alert " + classe;
}

function esconderAlerta(elemento) {
  elemento.className = "d-none";
  elemento.textContent = "";
}

// Mostra várias mensagens de erro em forma de lista.
function mostrarErros(elemento, textos) {
  elemento.textContent = "";

  const lista = document.createElement("ul");
  lista.className = "mb-0";
  textos.forEach((texto) => {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.append(item);
  });

  elemento.append(lista);
  elemento.className = "alert alert-danger";
}

// ---------- Tabelas ----------

function criarBotao(texto, classe, rotulo, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn btn-sm " + classe;
  botao.textContent = texto;
  botao.setAttribute("aria-label", rotulo);
  botao.addEventListener("click", aoClicar);
  return botao;
}

// Cria um <tr> com uma <td> para cada valor (textContent: seguro contra HTML injetado).
function criarLinha(valores) {
  const linha = document.createElement("tr");

  valores.forEach((valor) => {
    const celula = document.createElement("td");
    celula.textContent = valor;
    linha.append(celula);
  });

  return linha;
}

// Cria a <td> da coluna "Ações" com os botões lado a lado.
function criarCelulaAcoes(...botoes) {
  const celula = document.createElement("td");
  const grupo = document.createElement("div");
  grupo.className = "d-flex flex-wrap gap-1";
  grupo.append(...botoes);
  celula.append(grupo);
  return celula;
}
