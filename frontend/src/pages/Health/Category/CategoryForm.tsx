"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Brain, Heart, Utensils, Users, Zap, Shield, Activity, Smile } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ElegantBackground } from "@/components/ui/elegant-background"
import { categoryService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const iconOptions = [
  { name: "Brain", icon: Brain, value: "brain" },
  { name: "Heart", icon: Heart, value: "heart" },
  { name: "Utensils", icon: Utensils, value: "utensils" },
  { name: "Users", icon: Users, value: "users" },
  { name: "Zap", icon: Zap, value: "zap" },
  { name: "Shield", icon: Shield, value: "shield" },
  { name: "Activity", icon: Activity, value: "activity" },
  { name: "Smile", icon: Smile, value: "smile" },
]

const colorOptions = [
  { name: "Azul", value: "blue", class: "bg-blue-500" },
  { name: "Verde", value: "green", class: "bg-green-500" },
  { name: "Laranja", value: "orange", class: "bg-orange-500" },
  { name: "Roxo", value: "purple", class: "bg-purple-500" },
  { name: "Rosa", value: "pink", class: "bg-pink-500" },
  { name: "Amarelo", value: "yellow", class: "bg-yellow-500" },
  { name: "Vermelho", value: "red", class: "bg-red-500" },
  { name: "Ciano", value: "cyan", class: "bg-cyan-500" },
]

const CategoryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "brain",
    color: "blue",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      categoryService.get(id).then((cat) => {
        const data = cat.data || cat;
        setFormData({
          title: data.name || "",
          description: data.description || "",
          icon: data.icon || "brain",
          color: data.color || "blue",
        });
        setLoading(false);
      }).catch(() => {
        toast({ title: "Erro ao carregar categoria", variant: "destructive" });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await categoryService.update(id, {
          name: formData.title,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        });
        toast({ title: "Categoria atualizada com sucesso!" });
      } else {
        await categoryService.create({
          name: formData.title,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        });
        toast({ title: "Categoria criada com sucesso!" });
      }
      setTimeout(() => navigate("/health/manager"), 1200);
    } catch {
      toast({ title: "Erro ao salvar categoria", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedIcon = iconOptions.find((icon) => icon.value === formData.icon)
  const SelectedIconComponent = selectedIcon?.icon || Brain

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ElegantBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/health/manager">
            <EnhancedButton variant="secondary" size="sm" icon="chevron">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </EnhancedButton>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{isEdit ? "Editar Categoria" : "Nova Categoria"}</h1>
            <p className="text-gray-400">Crie uma nova categoria de questionários</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${formData.color}-500/20`}>
                  <SelectedIconComponent className={`w-5 h-5 text-${formData.color}-400`} />
                </div>
                Configurações da Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome da categoria */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white font-medium">
                    Nome da Categoria *
                  </Label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Saúde Mental, Bem-estar..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/70 transition-all"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white font-medium">
                    Descrição
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva o propósito desta categoria..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/70 transition-all resize-none"
                  />
                </div>

                {/* Seleção de ícone */}
                <div className="space-y-3">
                  <Label className="text-white font-medium">Ícone da Categoria</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {iconOptions.map((icon) => {
                      const IconComponent = icon.icon
                      return (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => handleInputChange("icon", icon.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            formData.icon === icon.value
                              ? `border-${formData.color}-500 bg-${formData.color}-500/20`
                              : "border-gray-600/50 bg-gray-700/30 hover:border-gray-500/70"
                          }`}
                        >
                          <IconComponent
                            className={`w-6 h-6 mx-auto ${
                              formData.icon === icon.value ? `text-${formData.color}-400` : "text-gray-400"
                            }`}
                          />
                          <span className="text-xs text-gray-400 mt-1 block">{icon.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Seleção de cor */}
                <div className="space-y-3">
                  <Label className="text-white font-medium">Cor da Categoria</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange("color", color.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                          formData.color === color.value
                            ? `border-${color.value}-500 bg-${color.value}-500/20`
                            : "border-gray-600/50 bg-gray-700/30 hover:border-gray-500/70"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                        <span className="text-sm text-gray-300">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-3">
                  <Label className="text-white font-medium">Preview</Label>
                  <div className={`p-4 rounded-lg bg-gray-800/50 border-${formData.color}-500/20 border`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full bg-${formData.color}-500/20`}>
                        <SelectedIconComponent className={`w-6 h-6 text-${formData.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{formData.title || "Nome da Categoria"}</h3>
                        <p className="text-sm text-gray-400">
                          {formData.description || "Descrição da categoria aparecerá aqui"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Link to="/health/painel" className="flex-1">
                    <EnhancedButton variant="secondary" className="w-full">
                      Cancelar
                    </EnhancedButton>
                  </Link>
                  <EnhancedButton type="submit" loading={isSubmitting} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? "Atualizar Categoria" : "Salvar Categoria"}
                  </EnhancedButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm
