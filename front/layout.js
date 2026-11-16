
// pra mudar o menu e so digitar na lista de páginas.
const paginas = [
  { nome: "Home", arquivo: "home.html" },
  { nome: "Livros", arquivo: "livros.html" },
  { nome: "Revistas", arquivo: "revistas.html" },
  { nome: "Cadastro", arquivo: "cadastro.html" },
];

function criarTopo() {
  const topo = document.createElement("header");
  topo.className = "topo";

  const titulo = document.createElement("h1");
  titulo.textContent = "📖 Gerenciamento de Biblioteca 📖";

  topo.append(titulo);
  return topo;
}

function criarMenu() {
  const menu = document.createElement("nav");
  menu.className = "menu";
  menu.setAttribute("aria-label", "Menu principal");

  const atual = location.pathname.split("/").pop() || "index.html";

  paginas.forEach((pagina) => {
    const link = document.createElement("a");
    link.href = pagina.arquivo;
    link.textContent = pagina.nome;

    if (pagina.arquivo === atual) {
      link.classList.add("ativo");
      link.setAttribute("aria-current", "page");
    }

    menu.append(link);
  });

  return menu;
}

function criarRodape() {
  const rodape = document.createElement("footer");
  rodape.className = "rodape";
  rodape.textContent = "Releitura \u00A9 2026 ";
  return rodape;
}

function montarLayout() {
  const conteudo = document.querySelector("main");

  const corpo = document.createElement("div");
  corpo.className = "corpo";
  conteudo.before(corpo);
  corpo.append(criarMenu(), conteudo);

  document.body.prepend(criarTopo());
  document.body.append(criarRodape());
}

montarLayout();
