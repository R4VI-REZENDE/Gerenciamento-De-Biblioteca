# BibliotecaApi

**Integrantes:** _(Allan Fernandes, Ravi Rezende, DANIEL VIRGILIO GONCALVES)_

## Descrição

Web API em C# (ASP.NET Core, .NET 10) para gerenciar os materiais de uma biblioteca universitária:
livros e revistas. Os dados ficam **somente em memória** (um `Dictionary` dentro do Repository, registrado
como Singleton); ao encerrar a aplicação, os cadastros feitos durante a execução são perdidos.
Os testes são feitos pelo Swagger — não há frontend.

## Tecnologias

- C# / ASP.NET Core Web API (.NET 10) com Controllers
- Swashbuckle.AspNetCore (Swagger)
- Repository Pattern + Injeção de Dependência (Singleton)
- CORS (política `PermitirFrontend`)

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download) (`dotnet --version` deve mostrar 10.x)

## Como executar

```bash
dotnet restore
dotnet run
```

A API sobe em `http://localhost:5109` (porta definida em `Properties/launchSettings.json`).
O Swagger fica em **http://localhost:5109/swagger**.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `Models/MaterialBiblioteca.cs` | Classe abstrata: dados comuns, `CalcularPrazo()` (abstract), `Descricao()` (virtual) |
| `Models/Livro.cs` | Herda da base, implementa `IEmprestimo`, prazo 14 |
| `Models/Revista.cs` | Herda da base, **não** implementa `IEmprestimo`, prazo 7 |
| `Models/IEmprestimo.cs` | Capacidade de ser emprestado (`Emprestar()`) |
| `Repositories/IMaterialRepository.cs` | Contrato de armazenamento |
| `Repositories/MaterialRepository.cs` | CRUD sobre `Dictionary<int, MaterialBiblioteca>` privado; gera IDs com contador |
| `Controllers/MateriaisController.cs` | Endpoints, validações e respostas HTTP |
| `Program.cs` | Controllers, Swagger, CORS e `AddSingleton<IMaterialRepository, MaterialRepository>()` |

## Endpoints

| Método | Rota | Função | Respostas |
|---|---|---|---|
| GET | `/api/Materiais` | Listar todos | 200 |
| GET | `/api/Materiais/{id}` | Buscar por ID | 200, 404 |
| POST | `/api/Materiais/livro` | Cadastrar livro | 201, 400 |
| POST | `/api/Materiais/revista` | Cadastrar revista | 201, 400 |
| PUT | `/api/Materiais/livro/{id}` | Atualizar livro | 200, 400, 404 |
| PUT | `/api/Materiais/revista/{id}` | Atualizar revista | 200, 400, 404 |
| DELETE | `/api/Materiais/{id}` | Excluir material | 204, 404 |
| GET | `/api/Materiais/{id}/descricao` | Descrição e prazo | 200, 404 |
| POST | `/api/Materiais/{id}/emprestar` | Tentar emprestar | 200, 400, 404 |

## Exemplos de requisições

**POST `/api/Materiais/livro`**
```json
{ "titulo": "O Programador Pragmático", "anoPublicacao": 1999, "autor": "Andrew Hunt", "paginas": 352 }
```

**POST `/api/Materiais/revista`**
```json
{ "titulo": "Revista de Tecnologia", "anoPublicacao": 2026, "edicao": 20, "mesPublicacao": 11 }
```

**GET `/api/Materiais/1/descricao`**
```json
{ "id": 1, "tipo": "Livro", "descricao": "Livro: Clean Code - Autor: Robert C. Martin", "prazoEmprestimo": 14 }
```

**POST `/api/Materiais/1/emprestar`** → `200` `{ "mensagem": "O livro 'Clean Code' pode ser emprestado por 14 dias." }`
**POST `/api/Materiais/2/emprestar`** (revista) → `400`

Resposta de validação (`400`):
```json
{ "mensagem": "Dados inválidos.", "erros": ["Paginas deve ser maior que zero."] }
```

## Regras de negócio

- **ID**: gerado pelo Repository com um contador crescente; nunca é pedido no cadastro, é preservado na
  atualização (vale o ID da rota) e **nunca é reutilizado** após exclusão durante a execução.
- **Título**: obrigatório, não pode ser vazio nem só espaços. **Ano de publicação** ≥ 0.
- **Livro**: autor obrigatório; páginas > 0; prazo de 14 dias; pode ser emprestado.
- **Revista**: edição > 0; mês de publicação entre 1 e 12; prazo de 7 dias; não pode ser emprestada.
- **Atualização por tipo**: `/livro/{id}` só atualiza um Livro e `/revista/{id}` só uma Revista;
  o tipo errado retorna 400 (nunca troca um tipo pelo outro). ID inexistente retorna 404.
- **Polimorfismo**: a descrição e o prazo são obtidos chamando `Descricao()` e `CalcularPrazo()` pelo tipo-base.
- **Empréstimo**: usa `is not IEmprestimo` para decidir entre 200 e 400.
