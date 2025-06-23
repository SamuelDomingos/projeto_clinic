import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ListFilter } from "lucide-react";
import { TransactionCategory } from "@/lib/api/types/transaction";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import { nanoid } from "nanoid";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: "type" | "category" | "date";
}

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  categories: TransactionCategory[];
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  categories = [],
}: TransactionFiltersProps) {
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState<FilterChip[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Estado local para mês/ano
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const initialMonth = dateFilter ? Number(dateFilter.split("-")[1]) - 1 : new Date().getMonth();
  const initialYear = dateFilter ? Number(dateFilter.split("-")[0]) : currentYear;
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Adiciona chip de filtro
  const addChip = (chip: FilterChip) => {
    setChips((prev) => [...prev.filter((c) => c.type !== chip.type), chip]);
    // Atualiza filtro externo
    if (chip.type === "type") onTypeChange(chip.value);
    if (chip.type === "category") onCategoryChange(chip.value);
    if (chip.type === "date") onDateChange(chip.value);
  };
  // Remove chip
  const removeChip = (type: FilterChip["type"]) => {
    setChips((prev) => prev.filter((c) => c.type !== type));
    if (type === "type") onTypeChange("all");
    if (type === "category") onCategoryChange("all");
    if (type === "date") onDateChange("");
  };
  // Limpa todos
  const clearChips = () => {
    setChips([]);
    onTypeChange("all");
    onCategoryChange("all");
    onDateChange("");
  };

  // Atualiza chips se filtros externos mudarem
  React.useEffect(() => {
    if (typeFilter !== "all" && !chips.find((c) => c.type === "type")) {
      addChip({ id: nanoid(), label: typeFilter === "revenue" ? "Receita" : "Despesa", value: typeFilter, type: "type" });
    }
    if (categoryFilter !== "all" && !chips.find((c) => c.type === "category")) {
      const cat = categories.find((c) => c.id === categoryFilter);
      if (cat) addChip({ id: nanoid(), label: cat.name, value: cat.id, type: "category" });
    }
    if (dateFilter && !chips.find((c) => c.type === "date")) {
      const [year, month] = dateFilter.split("-");
      addChip({ id: nanoid(), label: `${month}/${year}`, value: dateFilter, type: "date" });
    }
    // eslint-disable-next-line
  }, [typeFilter, categoryFilter, dateFilter]);

  // Atualiza dateFilter externo ao mudar mês/ano
  React.useEffect(() => {
    const value = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    if (value !== dateFilter) {
      onDateChange(value);
    }
    // eslint-disable-next-line
  }, [selectedMonth, selectedYear]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar lançamentos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chips dos filtros ativos */}
            {chips.map((chip) => (
              <span key={chip.id} className="flex items-center bg-muted rounded px-2 py-1 text-xs gap-1">
                {chip.label}
                <button
                  className="ml-1 text-muted-foreground hover:text-primary"
                  onClick={() => removeChip(chip.type)}
                  aria-label="Remover filtro"
                >
                  ×
                </button>
              </span>
            ))}
            {/* Botão minimalista para abrir popover de filtro */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  aria-label="Adicionar filtro"
                >
                  <ListFilter className="size-3" />
                  {!chips.length && "Filtro"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Filtrar por..."
                    className="h-9"
                    value={commandInput}
                    onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
                    ref={commandInputRef}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup heading="Tipo">
                      <CommandItem onSelect={() => { addChip({ id: nanoid(), label: "Receita", value: "revenue", type: "type" }); setOpen(false); }}>Receita</CommandItem>
                      <CommandItem onSelect={() => { addChip({ id: nanoid(), label: "Despesa", value: "expense", type: "type" }); setOpen(false); }}>Despesa</CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Categoria">
                      {categories.map((cat) => (
                        <CommandItem key={cat.id} onSelect={() => { addChip({ id: nanoid(), label: cat.name, value: cat.id, type: "category" }); setOpen(false); }}>{cat.name}</CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Selects shadcn para mês e ano */}
            <Select value={String(selectedMonth)} onValueChange={val => setSelectedMonth(Number(val))}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={val => setSelectedYear(Number(val))}>
              <SelectTrigger className="w-24 h-9 text-sm">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Botão para limpar todos os filtros */}
            {chips.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="transition group h-6 text-xs items-center rounded-sm"
                onClick={clearChips}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 