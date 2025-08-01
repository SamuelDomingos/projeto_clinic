import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getScheduleTypes, createScheduleType, updateScheduleType, deleteScheduleType } from '@/lib/api/services/schedule';
import ScheduleTypeForm from './ScheduleTypeForm';
import { ScheduleType } from '@/lib/api/types/schedule';
import { MoreHorizontal } from 'lucide-react';

const PAGE_SIZE = 10;

export default function ScheduleTypeList() {
  const [types, setTypes] = useState<ScheduleType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleType | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    const res = await getScheduleTypes();
    setTypes(res.data);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (type: ScheduleType) => {
    console.log('Editando tipo de atendimento:', type);
    setEditing(type);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este tipo de atendimento?')) {
      await deleteScheduleType(id);
      fetchTypes();
    }
  };

  const handleFormSubmit = async (data: Omit<ScheduleType, 'id'>) => {
    if (editing) {
      await updateScheduleType(editing.id, data);
    } else {
      await createScheduleType(data);
    }
    setShowForm(false);
    fetchTypes();
  };

  // Filtro e paginação
  const filtered = types.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded shadow p-4">
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Buscar tipo de atendimento" className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
            <Button onClick={handleAdd}>Adicionar</Button>
          </div>
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Nome do tipo de atendimento</th>
                  <th className="text-left py-2 px-2">Duração (min)</th>
                  <th className="text-left py-2 px-2">Cor</th>
                  <th className="text-left py-2 px-2">Data da criação</th>
                  <th className="text-center py-2 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(type => (
                  <tr
                    key={type.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
                    onClick={() => handleEdit(type)}
                  >
                    <td className="py-2 px-2">{type.name}</td>
                    <td className="py-2 px-2">{type.duration}min</td>
                    <td className="py-2 px-2">
                      <span className="inline-block w-5 h-5 rounded-full border" style={{ background: type.color }} />
                    </td>
                    <td className="py-2 px-2">{type.createdAt ? new Date(type.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); handleDelete(type.id); }}
                          title="Excluir"
                        >
                          <span className="text-red-500">&#10005;</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum tipo de atendimento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={page === i + 1 ? 'default' : 'outline'}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Button variant="outline" className="mb-4" onClick={() => setShowForm(false)}>
            Voltar para lista
          </Button>
          <ScheduleTypeForm
            initialData={editing}
            onBack={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
          />
        </>
      )}
    </div>
  );
} 