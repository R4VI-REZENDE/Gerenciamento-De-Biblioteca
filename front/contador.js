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

document.querySelector("#livros").addEventListener("click", () => {
  location.href = "livros.html";
});
document.querySelector("#revistas").addEventListener("click", () => {
  location.href = "revistas.html";
});
document.querySelector("#cadastrar").addEventListener("click", () => {
  location.href = "cadastro.html";
});