"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdated: string
}

const mockTickets: Ticket[] = [
  {
    id: "TICK-001",
    title: "Dúvida sobre comissões",
    description: "Gostaria de entender melhor como funciona o cálculo das comissões para vendas em grupo.",
    status: "open",
    priority: "medium",
    createdAt: "2024-03-15T10:00:00Z",
    lastUpdated: "2024-03-15T10:00:00Z"
  },
  {
    id: "TICK-002",
    title: "Problema com pagamento",
    description: "Não recebi o pagamento da última comissão que deveria ter sido processada.",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-03-14T15:30:00Z",
    lastUpdated: "2024-03-15T09:15:00Z"
  }
]

const statusConfig = {
  open: { label: "Aberto", icon: Clock, color: "bg-blue-500" },
  in_progress: { label: "Em Andamento", icon: MessageSquare, color: "bg-yellow-500" },
  resolved: { label: "Resolvido", icon: CheckCircle2, color: "bg-green-500" },
  closed: { label: "Fechado", icon: AlertCircle, color: "bg-gray-500" }
}

const priorityConfig = {
  low: { label: "Baixa", color: "bg-green-500" },
  medium: { label: "Média", color: "bg-yellow-500" },
  high: { label: "Alta", color: "bg-red-500" }
}

interface TicketListProps {
  searchQuery: string
}

export function TicketList({ searchQuery }: TicketListProps) {
  const [tickets] = useState<Ticket[]>(mockTickets)

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {filteredTickets.map((ticket) => {
        const StatusIcon = statusConfig[ticket.status].icon
        const priority = priorityConfig[ticket.priority]

        return (
          <Card key={ticket.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className={statusConfig[ticket.status].color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[ticket.status].label}
                  </Badge>
                  <Badge variant="secondary" className={priority.color}>
                    {priority.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  <p>Criado em: {formatDate(ticket.createdAt)}</p>
                  <p>Última atualização: {formatDate(ticket.lastUpdated)}</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      {filteredTickets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum ticket encontrado para sua busca.
        </div>
      )}
    </div>
  )
} 