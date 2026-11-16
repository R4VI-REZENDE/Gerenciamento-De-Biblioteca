const campoBusca = document.querySelector("#busca");
const corpoTabela = document.querySelector("#tabela-corpo");
const aviso = document.querySelector("#aviso");
const mensagem = document.querySelector("#mensagem");

let livros = [];

function mostrarAviso(texto, classe) {
  aviso.textContent = texto;
  aviso.className = "alert " + classe;
}

function esconderAviso() {
  aviso.className = "d-none";
}

function mostrarMensagem(texto, classe) {
  mensagem.textContent = texto;
  mensagem.className = "alert " + classe;
}

function esconderMensagem() {
  mensagem.className = "d-none";
}

function ehLivro(material) {
  return material.tipo === "Livro" || material.autor !== undefined;
}

function renderizar(lista) {
  corpoTabela.textContent = "";

  if (lista.length === 0) {
    mostrarAviso("Nenhum livro encontrado.", "alert-warning");
    return;
  }

  esconderAviso();

  lista.forEach((livro) => {
    const linha = document.createElement("tr");
    const paginas = livro.paginas ?? livro.numeroPaginas;
    const valores = [livro.titulo, livro.anoPublicacao, livro.autor, paginas];

    valores.forEach((valor) => {
      const celula = document.createElement("td");
      celula.textContent = valor;
      linha.append(celula);
    });

    const celulaAcoes = document.createElement("td");
    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "btn btn-sm btn-outline-danger";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.setAttribute("aria-label", "Excluir o livro " + livro.titulo);
    botaoExcluir.addEventListener("click", () => excluir(livro));

    celulaAcoes.append(botaoExcluir);
    linha.append(celulaAcoes);
    corpoTabela.append(linha);
  });
}

function filtrar() {
  const termo = campoBusca.value.trim().toLowerCase();
  const filtrados = livros.filter((livro) => {
    const texto = livro.titulo + " " + (livro.autor ?? "");
    return texto.toLowerCase().includes(termo);
  });
  renderizar(filtrados);
}

async function carregarLivros() {
  try {
    const materiais = await listarMateriais();
    livros = materiais.filter(ehLivro);
    filtrar();
  } catch (erro) {
    mostrarAviso("Não foi possível carregar os livros. Confira se a API está rodando.", "alert-danger");
  }
}

async function excluir(livro) {
  if (!confirm('Excluir o livro "' + livro.titulo + '"?')) {
    return;
  }

  esconderMensagem();

  try {
    await excluirMaterial(livro.id);
    await carregarLivros();
    mostrarMensagem("Livro excluído com sucesso.", "alert-success");
  } catch (erro) {
    if (erro.message === "Erro 404") {
      await carregarLivros();
      mostrarMensagem("Esse livro não existe mais. A lista foi atualizada.", "alert-warning");
    } else {
      mostrarMensagem("Não foi possível excluir. Confira se a API está rodando.", "alert-danger");
    }
  }
}

campoBusca.addEventListener("input", filtrar);
carregarLivros();