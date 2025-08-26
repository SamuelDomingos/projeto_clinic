
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalSelectModal } from './Scheduling/ProfessionalSelectModal';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type SchedulingProps = {
  doctors: Array<{ id: string; name: string; avatar?: string }>;
  selectedDoctors: string[];
  onDoctorSelect: (id: string) => void;
  onSchedule: () => void;
  weekDays: string[];
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  getWeekLabel: (weekDays: string[], weekOffset: number) => string;
  units: Array<{ id: string; name: string }>;
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
};

export function SchedulingHeader({ doctors, selectedDoctors, onDoctorSelect, onSchedule, weekDays, weekOffset, onWeekChange, getWeekLabel, units, selectedUnit, onUnitChange }: SchedulingProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(selectedDoctors);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = (selectedIds: string[]) => {
    selectedIds.forEach(id => onDoctorSelect(id));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-transparent p-4 rounded-lg flex flex-col gap-4 shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-full max-w-2xl">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[180px] justify-between",
                !selectedUnit && "text-muted-foreground"
              )}
            >
              {selectedUnit
                ? units.find((unit) => unit.id === selectedUnit)?.name
                : "Selecione unidade"}
              <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder="Buscar unidade..." className="h-9" />
              <CommandList>
                <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
                <CommandGroup>
                  {units.map((unit) => (
                    <CommandItem
                      key={unit.id}
                      value={unit.name}
                      onSelect={() => {
                        onUnitChange(unit.id);
                      }}
                    >
                      {unit.name}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedUnit === unit.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {doctors.filter(d => selectedDoctors.includes(d.id)).map((doctor) => (
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
            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={onSchedule} className="bg-blue-500 text-white hover:bg-blue-600">Agendar</Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
        <Tabs defaultValue="dia" className="w-[300px]">
          <TabsList>
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="mes">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onWeekChange(weekOffset - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm">{getWeekLabel(weekDays, weekOffset)}</span>
            <Button variant="outline" size="sm" onClick={() => onWeekChange(weekOffset + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onWeekChange(0)}>Hoje</Button>
          </div>
        </div>
      </div>
      <ProfessionalSelectModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        professionals={doctors.map(d => ({ id: d.id, name: d.name, avatarUrl: d.avatar }))}
        selectedProfessionals={tempSelected}
        onSelectionChange={setTempSelected}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
