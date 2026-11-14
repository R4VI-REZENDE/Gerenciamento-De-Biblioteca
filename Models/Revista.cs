namespace BibliotecaApi.Models;

public class Revista : MaterialBiblioteca
{
    public int Edicao { get; set; }

    public int MesPublicacao { get; set; }

    public override int CalcularPrazo() => 7;

    public override string Descricao() => $"Revista: {Titulo} - Edição: {Edicao}";
}
