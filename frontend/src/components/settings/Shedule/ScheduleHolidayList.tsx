import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getScheduleHolidays, createScheduleHoliday, updateScheduleHoliday, deleteScheduleHoliday } from '@/lib/api/services/schedule';
import { ScheduleHoliday } from '@/lib/api/types/schedule';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const PAGE_SIZE = 10;

export default function ScheduleHolidayList() {
  const [holidays, setHolidays] = useState<ScheduleHoliday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleHoliday | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<Partial<ScheduleHoliday>>({});

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    const res = await getScheduleHolidays();
    setHolidays(res.data);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (holiday: ScheduleHoliday) => {
    setEditing(holiday);
    setFormData(holiday);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este feriado?')) {
      await deleteScheduleHoliday(id);
      fetchHolidays();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.day || !formData.month) return;
    if (editing) {
      await updateScheduleHoliday(editing.id, formData);
    } else {
      await createScheduleHoliday({
        name: formData.name!,
        type: formData.type || 'recurring',
        day: formData.day!,
        month: formData.month!,
        year: formData.year,
      });
    }
    setShowForm(false);
    fetchHolidays();
  };

  // Filtro e paginação
  const filtered = holidays.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Buscar nome do feriado" className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
        <Button onClick={handleAdd}>Adicionar</Button>
      </div>
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Nome do feriado</th>
              <th className="text-left py-2 px-2">Data</th>
              <th className="text-center py-2 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(holiday => (
              <tr
                key={holiday.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
                onClick={() => handleEdit(holiday)}
              >
                <td className="py-2 px-2">{holiday.name}</td>
                <td className="py-2 px-2">{holiday.day.toString().padStart(2, '0')} de {getMonthName(holiday.month)}</td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={e => { e.stopPropagation(); handleDelete(holiday.id); }}
                      title="Excluir"
                    >
                      <span className="text-red-500">&#10005;</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">Nenhum feriado encontrado.</td></tr>
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar feriado' : 'Adicionar feriado'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Tipo *</label>
              <Select value={formData.type || 'recurring'} onValueChange={value => setFormData(f => ({ ...f, type: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Recorrente</SelectItem>
                  <SelectItem value="specific">Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">Nome *</label>
              <Input value={formData.name || ''} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block mb-1">Dia *</label>
                <Input type="number" min={1} max={31} value={formData.day || ''} onChange={e => setFormData(f => ({ ...f, day: Number(e.target.value) }))} required />
              </div>
              <div>
                <label className="block mb-1">Mês *</label>
                <Select value={formData.month ? String(formData.month) : ''} onValueChange={value => setFormData(f => ({ ...f, month: Number(value) }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{getMonthName(i + 1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.type === 'specific' && (
                <div>
                  <label className="block mb-1">Ano *</label>
                  <Input type="number" min={1900} max={2100} value={formData.year || ''} onChange={e => setFormData(f => ({ ...f, year: Number(e.target.value) }))} required />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getMonthName(month: number) {
  const months = [
    '',
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  return months[month] || '';
} 