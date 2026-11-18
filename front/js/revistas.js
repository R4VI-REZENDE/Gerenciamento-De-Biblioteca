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
const campoEdicao = document.querySelector("#campo-edicao");
const campoMes = document.querySelector("#campo-mes");
const botaoModoEditar = document.querySelector("#btn-modo-editar");
const botaoSalvar = document.querySelector("#btn-salvar");

let revistas = [];
let revistaAberta = null; // revista atualmente aberta no modal
let modoEdicao = false;

// ---------- Lista ----------

function renderizar(lista) {
  corpoTabela.textContent = "";

  if (lista.length === 0) {
    mostrarAlerta(aviso, "Nenhuma revista encontrada.", "alert-warning");
    return;
  }

  esconderAlerta(aviso);

  lista.forEach((revista) => {
    const linha = criarLinha([revista.titulo, revista.anoPublicacao, revista.edicao, revista.mesPublicacao]);

    linha.append(
      criarCelulaAcoes(
        criarBotao("Detalhes", "btn-outline-secondary", "Ver detalhes da revista " + revista.titulo, () => abrirModal(revista, false)),
        criarBotao("Editar", "btn-outline-primary", "Editar a revista " + revista.titulo, () => abrirModal(revista, true)),
        criarBotao("Excluir", "btn-outline-danger", "Excluir a revista " + revista.titulo, () => excluir(revista))
      )
    );

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
    mostrarAlerta(aviso, "Não foi possível carregar as revistas. Confira se a API está rodando.", "alert-danger");
  }
}

// Falha numa ação sobre uma revista: se ela sumiu (404) atualiza a lista, senão mostra o texto recebido.
async function tratarFalha(erro, textoPadrao) {
  if (erro.status === 404) {
    await carregarRevistas();
    mostrarAlerta(mensagem, "Essa revista não existe mais. A lista foi atualizada.", "alert-warning");
  } else {
    mostrarAlerta(mensagem, textoPadrao, "alert-danger");
  }
}

// ---------- Modal: detalhes e edição ----------

function preencherFormulario(revista) {
  campoTitulo.value = revista.titulo ?? "";
  campoAno.value = revista.anoPublicacao ?? "";
  campoEdicao.value = revista.edicao ?? "";
  campoMes.value = revista.mesPublicacao ?? "";
}

function definirModo(editar) {
  modoEdicao = editar;
  camposGrupo.disabled = !editar;
  botaoSalvar.classList.toggle("d-none", !editar);
  botaoModoEditar.classList.toggle("d-none", editar);
  modalTitulo.textContent = editar ? "Editar revista" : "Detalhes da revista";
  formulario.classList.remove("was-validated");
  esconderAlerta(modalErro);
}

// Busca a revista na API (GET /{id}) para abrir sempre com o dado mais recente.
async function abrirModal(revista, editar) {
  esconderAlerta(mensagem);

  try {
    revistaAberta = await buscarMaterialPorId(revista.id);
    preencherFormulario(revistaAberta);
    definirModo(editar);
    modal.show();
  } catch (erro) {
    await tratarFalha(erro, "Não foi possível carregar a revista. Confira se a API está rodando.");
  }
}

async function salvar(evento) {
  evento.preventDefault();

  if (!modoEdicao || !revistaAberta) {
    return;
  }

  formulario.classList.add("was-validated");
  if (!formulario.checkValidity()) {
    return;
  }

  const dados = {
    titulo: campoTitulo.value.trim(),
    anoPublicacao: Number(campoAno.value),
    edicao: Number(campoEdicao.value),
    mesPublicacao: Number(campoMes.value),
  };

  esconderAlerta(modalErro);
  botaoSalvar.disabled = true;

  try {
    await atualizarMaterial("revista", revistaAberta.id, dados);
    modal.hide();
    await carregarRevistas();
    mostrarAlerta(mensagem, "Revista atualizada com sucesso.", "alert-success");
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

async function excluir(revista) {
  if (!confirm('Excluir a revista "' + revista.titulo + '"?')) {
    return;
  }

  esconderAlerta(mensagem);

  try {
    await excluirMaterial(revista.id);
    await carregarRevistas();
    mostrarAlerta(mensagem, "Revista excluída com sucesso.", "alert-success");
  } catch (erro) {
    await tratarFalha(erro, "Não foi possível excluir. Confira se a API está rodando.");
  }
}

botaoModoEditar.addEventListener("click", () => definirModo(true));
formulario.addEventListener("submit", salvar);
campoBusca.addEventListener("input", filtrar);
carregarRevistas();
