// Página inicial: mostra quantos itens existem cadastrados.
const contadorItens = document.querySelector("#item-count");

async function carregarContador() {
  try {
    const materiais = await listarMateriais();
    contadorItens.textContent = materiais.length;
  } catch (erro) {
    contadorItens.textContent = "?";
  }
}

carregarContador();
