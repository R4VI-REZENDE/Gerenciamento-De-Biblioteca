--------------------------- README DO FRONTEND ----------------------------

O Frontend do gerenciamento de biblioteca da Releitura (Biblioteca fictícia criada para uso no projeto) consiste basicamente 
em várias páginas HTML, e um padrão de layout pronto em javascript que acompanha todas as páginas. Cada página HTML possui seu
respectivo arquivo js, que contém alterações visuais e de funcionamento relativas a cada uma, como o sistema de empréstimo, 
informações dos itens em formato de tabela, etc...

Integrantes:
Ravi Rezende Abrão | 114.051

Allan Fernandes | 114.063

Daniel Virgilio | 114.090

Funcionalidades:
- Tabelas diferentes para Livros e para Revistas, cada uma contendo as informações necessárias de cada item.

- Sistema de emprestimo incompleto, apenas visual e com sistema de aviso. Ele confirma o empréstimo do livro, e nem aparece pra
revista já que não é possível emprestar revistas na proposta do projeto.

- Sistema de exclusão de item, diretamente relacionado com a API em C# com Swagger.

- Sistema de cadastro de itens, o possui uma aba exclusiva pra isso. Também direamente relacionado com a API em C# com Swagger

- Opção de ver detalhes, para ver os detalhes de um item de forma mais específica

- Opção de edição de item, para editar os detalhes do livro e/ou revista.

Resumo da Estrutura:
- Página Home cabeçário básico, footer com o nome da biblioteca fictícia, além de contador de itens embaixo e 3 botões que 
redirecionam o usuário para as outras páginas, que são Livros, Revistas e Cadastro de Itens

- Página Livros, que mostra os livros cadastrados, tem funcionalidade de excluir, ver detalhes, emprestar e editar
- Página Revistas, que mostra as revistas cadastradas e tem funcionadade de excluir, ver detalhes, emprestar e editar
- Página Cadastrar Itens, que permite ao usuário cadastrar Livros ou Revistas com suas respectivas informações

Como Executar:
1- Rode dotnet run
2- Caso possua a extensão do live server, clique com o botão direito no index.html e clique em "Open with live server", caso
não possua, vá na pasta do projeto, abra a pasta front, procure o arquivo index.html e clique duas vezes nele para abri-lo no seu
navegador
3- Pronto! O projeto já esta rodando
4- Em caso de erro na API, substitua o endereço que o dotnet run retornar ( ex - http://localhost:5109) pelo que estiver na
const API_URL = endereçoQueEstaDandoErro e tente novamente

Integração com a API:
A integração com a API foi feita por fetch. Nesse sistema, o frontend nunca conversa diretamente com o repositório, a API nos passa
as rotas para buscarmos os arquivos/informações que o frontend precisa, como os livros e revistas cadastrados. Essas informações são
guardadas num dictionary no MaterialRepository, e o program.cs libera o CORS, para evitar erros. Toda a comunicação com a API é 
é concentrada no arquivo api.js, lá tem todas as configurações com rotas e etc que o frotend precisa para trabalhar.

Endpoints consumidos:
GET api/Materiais
POST api/Materiais/Livro
POST api/Materiais/Revista
DELETE api/Materiais/{id}

Organização das Pastas:
A pasta front possui todos os arquivos html e js, que conversam entre si, além dos arquivos layout.css e assets/style.css.

Dificuldades:
Complicações na hora de interligar a API com o frontend por meio do get e post, e entendimento dos endpoints. Também houve uma
dificuldade na organização das pastas do projeto, já que algumas pastas foram feitas todas espalhadas e, devido ao pouco tempo,
não consegui achar uma solução para organizá-las adequadamente, apesar de ao menos a API funcionar normalmente.

Componentes Bootstrap:
Utilizamos headers, botões e navbars prontos do bootstrap para auxiliar no desenvolvimento a aparência do front.

Testes Realizados:
Testamos o sistema criando livros ainda pela API, pra ver se chegavam a aparecer no frontend. Testamos também criando livros pelo
próprio app, excluindo os criados, testamos a responsividade com o dev_tools, e a aba de edição, editando o livro que criamos,
antes de excluí-lo

O que cada um aprendeu:
Ravi:
Aprendi sobre integração da api com o frontend por meio do get e post, mas principalmente sobre customização e interação da página por
meio do javascript

Allan:

Daniel:
