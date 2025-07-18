import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Protocol, ProtocolService } from "@/lib/api/types/protocol";
import { Plus } from "lucide-react";
import React from "react"; // Added missing import for React

interface BudgetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocols: Protocol[];
  loadingProtocols: boolean;
}

// Função utilitária para extrair o preço do serviço de forma segura
function getServicePrice(ps: ProtocolService): number {
  if (ps.service && typeof ps.service === 'object' && 'price' in ps.service && typeof ps.service.price === 'number') {
    return ps.service.price;
  }
  if (ps.Service && typeof ps.Service === 'object' && 'price' in ps.Service && typeof ps.Service.price === 'number') {
    return ps.Service.price;
  }
  return 0;
}

// Função para garantir que sempre pega os serviços do protocolo
function getProtocolServices(protocol: Protocol): ProtocolService[] {
  if (protocol.services && protocol.services.length > 0) return protocol.services;
  if (protocol.protocolServices && protocol.protocolServices.length > 0) return protocol.protocolServices;
  return [];
}

// MultiSelect customizado para protocolos
function ProtocolMultiSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const selectedOptions = options.filter(opt => value.includes(opt.value));
  const unselectedOptions = options.filter(opt => !value.includes(opt.value));

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap items-center min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        tabIndex={0}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground select-none">{placeholder}</span>
        )}
        {selectedOptions.map(opt => (
          <span key={opt.value} className="flex items-center bg-primary/10 text-primary rounded px-2 py-0.5 mr-1 mb-1 text-xs">
            {opt.label}
            <button
              type="button"
              className="ml-1 text-primary hover:text-red-500 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                onChange(value.filter(v => v !== opt.value));
              }}
              tabIndex={-1}
            >×</button>
          </span>
        ))}
      </div>
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {unselectedOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum protocolo disponível</div>
          ) : (
            unselectedOptions.map(opt => (
              <div
                key={opt.value}
                className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                onClick={() => onChange([...value, opt.value])}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function BudgetDrawer({ open, onOpenChange, protocols, loadingProtocols }: BudgetDrawerProps) {
  const [tab, setTab] = useState("orcamento");
  const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([]);
  const [procedimento, setProcedimento] = useState("");
  const [material, setMaterial] = useState("");
  // Estado para protocolo expandido
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  // Desconto único para o orçamento
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  // Quantidade de cada protocolo
  const [protocolQuantities, setProtocolQuantities] = useState<Record<string, number>>({});

  // Não selecionar protocolo automaticamente ao abrir
  useEffect(() => {
    if (!open) {
      setSelectedProtocolIds([]);
    }
  }, [open]);

  const selectedProtocols = protocols.filter(p => selectedProtocolIds.includes(p.id));

  console.log(protocols);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] w-[80vw]" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle>Orçamento para Paciente</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="mb-4 border-b w-full bg-transparent">
            <TabsTrigger value="orcamento" className="px-4">Orçamento</TabsTrigger>
            <TabsTrigger value="detalhes" className="px-4" disabled>Detalhes</TabsTrigger>
            <TabsTrigger value="pagamento" className="px-4" disabled>Pagamento</TabsTrigger>
          </TabsList>
          <TabsContent value="orcamento">
            <div className="space-y-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Modelos</label>
                  <ProtocolMultiSelect
                    options={protocols.map(protocol => ({ label: protocol.name, value: protocol.id }))}
                    value={selectedProtocolIds}
                    onChange={setSelectedProtocolIds}
                    placeholder={loadingProtocols ? "Carregando..." : "Selecione um ou mais protocolos"}
                    disabled={loadingProtocols}
                  />
                </div>
              </div>
              {/* Tabela de protocolos selecionados com expansão */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full table-auto border rounded">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left text-xs font-semibold">Protocolo</th>
                      <th className="p-2 text-left text-xs font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProtocols.length > 0 ? selectedProtocols.map((protocol) => {
                      let price = 0;
                      if (typeof protocol.totalPrice === 'number') price = protocol.totalPrice;
                      else if (typeof protocol.totalPrice === 'string') price = parseFloat(protocol.totalPrice) || 0;
                      const isExpanded = expandedProtocolId === protocol.id;
                      const quantity = protocolQuantities[protocol.id] || 1;
                      return (
                        <React.Fragment key={protocol.id}>
                          <tr
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => setExpandedProtocolId(isExpanded ? null : protocol.id)}
                          >
                            <td className="p-2 font-medium flex items-center gap-2">
                              <span>{protocol.name}</span>
                              <span className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  className="px-2 py-0.5 border rounded text-lg font-bold bg-muted hover:bg-accent"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setProtocolQuantities(q => ({ ...q, [protocol.id]: Math.max(1, (q[protocol.id] || 1) - 1) }));
                                  }}
                                >-</button>
                                <span className="w-6 text-center">{quantity}</span>
                                <button
                                  type="button"
                                  className="px-2 py-0.5 border rounded text-lg font-bold bg-muted hover:bg-accent"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setProtocolQuantities(q => ({ ...q, [protocol.id]: (q[protocol.id] || 1) + 1 }));
                                  }}
                                >+</button>
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">{isExpanded ? '▲' : '▼'}</span>
                            </td>
                            <td className="p-2">R$ {(price * quantity).toFixed(2)}</td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={2} className="bg-muted/30 p-2">
                                <div className="pl-4">
                                  <table className="w-full table-auto">
                                    <thead>
                                      <tr>
                                        <th className="p-1 text-left text-xs font-semibold">Serviço</th>
                                        <th className="p-1 text-left text-xs font-semibold">Nº Sessões</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(protocol.services && protocol.services.length > 0 ? protocol.services : (protocol.protocolServices || [])).map((ps, idx) => (
                                        <tr key={ps.id || idx}>
                                          <td className="p-1 text-xs">{ps.service?.name || ps.Service?.name || '-'}</td>
                                          <td className="p-1 text-xs">{ps.numberOfSessions || 1}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }) : (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-muted-foreground">Selecione um ou mais protocolos para ver os valores</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Totais e desconto visual igual ao exemplo */}
              <div className="flex flex-col items-end mt-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                  {/* Valor total */}
                  <span>
                    Valor total <span className="font-semibold text-foreground">R$ {selectedProtocols.reduce((acc, p) => {
                      let price = 0;
                      if (typeof p.totalPrice === 'number') price = p.totalPrice;
                      else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                      const quantity = protocolQuantities[p.id] || 1;
                      return acc + price * quantity;
                    }, 0).toFixed(2)}</span>
                  </span>
                  {/* Desconto total */}
                  <span>
                    Desconto total <span className="font-semibold text-foreground">R$ {(() => {
                      const total = selectedProtocols.reduce((acc, p) => {
                        let price = 0;
                        if (typeof p.totalPrice === 'number') price = p.totalPrice;
                        else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                        const quantity = protocolQuantities[p.id] || 1;
                        return acc + price * quantity;
                      }, 0);
                      return (total * (globalDiscount / 100)).toFixed(2);
                    })()} ({globalDiscount}%)</span>
                  </span>
                  {/* Separador visual */}
                  <span className="text-muted-foreground">|</span>
                  {/* Total final em azul com ícone de editar */}
                  <span>
                    Total <span className="font-semibold text-primary">R$ {(() => {
                      const total = selectedProtocols.reduce((acc, p) => {
                        let price = 0;
                        if (typeof p.totalPrice === 'number') price = p.totalPrice;
                        else if (typeof p.totalPrice === 'string') price = parseFloat(p.totalPrice) || 0;
                        const quantity = protocolQuantities[p.id] || 1;
                        return acc + price * quantity;
                      }, 0);
                      return (total * (1 - globalDiscount / 100)).toFixed(2);
                    })()}</span> <span className="inline-block align-middle text-primary cursor-pointer"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232a3 3 0 1 1 4.243 4.243L7.5 21H3v-4.5L15.232 5.232Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  </span>
                </div>
                {/* Campo de desconto adicional abaixo */}
                <div className="flex items-center gap-2 mt-2">
                  <span>Desconto adicional:</span>
                  <div className="flex items-center gap-1">
                    <Input
                      className="w-20"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={globalDiscount}
                      onChange={e => setGlobalDiscount(Number(e.target.value))}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button>Salvar alterações</Button>
              </div>
            </div>
          </TabsContent>
          {/* TabsContent para detalhes e pagamento serão implementados depois */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 