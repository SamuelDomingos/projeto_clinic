import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getScheduleConfigs, updateScheduleConfig, getScheduleTypes, createScheduleConfig } from '@/lib/api/services';
import { ScheduleConfig, Supplier } from '@/lib/api/types';
import { getSuppliers } from '@/lib/api/services/supplier';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

export default function ScheduleClinicConfig() {
  const [configs, setConfigs] = useState<ScheduleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ScheduleConfig>>({});
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const { toast } = useToast();

  // Carrega suppliers e types primeiro
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      const [suppliersRes, typesRes, configsRes] = await Promise.all([
        getSuppliers(),
        getScheduleTypes(),
        getScheduleConfigs(),
      ]);
      if (!mounted) return;
      setSuppliers(suppliersRes);
      setTypes(typesRes.data);
      setConfigs(configsRes.data);

      if (configsRes.data[0]) {
        setForm({
          ...configsRes.data[0],
          unit: configsRes.data[0].unit && typeof configsRes.data[0].unit === 'object' && configsRes.data[0].unit !== null
            ? configsRes.data[0].unit.id
            : configsRes.data[0].unit
        });
      } else {
        setForm({
          defaultView: 'Semana',
          blockInterval: 30,
          workingDays: ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'],
          startTime: '07:00',
          endTime: '22:00',
          unit: suppliersRes[0]?.id ? String(suppliersRes[0].id) : undefined,
          defaultTypeName: '',
          notes: '',
        });
      }
      setLoading(false);
    }
    loadAll();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDaysChange = (day: string) => {
    setForm(f => {
      const days = f.workingDays || [];
      return {
        ...f,
        workingDays: days.includes(day)
          ? days.filter(d => d !== day)
          : [...days, day],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Garante todos os campos obrigatórios
    const payload = {
      defaultView: form.defaultView ?? 'Semana',
      blockInterval: form.blockInterval ?? 30,
      workingDays: form.workingDays ?? [],
      startTime: form.startTime ?? '07:00',
      endTime: form.endTime ?? '22:00',
      unit: form.unit ? String(form.unit) : '',
      defaultTypeName: form.defaultTypeName ?? '',
      notes: form.notes ?? '',
    };
    let res;
    try {
      if (form.id) {
        res = await updateScheduleConfig(form.id, payload);
      } else {
        res = await createScheduleConfig(payload);
      }
      // Normaliza o form para garantir que unit seja sempre o id (string)
      const normalizedForm = {
        ...res.data,
        unit: res.data.unit && typeof res.data.unit === 'object' && res.data.unit !== null
          ? res.data.unit.id
          : res.data.unit
      };
      setForm(normalizedForm);
      setConfigs([res.data]);
      toast({
        title: 'Alterações salvas!',
        description: 'As configurações foram atualizadas com sucesso.',
        variant: 'default',
      });
      console.log('Dados recebidos do backend:', res.data);
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    // Crie um objeto padrão, ajuste conforme necessário
    const defaultConfig = {
      defaultView: 'Semana',
      blockInterval: 30,
      workingDays: ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira'],
      startTime: '07:00',
      endTime: '22:00',
      unit: suppliers[0]?.id ? String(suppliers[0].id) : '',
      defaultTypeName: '',
      notes: '',
    };
    const res = await createScheduleConfig(defaultConfig);
    setForm(res.data);
    setConfigs([res.data]);
    setSaving(false);
  };

  const dias = [
    'Segunda-Feira',
    'Terça-Feira',
    'Quarta-Feira',
    'Quinta-Feira',
    'Sexta-Feira',
    'Sábado',
    'Domingo',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definições gerais</CardTitle>
        <CardDescription>Visualize e edite as configurações gerais da agenda da clínica.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <form className="space-y-6 w-full">
            {/* Linha 1 */}
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1">Visualização padrão</label>
                <Select value={form.defaultView || ''} onValueChange={value => setForm(f => ({ ...f, defaultView: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semana">Semana</SelectItem>
                    <SelectItem value="Dia">Dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1">Intervalo de blocos <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <Input type="number" name="blockInterval" value={form.blockInterval || ''} onChange={handleChange} className="w-24" min={1} />
                  <span className="ml-2 text-xs text-gray-500">Min</span>
                </div>
              </div>
            </div>
            {/* Linha 2 */}
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1">Unidade padrão</label>
                <Select
                  value={form.unit ?? ''}
                  onValueChange={value => {
                    setForm(f => ({
                      ...f,
                      unit: value === '' ? undefined : value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1">Atendimento padrão</label>
                <Input
                  type="text"
                  name="defaultTypeName"
                  value={form.defaultTypeName || ''}
                  onChange={e => setForm(f => ({ ...f, defaultTypeName: e.target.value }))}
                  placeholder="Digite o atendimento padrão"
                  className="w-full"
                />
              </div>
            </div>
            {/* Dias de funcionamento */}
            <div>
              <label className="block text-xs font-medium mb-1">Dias de funcionamento <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4">
                {dias.map(day => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!form.workingDays?.includes(day)}
                      onCheckedChange={checked => handleDaysChange(day)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Horário de funcionamento */}
            <div>
              <label className="block text-xs font-medium mb-1">Horário de funcionamento</label>
              <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium mb-1">Início</label>
                  <div className="flex items-center">
                    <Input type="time" name="startTime" value={form.startTime || ''} onChange={handleChange} className="w-24" />
                    <span className="ml-2 text-xs text-gray-500">Horas</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium mb-1">Fim</label>
                  <div className="flex items-center">
                    <Input type="time" name="endTime" value={form.endTime || ''} onChange={handleChange} className="w-24" />
                    <span className="ml-2 text-xs text-gray-500">Horas</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Outras informações */}
            <div>
              <label className="block text-xs font-medium mb-1">Outras informações</label>
              <Textarea name="notes" value={form.notes || ''} onChange={handleChange} className="w-full min-h-[48px]" rows={2} />
            </div>
            {/* Botão */}
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} className="px-6 py-2" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 