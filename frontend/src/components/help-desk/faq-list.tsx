"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    question: "Como funciona o sistema de comissões?",
    answer: "O sistema de comissões é baseado em um percentual sobre as vendas realizadas. Cada nível de afiliado tem uma taxa específica de comissão, que pode variar de acordo com o volume de vendas e tempo de participação no programa.",
    category: "Comissões"
  },
  {
    question: "Como posso receber minhas comissões?",
    answer: "As comissões são pagas através de transferência bancária ou PIX, dependendo da sua preferência. Os pagamentos são processados mensalmente, geralmente até o dia 10 de cada mês.",
    category: "Pagamentos"
  },
  {
    question: "Quais são os requisitos para ser um afiliado?",
    answer: "Para se tornar um afiliado, você precisa ter uma conta ativa, completar o processo de verificação e aceitar os termos e condições do programa de afiliados.",
    category: "Afiliados"
  },
  {
    question: "Como posso acompanhar minhas vendas?",
    answer: "Você pode acompanhar todas as suas vendas através do painel de controle, que mostra informações detalhadas sobre cada transação, incluindo status, valor e data.",
    category: "Vendas"
  }
]

interface FAQListProps {
  searchQuery: string
}

export function FAQList({ searchQuery }: FAQListProps) {
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([])

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="space-y-4">
      {filteredFaqs.map((faq, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => toggleFaq(index)}
            >
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  {faq.category}
                </span>
                <h3 className="text-lg font-semibold">{faq.question}</h3>
              </div>
              {expandedFaqs.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div
              className={cn(
                "mt-2 text-muted-foreground overflow-hidden transition-all",
                expandedFaqs.includes(index) ? "max-h-96" : "max-h-0"
              )}
            >
              <p>{faq.answer}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredFaqs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma FAQ encontrada para sua busca.
        </div>
      )}
    </div>
  )
} 