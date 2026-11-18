const campoBusca = document.querySelector("#busca");
const corpoTabela = document.querySelector("#tabela-corpo");
const aviso = document.querySelector("#aviso");
const mensagem = document.querySelector("#mensagem");

// Modal de detalhes/edição
const modal = new bootstrap.Modal(document.querySelector("#modal-material"));
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
let livroAberto = null; // livro atualmente aberto no modal
let modoEdicao = false;

// ---------- Empréstimos ----------
// A API não guarda o estado "emprestado"; por enquanto ele fica só neste navegador.

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
    // armazenamento indisponível (modo privado, etc.): o empréstimo só não persiste
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

// ---------- Lista ----------

function criarSelo(texto) {
  const selo = document.createElement("span");
  selo.className = "badge text-bg-warning ms-2";
  selo.textContent = texto;
  return selo;
}

function renderizar(lista) {
  corpoTabela.textContent = "";

  if (lista.length === 0) {
    mostrarAlerta(aviso, "Nenhum livro encontrado.", "alert-warning");
    return;
  }

  esconderAlerta(aviso);

  lista.forEach((livro) => {
    const linha = criarLinha([livro.titulo, livro.anoPublicacao, livro.autor, livro.paginas]);

    const emprestado = estaEmprestado(livro);
    if (emprestado) {
      linha.classList.add("table-warning");
      linha.cells[0].append(criarSelo("Emprestado"));
    }

    const botaoEmprestar = criarBotao("Emprestar", "btn-outline-success", "Emprestar o livro " + livro.titulo, () => emprestar(livro));
    botaoEmprestar.disabled = emprestado;

    linha.append(
      criarCelulaAcoes(
        criarBotao("Detalhes", "btn-outline-secondary", "Ver detalhes do livro " + livro.titulo, () => abrirModal(livro, false)),
        criarBotao("Editar", "btn-outline-primary", "Editar o livro " + livro.titulo, () => abrirModal(livro, true)),
        botaoEmprestar,
        criarBotao("Excluir", "btn-outline-danger", "Excluir o livro " + livro.titulo, () => excluir(livro))
      )
    );

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
    livros = materiais.filter((material) => material.tipo === "Livro");
    filtrar();
  } catch (erro) {
    mostrarAlerta(aviso, "Não foi possível carregar os livros. Confira se a API está rodando.", "alert-danger");
  }
}

// Falha numa ação sobre um livro: se ele sumiu (404) atualiza a lista, senão mostra o texto recebido.
async function tratarFalha(erro, textoPadrao) {
  if (erro.status === 404) {
    await carregarLivros();
    mostrarAlerta(mensagem, "Esse livro não existe mais. A lista foi atualizada.", "alert-warning");
  } else {
    mostrarAlerta(mensagem, textoPadrao, "alert-danger");
  }
}

// ---------- Modal: detalhes e edição ----------

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
  esconderAlerta(modalErro);
}

// Busca o livro na API (GET /{id}) para abrir sempre com o dado mais recente.
async function abrirModal(livro, editar) {
  esconderAlerta(mensagem);

  try {
    livroAberto = await buscarMaterialPorId(livro.id);
    preencherFormulario(livroAberto);
    definirModo(editar);
    modal.show();
  } catch (erro) {
    await tratarFalha(erro, "Não foi possível carregar o livro. Confira se a API está rodando.");
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

  esconderAlerta(modalErro);
  botaoSalvar.disabled = true;

  try {
    await atualizarMaterial("livro", livroAberto.id, dados);
    modal.hide();
    await carregarLivros();
    mostrarAlerta(mensagem, "Livro atualizado com sucesso.", "alert-success");
  } catch (erro) {
    if (erro.status === 404) {
      modal.hide();
      await tratarFalha(erro);
    } else if (erro.status === 400 && erro.detalhes.length > 0) {
      mostrarErros(modalErro, erro.detalhes);
    } else {
      mostrarErros(modalErro, ["Não foi possível salvar. Confira se a API está rodando."]);
    }
  } finally {
    botaoSalvar.disabled = false;
  }
}

// ---------- Ações da tabela ----------

async function emprestar(livro) {
  if (!confirm('Tem certeza que deseja emprestar o livro "' + livro.titulo + '"?')) {
    return;
  }

  esconderAlerta(mensagem);

  try {
    const texto = await emprestarMaterial(livro.id);
    marcarEmprestado(livro.id);
    await carregarLivros();
    mostrarAlerta(mensagem, texto || "Livro emprestado com sucesso.", "alert-success");
  } catch (erro) {
    await tratarFalha(erro, "Não foi possível emprestar. Confira se a API está rodando.");
  }
}

async function excluir(livro) {
  if (!confirm('Excluir o livro "' + livro.titulo + '"?')) {
    return;
  }

  esconderAlerta(mensagem);

  try {
    await excluirMaterial(livro.id);
    desmarcarEmprestado(livro.id);
    await carregarLivros();
    mostrarAlerta(mensagem, "Livro excluído com sucesso.", "alert-success");
  } catch (erro) {
    await tratarFalha(erro, "Não foi possível excluir. Confira se a API está rodando.");
  }
}

botaoModoEditar.addEventListener("click", () => definirModo(true));
formulario.addEventListener("submit", salvar);
campoBusca.addEventListener("input", filtrar);
carregarLivros();
