
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Adicionando tabs para combinar com a imagem

type SchedulingProps = {
  doctors: Array<{ id: string; name: string; avatar?: string }>;
  selectedDoctors: string[];
  onDoctorSelect: (id: string) => void;
  onSchedule: () => void;
};

export function SchedulingHeader({ doctors, selectedDoctors, onDoctorSelect, onSchedule }: SchedulingProps) {
  const [search, setSearch] = useState("");

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <Input
            placeholder="Unidades 05 - Buscar profissional -"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {filteredDoctors.map((doctor) => (
                <Tooltip key={doctor.id}>
                  <TooltipTrigger>
                    <Avatar
                      className={`cursor-pointer ${selectedDoctors.includes(doctor.id) ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => onDoctorSelect(doctor.id)}
                    >
                      <AvatarImage src={doctor.avatar || '/placeholder.svg'} alt={doctor.name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600">{doctor.name[0]}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{doctor.name}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            <Button onClick={onSchedule} className="bg-blue-500 text-white hover:bg-blue-600">Agendar</Button>
          </div>
        </div>
      </div>
      {/* Adicionando tabs e data para combinar com a imagem */}
      <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
        <Tabs defaultValue="dia" className="w-[300px]">
          <TabsList>
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="ghost">&lt;</Button>
          <span>18 Ago 2025</span>
          <Button variant="ghost">&gt;</Button>
        </div>
      </div>
    </div>
  );
}
