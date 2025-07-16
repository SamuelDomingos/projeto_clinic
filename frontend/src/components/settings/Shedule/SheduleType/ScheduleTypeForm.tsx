import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/contexts/ThemeContext';
import { protocolApi } from '@/lib/api/services/protocol';
import { toast } from '@/components/ui/use-toast';
import { Protocol } from '@/lib/api/types/protocol';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { ScheduleType } from '@/lib/api/types/schedule';

const COLORS = [
  '#FDE68A', // amarelo pastel
  '#A7F3D0', // verde água
  '#BFDBFE', // azul claro
  '#FCA5A5', // vermelho claro
  '#C4B5FD', // roxo claro
  '#F9A8D4', // rosa claro
  '#6EE7B7', // verde claro
  '#FECACA', // rosa bebê
  '#FCD34D', // amarelo claro
  '#A5B4FC', // azul pastel
];

// Função para garantir contraste do texto na pré-visualização
function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace('#', '');
  if (hexcolor.length !== 6) return '#222';
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return yiq >= 128 ? '#222' : '#fff';
}

// Função para gerar cor de fundo translúcida baseada na cor escolhida
function getPreviewBg(hex, dark = false) {
  if (!hex) return dark ? '#16232b' : '#f3fbfd';
  // Converte hex para RGB
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  // Opacidade diferente para claro/escuro
  return dark
    ? `rgba(${r},${g},${b},0.18)`
    : `rgba(${r},${g},${b},0.12)`;
}

// Função utilitária para somar minutos a um horário (formato HH:mm)
function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m + Number(minutes));
  return date.toTimeString().slice(0,5);
}

// Função para detectar modo escuro
function isDarkMode() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

// Tipo para o serviço retornado pelo backend
interface ProtocolServiceBackend {
  id: string;
  numberOfSessions: number;
  requiresIntervalControl: boolean;
  defaultDuration?: number;
  service?: {
    id: string;
    name: string;
    type: string;
    requiresScheduling: boolean;
    createdAt: string;
    // outros campos se necessário
  };
  Service?: {
    id: string;
    name: string;
    type: string;
    requiresScheduling: boolean;
    createdAt: string;
    // outros campos se necessário
  };
  // outros campos se necessário
}

export default function ScheduleTypeForm({ onBack, onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    displayName: initialData?.displayName || '',
    duration: initialData?.duration || '',
    color: initialData?.color || COLORS[0],
    costCenter: initialData?.costCenter || '',
    financialDescription: initialData?.financialDescription || '',
    receiptDescription: initialData?.receiptDescription || '',
    procedures: initialData?.procedures || [],
    noSms: initialData?.noSms || false,
    noRegisterSms: initialData?.noRegisterSms || false,
  });
  const [saving, setSaving] = useState(false);
  const { colors, isDarkMode } = useTheme();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  // Remover toda a lógica de servicesByProtocol e useEffect de listServices
  const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>(
    initialData?.selectedProtocolIds && Array.isArray(initialData.selectedProtocolIds)
      ? initialData.selectedProtocolIds
      : []
  );
  const [protocolsState, setProtocolsState] = useState<Protocol[]>([]);
  const [tipoAgendamento, setTipoAgendamento] = useState<'protocolo' | 'avulso'>(
    initialData?.scheduleType === 'protocol' ? 'protocolo' : 'avulso'
  );

  console.log(protocols);
  

  useEffect(() => {
    protocolApi.list().then(protocols => {
      setProtocols(protocols);
    });
  }, []);

  // Removido: useEffect que sobrescrevia protocolsState ao mudar protocols

  useEffect(() => {
    setProtocolsState(prev => {
      // Adiciona protocolos recém-selecionados mantendo os já editados
      const prevById = Object.fromEntries(prev.map(p => [p.id, p]));
      // Adiciona novos protocolos (do backend) apenas se não existirem no state
      const newProtocols = selectedProtocolIds
        .map(id => prevById[id] || protocols.find(proto => proto.id === id))
        .filter(Boolean);

      // Remove protocolos que foram desmarcados
      return newProtocols;
    });
    // Só depende de selectedProtocolIds e protocols.length (não protocols inteiro!)
  }, [selectedProtocolIds, protocols.length]);

  // Se initialData mudar (edição), atualize os estados
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        displayName: initialData.displayName || '',
        duration: initialData.duration || '',
        color: initialData.color || COLORS[0],
        costCenter: initialData.costCenter || '',
        financialDescription: initialData.financialDescription || '',
        receiptDescription: initialData.receiptDescription || '',
        procedures: initialData.procedures || [],
        noSms: initialData.noSms || false,
        noRegisterSms: initialData.noRegisterSms || false,
      });
      setTipoAgendamento(initialData.scheduleType === 'protocol' ? 'protocolo' : 'avulso');
      setSelectedProtocolIds(
        initialData.selectedProtocolIds && Array.isArray(initialData.selectedProtocolIds)
          ? initialData.selectedProtocolIds
          : []
      );
      // Merge dos serviços customizados do agendamento
      if (
        initialData.scheduleType === 'protocol' &&
        Array.isArray(initialData.protocolsAndServices)
      ) {
        setProtocolsState(
          protocols
            .filter(proto => initialData.selectedProtocolIds.includes(proto.id))
            .map(proto => {
              const custom = initialData.protocolsAndServices.find(
                p => p.protocolId === proto.id
              );
              if (custom) {
                // Merge nos serviços
                const mergedServices = (proto.protocolServices ?? []).map(service => {
                  const customService = custom.services.find(
                    s => s.serviceId === (service.service?.id || service.Service?.id)
                  );
                  return customService
                    ? { ...service, ...customService }
                    : service;
                });
                return { ...proto, protocolServices: mergedServices };
              }
              return proto;
            })
        );
      } else {
        setProtocolsState(protocols);
      }
    }
  }, [initialData, protocols]);

  // Remover toda a lógica de servicesByProtocol e useEffect de listServices
  // const selectedProtocols = protocols.filter(p => selectedProtocolIds.includes(p.id));
  // console.log('Protocolos selecionados:', selectedProtocols);
  // console.log('Serviços dos protocolos selecionados:', servicesByProtocol);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleColorSelect = color => {
    setForm(f => ({ ...f, color }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSaving(true);

    // Montar protocolsAndServices
    let protocolsAndServices = [];
    if (tipoAgendamento === 'protocolo') {
      protocolsAndServices = protocolsState
        .filter(proto => selectedProtocolIds.includes(proto.id))
        .map(proto => ({
          protocolId: proto.id,
          services: (proto.protocolServices ?? []).map(ps => ({
            serviceId: ps.service?.id || ps.Service?.id,
            numberOfSessions: ps.numberOfSessions,
            defaultDuration: ps.defaultDuration,
            requiresScheduling: ps.service?.requiresScheduling ?? ps.Service?.requiresScheduling ?? false,
            requiresIntervalControl: ps.requiresIntervalControl ?? false,
          })),
        }));
    }

    const payload: Partial<ScheduleType> = {
      ...form,
      duration: Number(form.duration),
      scheduleType: tipoAgendamento === 'protocolo' ? 'protocol' : 'single',
    };

    if (tipoAgendamento === 'protocolo' && selectedProtocolIds.length > 0 && protocolsAndServices.length > 0) {
      payload.selectedProtocolIds = selectedProtocolIds;
      payload.protocolsAndServices = protocolsAndServices;
    }

    // Remover campos que não fazem parte do backend
    if (Object.prototype.hasOwnProperty.call(payload, 'procedures')) {
      delete (payload as Partial<ScheduleType> & { procedures?: unknown }).procedures;
    }

    setTimeout(() => {
      setSaving(false);
      if (onSubmit) onSubmit(payload);
    }, 1000);
  };

  const handleSessionChange = (protocolId, psId, value) => {
    setProtocolsState(prev =>
      prev.map(proto =>
        proto.id === protocolId
          ? {
              ...proto,
              protocolServices: (proto.protocolServices ?? []).map(ps =>
                ps.id === psId ? { ...ps, numberOfSessions: Number(value) } : ps
              ),
            }
          : proto
      )
    );
  };

  const handleSchedulingChange = (protocolId, psId, checked) => {
    setProtocolsState(prev =>
      prev.map(proto =>
        proto.id === protocolId
          ? {
              ...proto,
              protocolServices: (proto.protocolServices ?? []).map(ps => {
                if (ps.id !== psId) return ps;
                if (ps.Service) {
                  return { ...ps, Service: { ...ps.Service, requiresScheduling: checked } };
                } else if (ps.service) {
                  return { ...ps, service: { ...ps.service, requiresScheduling: checked } };
                }
                return ps;
              }),
            }
          : proto
      )
    );
  };

  const handleIntervalChange = (protocolId, psId, checked) => {
    setProtocolsState(prev =>
      prev.map(proto =>
        proto.id === protocolId
          ? {
              ...proto,
              protocolServices: (proto.protocolServices ?? []).map(ps =>
                ps.id === psId ? { ...ps, requiresIntervalControl: checked } : ps
              ),
            }
          : proto
      )
    );
  };

  // Função para editar o tempo padrão de cada sessão
  function handleSessionDurationChange(protocolId, psId, value) {
    setProtocolsState(prev =>
      prev.map(proto =>
        proto.id === protocolId
          ? {
              ...proto,
              protocolServices: (proto.protocolServices ?? []).map(ps =>
                ps.id === psId
                  ? { ...ps, defaultDuration: value === '' ? undefined : Number(value) }
                  : ps
              ),
            }
          : proto
      )
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados do procedimento */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do procedimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-medium mb-1">Nome *</label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nome de exibição (Agendador)</label>
              <Input name="displayName" value={form.displayName} onChange={handleChange} />
            </div>
            {tipoAgendamento === 'avulso' && (
              <div>
                <label className="block text-xs font-medium mb-1">Duração *</label>
                <div className="flex items-center gap-2">
                  <Input name="duration" type="number" value={form.duration} onChange={handleChange} required min={1} className="w-24" />
                  <span className="text-xs text-gray-500">Min</span>
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Cor de exibição</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLORS.map(color => (
                  <button
                    type="button"
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${form.color === color ? 'border-primary' : 'border-gray-200'}`}
                    style={{ background: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              {/* Pré-visualização minimalista: só círculo colorido e nome do atendimento */}
              <div className="mt-4">
                <span className="block text-xs text-muted-foreground mb-1">Pré visualização</span>
                <div
                  className="rounded-lg px-4 py-3"
                  style={{
                    background: getPreviewBg(form.color, isDarkMode),
                    border: `1.5px solid ${form.color}`,
                    minHeight: 56,
                    transition: 'background 0.2s, border 0.2s',
                  }}
                >
                  {(() => {
                    // Usa foreground do tema no escuro, contraste automático no claro
                    const color = isDarkMode
                      ? colors.foreground
                      : getContrastYIQ(form.color);
                    return (
                      <>
                        <div className="text-[13px] opacity-70 leading-tight" style={{ color }}>
                          10:30 - {form.duration ? addMinutesToTime('10:30', form.duration) : '11:15'} - Unidade
                        </div>
                        <div className="font-semibold text-base leading-tight" style={{ color }}>
                            Nome do paciente
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Configurações de padrões */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configurações de padrões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Tipo de agendamento */}
          <div>
            <span className="block text-xs font-medium mb-1">Tipo de agendamento</span>
            <RadioGroup value={tipoAgendamento} onValueChange={val => setTipoAgendamento(val as 'protocolo' | 'avulso')} className="flex gap-6 mt-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="protocolo" id="protocolo" />
                <label htmlFor="protocolo" className="text-xs cursor-pointer">Procedimento/protocolo</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="avulso" id="avulso" />
                <label htmlFor="avulso" className="text-xs cursor-pointer">Agendamento avulso</label>
              </div>
            </RadioGroup>
            <span className="block text-xs text-muted-foreground mt-1">Escolha se este tipo de atendimento será vinculado a um protocolo ou será avulso.</span>
          </div>
          {/* Opções de SMS */}
          <div className="flex flex-wrap gap-6 items-center">
            <Checkbox id="noSms" checked={form.noSms} onCheckedChange={checked => setForm(f => ({ ...f, noSms: !!checked }))} />
            <label htmlFor="noSms" className="text-xs cursor-pointer">Não enviar SMS de confirmação</label>
            <Checkbox id="noRegisterSms" checked={form.noRegisterSms} onCheckedChange={checked => setForm(f => ({ ...f, noRegisterSms: !!checked }))} />
            <label htmlFor="noRegisterSms" className="text-xs cursor-pointer">Não enviar SMS de cadastro</label>
          </div>
          {/* Seletor de protocolos (apenas se protocolo) */}
          {tipoAgendamento === 'protocolo' && (
            <div className="mb-4" style={{ maxWidth: 480 }}>
              <label className="block text-sm font-medium mb-1">Protocolos</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full border rounded px-3 py-2 text-left">
                    {selectedProtocolIds.length
                      ? `${selectedProtocolIds.length} protocolo(s) selecionado(s)`
                      : 'Selecione protocolos'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <Command>
                    <CommandInput placeholder="Buscar protocolo..." />
                    <CommandList>
                      {protocols.map(protocol => (
                        <CommandItem
                          key={protocol.id}
                          onSelect={() => {
                            setSelectedProtocolIds(ids =>
                              ids.includes(protocol.id)
                                ? ids.filter(id => id !== protocol.id)
                                : [...ids, protocol.id]
                            );
                          }}
                        >
                          <Checkbox checked={selectedProtocolIds.includes(protocol.id)} />
                          <span className="ml-2">{protocol.name}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {/* Tabela de serviços dos protocolos selecionados */}
          {tipoAgendamento === 'protocolo' && selectedProtocolIds.length > 0 && (
            <div className="mb-4">
              <span className="block text-xs font-medium mb-1">Serviços deste procedimento:</span>
              {protocolsState.filter(p => selectedProtocolIds.includes(p.id)).map(protocol => {
                const protocolServices =
                  Array.isArray((protocol as { protocolServices?: ProtocolServiceBackend[] }).protocolServices)
                    ? (protocol as { protocolServices?: ProtocolServiceBackend[] }).protocolServices!
                    : [];
                console.log('protocol:', protocol);
                console.log('protocolServices:', protocolServices);
                return (
                  <div key={protocol.id} className="mb-4 border rounded-lg p-3 bg-muted/40">
                    <div className="font-semibold mb-2">{protocol.name}</div>
                    {protocolServices.length > 0 ? (
                      <div className="rounded-lg border border-muted bg-background">
                        <table className="min-w-full text-xs">
                          <thead className="bg-muted/60">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold">Atendimento</th>
                              <th className="px-3 py-2 font-semibold text-center">Sessões</th>
                              <th className="px-3 py-2 font-semibold text-center">Tempo padrão (min)</th>
                              <th className="px-3 py-2 font-semibold text-center">Agendamento obrigatório</th>
                              <th className="px-3 py-2 font-semibold text-center">Intervalo obrigatório</th>
                            </tr>
                          </thead>
                          <tbody>
                            {protocolServices.map((ps, idx) => (
                              <tr key={ps.id || idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                <td className="px-3 py-2 whitespace-nowrap font-medium">{ps.service?.name}</td>
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={ps.numberOfSessions}
                                    onChange={e => handleSessionChange(protocol.id, ps.id, e.target.value)}
                                    className="w-16 h-8 text-center mx-auto"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={ps.defaultDuration !== undefined && ps.defaultDuration !== null ? ps.defaultDuration : ''}
                                    onChange={e => handleSessionDurationChange(protocol.id, ps.id, e.target.value)}
                                    className="w-16 h-8 text-center mx-auto"
                                    placeholder="min"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Checkbox
                                    checked={!!(ps.service && 'requiresScheduling' in ps.service ? ps.service.requiresScheduling : false)}
                                    onCheckedChange={checked => handleSchedulingChange(protocol.id, ps.id, !!checked)}
                                    className="mx-auto"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Checkbox
                                    checked={!!ps.requiresIntervalControl}
                                    onCheckedChange={checked => handleIntervalChange(protocol.id, ps.id, !!checked)}
                                    className="mx-auto"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span className="ml-2 text-xs text-muted-foreground">Nenhum atendimento cadastrado neste protocolo.</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
            {/* Configurações financeiras */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configurações financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Centro de custo padrão</label>
              <Input name="costCenter" value={form.costCenter} onChange={handleChange} placeholder="Buscar" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Discriminação do serviço (Nota Fiscal)</label>
              <Textarea name="financialDescription" value={form.financialDescription} onChange={handleChange} rows={2} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Descrição do serviço (Recibo)</label>
              <Textarea name="receiptDescription" value={form.receiptDescription} onChange={handleChange} rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Botões */}
      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar'}</Button>
      </div>
    </form>
  );
} 