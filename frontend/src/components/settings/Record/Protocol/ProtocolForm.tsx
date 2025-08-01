import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Protocol } from "@/lib/api";
import { protocolApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { Service } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Settings, Calendar, Clock, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const serviceTypes = [
  { value: 'consultation', label: 'Consulta', icon: '🩺' },
  { value: 'injection', label: 'Injeção', icon: '💉' },
  { value: 'massage', label: 'Massagem', icon: '💆' },
  { value: 'drainage', label: 'Drenagem', icon: '🌊' },
  { value: 'calometry', label: 'Calometria', icon: '🔥' },
] as const;

const protocolSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  totalPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  services: z.array(z.object({
    name: z.string().min(1, "Nome do serviço é obrigatório"),
    type: z.enum(['consultation', 'injection', 'massage', 'drainage', 'calometry'], {
      required_error: "Tipo do serviço é obrigatório",
    }),
    requiresScheduling: z.boolean().default(false),
    numberOfSessions: z.coerce.number().min(1, "Número de sessões deve ser maior que zero"),
    requiresIntervalControl: z.boolean().default(false),
  })).min(1, "Adicione pelo menos um serviço"),
});

type ProtocolFormValues = z.infer<typeof protocolSchema>;

interface ProtocolFormProps {
  protocol?: Protocol | null;
  onSubmit: (data: ProtocolFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function ServiceCard({ children, onRemove, index }: { 
  children: React.ReactNode; 
  onRemove: () => void; 
  index: number;
}) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
              {index + 1}
            </Badge>
            Serviço {index + 1}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

export function ProtocolForm({ protocol, onSubmit, onCancel, isSubmitting }: ProtocolFormProps) {
  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      name: protocol?.name || "",
      totalPrice: protocol?.totalPrice || 0,
      services:
        (protocol?.services?.length
          ? protocol.services
          : protocol?.protocolServices?.map(ps => ({
              name: ps.service?.name || "",
              type: ps.service?.type || "consultation",
              requiresScheduling: ps.service?.requiresScheduling ?? false,
              numberOfSessions: ps.numberOfSessions ?? 1,
              requiresIntervalControl: ps.requiresIntervalControl ?? false,
            }))
        ) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const getServiceTypeIcon = (type: string) => {
    return serviceTypes.find(t => t.value === type)?.icon || '🔧';
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header Section */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">
                {protocol ? 'Editar Protocolo' : 'Novo Protocolo'}
              </h1>
              <p className="text-muted-foreground">
                Configure os serviços e parâmetros do protocolo de tratamento
              </p>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Protocolo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Protocolo Anti-idade Facial" 
                            {...field} 
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            {...field}
                            className="text-base"
                            onChange={(e) => {
                              const value = e.target.value === '' ? '0' : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Services Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Serviços do Protocolo</h2>
                <p className="text-sm text-muted-foreground">
                  Configure cada serviço que compõe este protocolo
                </p>
              </div>
              <Button
                type="button"
                onClick={() => append({ 
                  name: "", 
                  type: "consultation", 
                  requiresScheduling: false, 
                  numberOfSessions: 1, 
                  requiresIntervalControl: false 
                })}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            {fields.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhum serviço adicionado ainda.<br />
                    Clique em "Adicionar Serviço" para começar.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {fields.map((field, index) => (
                <ServiceCard key={field.id} onRemove={() => remove(index)} index={index}>
                  <div className="space-y-6">
                    {/* Service Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`services.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Serviço</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Aplicação de Botox" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo do Serviço</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{type.icon}</span>
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Sessions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`services.${index}.numberOfSessions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Sessões</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? '1' : e.target.value;
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center pt-8">
                        <Badge variant="secondary" className="text-sm">
                          {getServiceTypeIcon(form.watch(`services.${index}.type`))} {
                            serviceTypes.find(t => t.value === form.watch(`services.${index}.type`))?.label
                          }
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Service Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Configurações do Serviço
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`services.${index}.requiresScheduling`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <FormLabel className="text-sm font-medium">
                                    Requer Agendamento
                                  </FormLabel>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Necessário agendar com antecedência
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`services.${index}.requiresIntervalControl`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <FormLabel className="text-sm font-medium">
                                    Controle de Intervalo
                                  </FormLabel>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Controlar tempo entre sessões
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </ServiceCard>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="lg"
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || fields.length === 0}
              size="lg"
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : protocol ? (
                "Salvar Alterações"
              ) : (
                "Criar Protocolo"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}