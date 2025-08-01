// BirthdayCard.jsx
import React, { useState } from "react";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BirthdayCard({
  users,
  selectedMonth,
  setSelectedMonth,
}) {
  const getDaysUntilNextBirthday = (birthDate) => {
    const today = new Date();
    const birth = parseISO(birthDate);
    const nextBirthday = new Date(
      today.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatTimeUntilBirthday = (days) => {
    if (days === 0) return "Hoje!";
    if (days === 1) return "Amanhã!";
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  };

  const filteredBirthdays = users
    .filter((user) => {
      if (!user.birth_date) return false;
      if (selectedMonth === "all") return true;
      const birthDate = parseISO(user.birth_date);
      return (birthDate.getMonth() + 1).toString() === selectedMonth;
    })
    .sort((a, b) => {
      if (!a.birth_date || !b.birth_date) return 0;
      const daysA = getDaysUntilNextBirthday(a.birth_date);
      const daysB = getDaysUntilNextBirthday(b.birth_date);
      return daysA - daysB;
    });

  const [expanded, setExpanded] = useState(false);
  const displayedBirthdays = expanded
    ? filteredBirthdays
    : filteredBirthdays.slice(0, 10);

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎂</span>
            <CardTitle className="text-2xl font-bold gradient-text">
              Aniversariantes
            </CardTitle>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-white/10">
              <SelectItem value="all">Todos os meses</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(0, i))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {displayedBirthdays.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <span className="text-4xl mb-4 block">🎁</span>
              <p className="text-muted-foreground">Nenhum aniversariante encontrado para este mês</p>
            </div>
          ) : (
            displayedBirthdays.map((user, index) => {
              if (!user.birth_date) return null;
              const birthDate = parseISO(user.birth_date);
              const daysUntilBirthday = getDaysUntilNextBirthday(user.birth_date);

              return (
                <div
                  key={user.id}
                  className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(147, 51, 234, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all duration-300">
                      <AvatarImage src={user.profile_image} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {daysUntilBirthday <= 7 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                        {daysUntilBirthday === 0 ? "🎉" : daysUntilBirthday}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-lg truncate group-hover:text-purple-400 transition-colors">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">🎂</span>
                        {format(birthDate, "d 'de' MMMM", { locale: ptBR })}
                      </span>
                      {daysUntilBirthday === 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                          Hoje!
                        </span>
                      ) : daysUntilBirthday === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                          Amanhã!
                        </span>
                      ) : daysUntilBirthday <= 7 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                          Em {formatTimeUntilBirthday(daysUntilBirthday)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                          Em {formatTimeUntilBirthday(daysUntilBirthday)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {filteredBirthdays.length > 10 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 mt-4 text-purple-500 hover:text-purple-700 font-medium transition-colors"
            >
              {expanded ? "Mostrar menos" : "Mostrar mais"}
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.3s",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}