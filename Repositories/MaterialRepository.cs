using BibliotecaApi.Models;

namespace BibliotecaApi.Repositories;
public class MaterialRepository : IMaterialRepository
{
    private readonly Dictionary<int, MaterialBiblioteca> _materiais = new();
    private readonly object _lock = new();

    private int _proximoId = 1;

    public MaterialRepository()
    {
        Adicionar(new Livro
        {
            Titulo = "Clean Code",
            AnoPublicacao = 2008,
            Autor = "Robert C. Martin",
            Paginas = 464
        });

        Adicionar(new Revista
        {
            Titulo = "Tecnologia e Inovação",
            AnoPublicacao = 2025,
            Edicao = 15,
            MesPublicacao = 6
        });
    }

    public IEnumerable<MaterialBiblioteca> ObterTodos()
    {
        lock (_lock)
        {
            return _materiais.Values.OrderBy(m => m.Id).ToList();
        }
    }

    public MaterialBiblioteca? ObterPorId(int id)
    {
        lock (_lock)
        {
            return _materiais.GetValueOrDefault(id);
        }
    }

    public MaterialBiblioteca Adicionar(MaterialBiblioteca material)
    {
        lock (_lock)
        {
            material.Id = _proximoId++;
            _materiais[material.Id] = material;
            return material;
        }
    }

    public bool Atualizar(int id, MaterialBiblioteca material)
    {
        lock (_lock)
        {
            if (!_materiais.ContainsKey(id))
                return false;

            material.Id = id; 
            _materiais[id] = material;
            return true;
        }
    }

    public bool Remover(int id)
    {
        lock (_lock)
        {
            return _materiais.Remove(id);
        }
    }
}
