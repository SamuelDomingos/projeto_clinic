import { Supplier } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface SupplierFormData {
  type: "fornecedor" | "unidade";
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  cnpj: string;
  address: string;
  contactPerson: string;
  status: "active" | "inactive";
}

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSave: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
}

const SupplierForm = ({ supplier, onSave, onCancel }: SupplierFormProps) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    type: supplier?.type || "fornecedor",
    name: supplier?.name || "",
    company: supplier?.company || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    category: supplier?.category || "",
    cnpj: supplier?.cnpj || "",
    address: supplier?.address || "",
    contactPerson: supplier?.contactPerson || "",
    status: supplier?.status || "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as "fornecedor" | "unidade",
                }))
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fornecedor" id="fornecedor" />
                <Label htmlFor="fornecedor">Fornecedor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unidade" id="unidade" />
                <Label htmlFor="unidade">Unidade</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {formData.type === "fornecedor" ? (
                  <>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="medicamentos">Medicamentos</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="estoque">Estoque</SelectItem>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="conta">Conta Bancária</SelectItem>
                    <SelectItem value="centerOfCustody">Centro de Custo</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="exemplo@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Pessoa de Contato</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactPerson: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === "active"}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  status: checked ? "active" : "inactive",
                }))
              }
            />
            <Label htmlFor="status">Fornecedor Ativo</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{supplier ? "Atualizar" : "Criar"}</Button>
      </div>
    </form>
  );
};

export default SupplierForm;
