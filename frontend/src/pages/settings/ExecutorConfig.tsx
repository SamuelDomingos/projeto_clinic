import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api/services/user';
import { User } from '@/lib/api/types/common';
import { Button } from '@/components/ui/button';
import ScheduleGrid from '@/components/ui/ScheduleGrid';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const hours = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

export default function ExecutorConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      userApi.getById(id).then(setUser).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-red-500">Profissional não encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Configurações do executante</h1>
      <div className="text-gray-500 mb-6">Nesta seção você pode gerenciar os horários do executante.</div>
      <div className="bg-white dark:bg-background rounded shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            <span className="font-semibold text-lg">Unidades</span>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Infinity Fortaleza</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Bloquear Agenda</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold text-lg">{user.name}</span>
          {/* Aqui pode exibir o nome do executante */}
        </div>
        {/* Barra de navegação da semana */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm">{'<'}</Button>
          <span className="font-semibold">14 – 19 de jul de 2025</span>
          <Button variant="outline" size="sm">{'>'}</Button>
          <Button variant="outline" size="sm">Hoje</Button>
                  {/* Legenda */}
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-blue-200 border border-blue-400"></span> Recorrente</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-yellow-200 border border-yellow-400"></span> Exceções</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-red-200 border border-red-400"></span> Indisponível</span>
        </div>
        </div>
        {/* Grade de horários (placeholder visual) */}
        <ScheduleGrid weekDays={weekDays} hours={hours} />
      </div>
    </div>
  );
} 