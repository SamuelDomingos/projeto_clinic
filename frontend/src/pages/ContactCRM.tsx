import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, UserCheck, ArrowLeft, Trash2 } from "lucide-react";
import { PatientRecord } from "../components/PatientRecord";
import { patientApi, type Patient as ApiPatient } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { PatientForm } from "@/components/PatientForm";

// Tipo para o estado local que inclui lastVisit
type LocalPatient = ApiPatient & {
  lastVisit: string;
  photo?: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  insurance?: string;
  profession?: string;
  maritalStatus?: string;
};

// type Supplier = {
//   id: number;
//   name: string;
//   company: string;
//   email: string;
//   phone: string;
//   category: string;
// };

export default function ContactCRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  // const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await patientApi.getPatients();
      // Adiciona lastVisit aos pacientes
      const patientsWithLastVisit = patientsData.map(patient => ({
        ...patient,
        lastVisit: patient.updatedAt || new Date().toISOString()
      }));
      setPatients(patientsWithLastVisit);
      // setSuppliers(suppliersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      if (searchTerm.trim()) {
        const patientsData = await patientApi.searchPatients(searchTerm);
        // Adiciona lastVisit aos pacientes
        const patientsWithLastVisit = patientsData.map(patient => ({
          ...patient,
          lastVisit: patient.updatedAt || new Date().toISOString()
        }));
        setPatients(patientsWithLastVisit);
        // setSuppliers(suppliersData);
      } else {
        await loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      toast({
        title: "Erro",
        description: "Erro ao buscar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await patientApi.deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Paciente excluído com sucesso"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao excluir paciente",
        variant: "destructive"
      });
    }
  };

  // const handleDeleteSupplier = async (id: number) => {
  //   try {
  //     await supplierApi.deleteSupplier(id);
  //     setSuppliers(suppliers.filter(s => s.id !== id));
  //     toast({
  //       title: "Sucesso",
  //       description: "Fornecedor excluído com sucesso"
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Erro",
  //       description: "Erro ao excluir fornecedor",
  //       variant: "destructive"
  //     });
  //   }
  // };

  const handleViewRecord = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const handlePatientCreated = () => {
    loadData();
  };

  if (selectedPatient) {
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) {
      console.error("Paciente não encontrado:", selectedPatient);
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prontuário - {patient.name}</h1>
            <p className="text-muted-foreground">Registro médico completo</p>
          </div>
        </div>
        <PatientRecord patient={patient} />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contato/CRM</h1>
          <p className="text-muted-foreground">Gerenciamento de pacientes e fornecedores</p>
        </div>
        <PatientForm 
          onSuccess={handlePatientCreated}
          trigger={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 bg-muted">
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Pacientes</span>
          </TabsTrigger>
          {/* <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Fornecedores</span>
          </TabsTrigger> */}
        </TabsList>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar contatos..." 
              className="pl-10 bg-background border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Filtrar
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <TabsContent value="patients">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Lista de Pacientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Telefone</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Última Visita</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr 
                          key={patient.id} 
                          className="border-b border-border hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleViewRecord(patient.id)}
                        >
                          <td className="p-4 font-medium text-foreground">{patient.name}</td>
                          <td className="p-4 text-muted-foreground">{patient.email}</td>
                          <td className="p-4 text-muted-foreground">{patient.phone}</td>
                          <td className="p-4">
                            <Badge 
                              variant={patient.status === 'active' ? 'default' : 'secondary'}
                              className={patient.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-muted text-muted-foreground'}
                            >
                              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                              onClick={(e) => handleDeletePatient(patient.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="suppliers">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Building className="h-5 w-5 text-primary" />
                <span>Lista de Fornecedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Empresa</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Telefone</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4 font-medium text-foreground">{supplier.name}</td>
                          <td className="p-4 text-muted-foreground">{supplier.company}</td>
                          <td className="p-4 text-muted-foreground">{supplier.email}</td>
                          <td className="p-4 text-muted-foreground">{supplier.phone}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-border text-foreground">{supplier.category}</Badge>
                          </td>
                          <td className="p-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"n                              onClick={() => handleDeleteSupplier(supplier.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
