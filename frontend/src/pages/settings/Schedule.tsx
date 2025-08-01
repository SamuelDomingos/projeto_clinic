import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ScheduleClinicConfig from '@/components/settings/Shedule/ScheduleClinicConfig';
import ScheduleTypeList from '@/components/settings/Shedule/SheduleType/ScheduleTypeList';
import ScheduleHolidayList from '@/components/settings/Shedule/ScheduleHolidayList';
import ProfessionalList from '@/components/settings/Shedule/ProfessionalList';

export default function ScheduleSettings() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações de Agenda</h1>
      <Tabs defaultValue="config" className="w-full">
        <TabsList>
          <TabsTrigger value="config">Agenda da clínica</TabsTrigger>
          <TabsTrigger value="types">Tipos de atendimento</TabsTrigger>
          <TabsTrigger value="holidays">Feriados</TabsTrigger>
          <TabsTrigger value="executors">Executantes</TabsTrigger>
        </TabsList>
        <TabsContent value="config">
          <ScheduleClinicConfig />
        </TabsContent>
        <TabsContent value="types">
          <ScheduleTypeList />
        </TabsContent>
        <TabsContent value="holidays">
          <ScheduleHolidayList />
        </TabsContent>
        <TabsContent value="executors">
          <ProfessionalList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 