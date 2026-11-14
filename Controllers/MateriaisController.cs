using BibliotecaApi.Models;
using BibliotecaApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BibliotecaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MateriaisController : ControllerBase
{
    private readonly IMaterialRepository _repository;

    public MateriaisController(IMaterialRepository repository)
    {
        _repository = repository;
    }

    // GET /api/Materiais
    [HttpGet]
    public ActionResult<IEnumerable<MaterialBiblioteca>> ObterTodos()
        => Ok(_repository.ObterTodos());

    // GET /api/Materiais/{id}
    [HttpGet("{id:int}")]
    public ActionResult<MaterialBiblioteca> ObterPorId(int id)
    {
        var material = _repository.ObterPorId(id);
        if (material is null)
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        return Ok(material);
    }

    // POST /api/Materiais/livro
    [HttpPost("livro")]
    public ActionResult<Livro> CadastrarLivro([FromBody] Livro livro)
    {
        var erros = ValidarLivro(livro);
        if (erros.Count > 0)
            return BadRequest(Erros(erros));

        var criado = _repository.Adicionar(livro);
        return CreatedAtAction(nameof(ObterPorId), new { id = criado.Id }, criado);
    }

    // POST /api/Materiais/revista
    [HttpPost("revista")]
    public ActionResult<Revista> CadastrarRevista([FromBody] Revista revista)
    {
        var erros = ValidarRevista(revista);
        if (erros.Count > 0)
            return BadRequest(Erros(erros));

        var criada = _repository.Adicionar(revista);
        return CreatedAtAction(nameof(ObterPorId), new { id = criada.Id }, criada);
    }

    // PUT /api/Materiais/livro/{id}
    [HttpPut("livro/{id:int}")]
    public ActionResult<Livro> AtualizarLivro(int id, [FromBody] Livro livro)
    {
        var existente = _repository.ObterPorId(id);
        if (existente is null)
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        if (existente is not Livro)
            return BadRequest(Mensagem($"O material {id} é uma {existente.Tipo}, não um Livro. Use a rota /revista/{id}."));

        var erros = ValidarLivro(livro);
        if (erros.Count > 0)
            return BadRequest(Erros(erros));

        if (!_repository.Atualizar(id, livro))
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        return Ok(livro); // o Repository já fixou livro.Id = id
    }

    // PUT /api/Materiais/revista/{id}
    [HttpPut("revista/{id:int}")]
    public ActionResult<Revista> AtualizarRevista(int id, [FromBody] Revista revista)
    {
        var existente = _repository.ObterPorId(id);
        if (existente is null)
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        if (existente is not Revista)
            return BadRequest(Mensagem($"O material {id} é um {existente.Tipo}, não uma Revista. Use a rota /livro/{id}."));

        var erros = ValidarRevista(revista);
        if (erros.Count > 0)
            return BadRequest(Erros(erros));

        if (!_repository.Atualizar(id, revista))
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        return Ok(revista);
    }

    // DELETE /api/Materiais/{id}
    [HttpDelete("{id:int}")]
    public IActionResult Remover(int id)
    {
        if (!_repository.Remover(id))
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        return NoContent();
    }

    // GET /api/Materiais/{id}/descricao
    [HttpGet("{id:int}/descricao")]
    public IActionResult ObterDescricao(int id)
    {
        var material = _repository.ObterPorId(id);
        if (material is null)
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        // Polimorfismo: chamadas pelo tipo-base, sem nenhum if por tipo.
        return Ok(new
        {
            id = material.Id,
            tipo = material.Tipo,
            descricao = material.Descricao(),
            prazoEmprestimo = material.CalcularPrazo()
        });
    }

    // POST /api/Materiais/{id}/emprestar
    [HttpPost("{id:int}/emprestar")]
    public IActionResult Emprestar(int id)
    {
        var material = _repository.ObterPorId(id);
        if (material is null)
            return NotFound(Mensagem($"Material com ID {id} não encontrado."));

        if (material is not IEmprestimo emprestimo)
            return BadRequest(Mensagem($"Materiais do tipo {material.Tipo} não implementam IEmprestimo e não podem ser emprestados."));

        return Ok(Mensagem(emprestimo.Emprestar()));
    }

    private static List<string> ValidarMaterial(MaterialBiblioteca material)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(material.Titulo))
            erros.Add("Titulo é obrigatório e não pode ser vazio ou conter apenas espaços.");

        if (material.AnoPublicacao < 0)
            erros.Add("AnoPublicacao deve ser maior ou igual a zero.");

        return erros;
    }

    private static List<string> ValidarLivro(Livro livro)
    {
        var erros = ValidarMaterial(livro);

        if (string.IsNullOrWhiteSpace(livro.Autor))
            erros.Add("Autor é obrigatório e não pode ser vazio ou conter apenas espaços.");

        if (livro.Paginas <= 0)
            erros.Add("Paginas deve ser maior que zero.");

        return erros;
    }

    private static List<string> ValidarRevista(Revista revista)
    {
        var erros = ValidarMaterial(revista);

        if (revista.Edicao <= 0)
            erros.Add("Edicao deve ser maior que zero.");

        if (revista.MesPublicacao is < 1 or > 12)
            erros.Add("MesPublicacao deve estar entre 1 e 12.");

        return erros;
    }

    private static object Mensagem(string texto) => new { mensagem = texto };

    private static object Erros(List<string> erros) => new { mensagem = "Dados inválidos.", erros };
}
