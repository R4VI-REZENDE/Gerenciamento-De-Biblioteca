const form = document.querySelector("#form-cadastro");
const tipo = document.querySelector("#tipo");
const grupoLivro = document.querySelector("#grupo-livro");
const grupoRevista = document.querySelector("#grupo-revista");
const mensagem = document.querySelector("#mensagem");

function mostrarMensagem(texto, classe) {
  mensagem.textContent = texto;
  mensagem.className = "alert " + classe;
}

function trocarTipo() {
  grupoLivro.classList.toggle("d-none", tipo.value !== "livro");
  grupoRevista.classList.toggle("d-none", tipo.value !== "revista");
}

// Lê os campos e confere se estão certos. Devolve { erro, dados }.
function lerFormulario() {
  const titulo = document.querySelector("#titulo").value.trim();
  const ano = Number(document.querySelector("#ano").value);
  const anoAtual = new Date().getFullYear();

  if (titulo === "") {
    return { erro: "Informe o título." };
  }
  if (!Number.isInteger(ano) || ano < 1000 || ano > anoAtual) {
    return { erro: "Informe um ano entre 1000 e " + anoAtual + "." };
  }

  if (tipo.value === "livro") {
    const autor = document.querySelector("#autor").value.trim();
    const paginas = Number(document.querySelector("#paginas").value);

    if (autor === "") {
      return { erro: "Informe o autor." };
    }
    if (!Number.isInteger(paginas) || paginas < 1) {
      return { erro: "Informe um número de páginas maior que zero." };
    }
    return { dados: { titulo, anoPublicacao: ano, autor, numeroPaginas: paginas } };
  }

  const edicao = Number(document.querySelector("#edicao").value);
  const mes = Number(document.querySelector("#mes").value);

  if (!Number.isInteger(edicao) || edicao < 1) {
    return { erro: "Informe a edição (maior que zero)." };
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return { erro: "Informe um mês de 1 a 12." };
  }
  return { dados: { titulo, anoPublicacao: ano, numeroEdicao: edicao, mesPublicacao: mes } };
}

async function cadastrar(evento) {
  evento.preventDefault();

  const { erro, dados } = lerFormulario();
  if (erro) {
    mostrarMensagem(erro, "alert-danger");
    return;
  }

  try {
    await cadastrarMaterial(tipo.value, dados);

    mostrarMensagem("Material cadastrado com sucesso!", "alert-success");
    form.reset();
    trocarTipo();
  } catch (e) {
    mostrarMensagem("Não foi possível cadastrar. Confira se a API está rodando.", "alert-danger");
  }
}

tipo.addEventListener("change", trocarTipo);
form.addEventListener("submit", cadastrar);
