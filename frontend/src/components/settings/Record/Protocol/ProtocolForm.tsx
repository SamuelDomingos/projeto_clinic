import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Protocol } from "@/lib/api";
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
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceTypes = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'injection', label: 'Injeção' },
  { value: 'massage', label: 'Massagem' },
  { value: 'drainage', label: 'Drenagem' },
  { value: 'calometry', label: 'Calometria' },
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

function ServiceItem({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex gap-4 items-start p-4 border rounded-lg bg-background">
      <div className="flex-1">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProtocolForm({ protocol, onSubmit, onCancel, isSubmitting }: ProtocolFormProps) {
  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      name: protocol?.name || "",
      totalPrice: protocol?.totalPrice || 0,
      services: protocol?.services.map(s => ({
        name: s.name || "",
        type: s.type || "consultation",
        requiresScheduling: s.requiresScheduling || false,
        numberOfSessions: s.numberOfSessions || 1,
        requiresIntervalControl: s.requiresIntervalControl || false,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Protocolo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do protocolo" {...field} />
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
                <FormLabel>Preço Total</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-lg">Serviços</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ 
                name: "", 
                type: "consultation",
                requiresScheduling: false,
                numberOfSessions: 1, 
                requiresIntervalControl: false 
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <ServiceItem
                key={field.id}
                onRemove={() => remove(index)}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`services.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Serviço</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome do serviço" {...field} />
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-medium">Permissões do Serviço</h3>
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name={`services.${index}.requiresScheduling`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Requer Agendamento
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Marque se este serviço requer agendamento prévio
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Controle de Intervalo
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Marque se este serviço requer controle de intervalo entre sessões
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
              </ServiceItem>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
} 