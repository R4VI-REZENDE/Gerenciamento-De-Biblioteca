const campoBusca = document.querySelector("#busca");
const corpoTabela = document.querySelector("#tabela-corpo");
const aviso = document.querySelector("#aviso");
const mensagem = document.querySelector("#mensagem");

const modalElemento = document.querySelector("#modal-material");
const modal = new bootstrap.Modal(modalElemento);
const formulario = document.querySelector("#form-material");
const modalTitulo = document.querySelector("#modal-titulo");
const modalErro = document.querySelector("#modal-erro");
const camposGrupo = document.querySelector("#campos");
const campoTitulo = document.querySelector("#campo-titulo");
const campoAno = document.querySelector("#campo-ano");
const campoAutor = document.querySelector("#campo-autor");
const campoPaginas = document.querySelector("#campo-paginas");
const botaoModoEditar = document.querySelector("#btn-modo-editar");
const botaoSalvar = document.querySelector("#btn-salvar");

let livros = [];
let livroAberto = null; 
let modoEdicao = false;

const CHAVE_EMPRESTADOS = "livros-emprestados";

function lerEmprestados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_EMPRESTADOS)) ?? [];
  } catch (e) {
    return [];
  }
}

function salvarEmprestados(ids) {
  try {
    localStorage.setItem(CHAVE_EMPRESTADOS, JSON.stringify(ids));
  } catch (e) {
  
  }
}

function estaEmprestado(livro) {
  return lerEmprestados().includes(livro.id);
}

function marcarEmprestado(id) {
  const ids = lerEmprestados();
  if (!ids.includes(id)) {
    ids.push(id);
    salvarEmprestados(ids);
  }
}

function desmarcarEmprestado(id) {
  salvarEmprestados(lerEmprestados().filter((item) => item !== id));
}

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

function mostrarErroModal(textos) {
  modalErro.textContent = "";
  const lista = document.createElement("ul");
  lista.className = "mb-0";
  textos.forEach((texto) => {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.append(item);
  });
  modalErro.append(lista);
  modalErro.className = "alert alert-danger";
}

function esconderErroModal() {
  modalErro.className = "d-none";
  modalErro.textContent = "";
}

function ehLivro(material) {
  return material.tipo === "Livro";
}

function criarBotao(texto, classe, rotulo, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn btn-sm " + classe;
  botao.textContent = texto;
  botao.setAttribute("aria-label", rotulo);
  botao.addEventListener("click", aoClicar);
  return botao;
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
    const valores = [livro.titulo, livro.anoPublicacao, livro.autor, livro.paginas];

    const emprestado = estaEmprestado(livro);
    if (emprestado) {
      linha.classList.add("table-warning");
    }

    valores.forEach((valor, indice) => {
      const celula = document.createElement("td");
      celula.textContent = valor;

      if (indice === 0 && emprestado) {
        const selo = document.createElement("span");
        selo.className = "badge text-bg-warning ms-2";
        selo.textContent = "Emprestado";
        celula.append(selo);
      }

      linha.append(celula);
    });

    const celulaAcoes = document.createElement("td");
    const grupo = document.createElement("div");
    grupo.className = "d-flex flex-wrap gap-1";

    const botaoEmprestar = criarBotao("Emprestar", "btn-outline-success", "Emprestar o livro " + livro.titulo, () => emprestar(livro));
    botaoEmprestar.disabled = emprestado;

    grupo.append(
      criarBotao("Detalhes", "btn-outline-secondary", "Ver detalhes do livro " + livro.titulo, () => abrirModal(livro, false)),
      criarBotao("Editar", "btn-outline-primary", "Editar o livro " + livro.titulo, () => abrirModal(livro, true)),
      botaoEmprestar,
      criarBotao("Excluir", "btn-outline-danger", "Excluir o livro " + livro.titulo, () => excluir(livro))
    );

    celulaAcoes.append(grupo);
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


function preencherFormulario(livro) {
  campoTitulo.value = livro.titulo ?? "";
  campoAno.value = livro.anoPublicacao ?? "";
  campoAutor.value = livro.autor ?? "";
  campoPaginas.value = livro.paginas ?? "";
}

function definirModo(editar) {
  modoEdicao = editar;
  camposGrupo.disabled = !editar;
  botaoSalvar.classList.toggle("d-none", !editar);
  botaoModoEditar.classList.toggle("d-none", editar);
  modalTitulo.textContent = editar ? "Editar livro" : "Detalhes do livro";
  formulario.classList.remove("was-validated");
  esconderErroModal();
}

async function abrirModal(livro, editar) {
  esconderMensagem();

  try {
    livroAberto = await buscarMaterialPorId(livro.id);
    preencherFormulario(livroAberto);
    definirModo(editar);
    modal.show();
  } catch (erro) {
    if (erro.message === "Erro 404") {
      await carregarLivros();
      mostrarMensagem("Esse livro não existe mais. A lista foi atualizada.", "alert-warning");
    } else {
      mostrarMensagem("Não foi possível carregar o livro. Confira se a API está rodando.", "alert-danger");
    }
  }
}

async function salvar(evento) {
  evento.preventDefault();

  if (!modoEdicao || !livroAberto) {
    return;
  }

  formulario.classList.add("was-validated");
  if (!formulario.checkValidity()) {
    return;
  }

  const dados = {
    titulo: campoTitulo.value.trim(),
    anoPublicacao: Number(campoAno.value),
    autor: campoAutor.value.trim(),
    paginas: Number(campoPaginas.value),
  };

  esconderErroModal();
  botaoSalvar.disabled = true;

  try {
    await atualizarMaterial("livro", livroAberto.id, dados);
    modal.hide();
    await carregarLivros();
    mostrarMensagem("Livro atualizado com sucesso.", "alert-success");
  } catch (erro) {
    if (erro.message === "Erro 404") {
      modal.hide();
      await carregarLivros();
      mostrarMensagem("Esse livro não existe mais. A lista foi atualizada.", "alert-warning");
    } else if (erro.message === "Erro 400" && erro.detalhes && erro.detalhes.length > 0) {
      mostrarErroModal(erro.detalhes);
    } else {
      mostrarErroModal(["Não foi possível salvar. Confira se a API está rodando."]);
    }
  } finally {
    botaoSalvar.disabled = false;
  }
}

async function emprestar(livro) {
  if (!confirm('Tem certeza que deseja emprestar o livro "' + livro.titulo + '"?')) {
    return;
  }

  esconderMensagem();

  try {
    const texto = await emprestarMaterial(livro.id);
    marcarEmprestado(livro.id);
    await carregarLivros();
    mostrarMensagem(texto || "Livro emprestado com sucesso.", "alert-success");
  } catch (erro) {
    if (erro.message === "Erro 404") {
      await carregarLivros();
      mostrarMensagem("Esse livro não existe mais. A lista foi atualizada.", "alert-warning");
    } else {
      mostrarMensagem("Não foi possível emprestar. Confira se a API está rodando.", "alert-danger");
    }
  }
}

async function excluir(livro) {
  if (!confirm('Excluir o livro "' + livro.titulo + '"?')) {
    return;
  }

  esconderMensagem();

  try {
    await excluirMaterial(livro.id);
    desmarcarEmprestado(livro.id);
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

botaoModoEditar.addEventListener("click", () => definirModo(true));
formulario.addEventListener("submit", salvar);
campoBusca.addEventListener("input", filtrar);
carregarLivros();
