import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api/services/user';
import { User } from '@/lib/api/types/common';
import { Button } from '@/components/ui/button';
import ScheduleGrid from '@/components/ui/ScheduleGrid';
import { useScheduleConfig } from '@/contexts/ScheduleConfigContext';

const dayNameToIndex: Record<string, number> = {
  'Domingo': 0,
  'Segunda-Feira': 1,
  'Terça-Feira': 2,
  'Quarta-Feira': 3,
  'Quinta-Feira': 4,
  'Sexta-Feira': 5,
  'Sábado': 6,
};

function getStartOfWeek(dayIndex: number, weekOffset = 0) {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = (currentDay - dayIndex + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - diff + weekOffset * 7);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function ExecutorConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { config, hours, loading: loadingConfig } = useScheduleConfig();
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (id) {
      userApi.getById(id).then(setUser).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || loadingConfig) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-red-500">Profissional não encontrado.</div>;
  }

  function getWeekLabel() {
    if (!config?.workingDays?.length) return '';
    const firstDayIndex = dayNameToIndex[config.workingDays[0]] ?? 1;
    const start = getStartOfWeek(firstDayIndex, weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + config.workingDays.length - 1);
    const options = { day: '2-digit', month: 'short' } as const;
    return `${start.getDate()} – ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'short' })}`;
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
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>{'<'}</Button>
          <span className="font-semibold">{getWeekLabel()}</span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>{'>'}</Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Hoje</Button>
                  {/* Legenda */}
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-blue-200 border border-blue-400"></span> Recorrente</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-yellow-200 border border-yellow-400"></span> Exceções</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-red-200 border border-red-400"></span> Indisponível</span>
        </div>
        </div>
        {/* Grade de horários (dinâmica) */}
        <ScheduleGrid weekDays={config?.workingDays || []} hours={hours} weekOffset={weekOffset} />
      </div>
    </div>
  );
} 