"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronRight, FileText, Video, Book } from "lucide-react"

interface Article {
  id: string
  title: string
  description: string
  category: string
  type: "guide" | "video" | "article"
  readTime?: string
  videoLength?: string
}

const articles: Article[] = [
  {
    id: "KB-001",
    title: "Guia Completo do Programa de Afiliados",
    description: "Aprenda tudo sobre como funciona nosso programa de afiliados, desde o cadastro até o recebimento das comissões.",
    category: "Afiliados",
    type: "guide",
    readTime: "15 min"
  },
  {
    id: "KB-002",
    title: "Como Aumentar Suas Vendas",
    description: "Dicas e estratégias comprovadas para aumentar suas vendas e maximizar suas comissões.",
    category: "Vendas",
    type: "video",
    videoLength: "25 min"
  },
  {
    id: "KB-003",
    title: "Política de Comissões",
    description: "Entenda em detalhes como são calculadas as comissões e quais são os requisitos para cada nível.",
    category: "Comissões",
    type: "article",
    readTime: "8 min"
  }
]

const typeConfig = {
  guide: { icon: Book, label: "Guia" },
  video: { icon: Video, label: "Vídeo" },
  article: { icon: FileText, label: "Artigo" }
}

interface KnowledgeBaseProps {
  searchQuery: string
}

export function KnowledgeBase({ searchQuery }: KnowledgeBaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(articles.map(article => article.category)))

  const filteredArticles = articles.filter(article =>
    (selectedCategory ? article.category === selectedCategory : true) &&
    (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => {
          const TypeIcon = typeConfig[article.type].icon

          return (
            <Card key={article.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TypeIcon className="h-4 w-4" />
                  <span>{typeConfig[article.type].label}</span>
                  {article.readTime && <span>• {article.readTime} de leitura</span>}
                  {article.videoLength && <span>• {article.videoLength}</span>}
                </div>
                <CardTitle className="mt-2">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="ghost" className="w-full justify-between">
                  Ler mais
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum artigo encontrado para sua busca.
        </div>
      )}
    </div>
  )
} 