namespace BibliotecaApi.Models;

public class Livro : MaterialBiblioteca, IEmprestimo
{
    public string Autor { get; set; } = string.Empty;

    public int Paginas { get; set; }

    public override int CalcularPrazo() => 14;

    public override string Descricao() => $"Livro: {Titulo} - Autor: {Autor}";

    public string Emprestar() => $"O livro '{Titulo}' pode ser emprestado por {CalcularPrazo()} dias.";
}
