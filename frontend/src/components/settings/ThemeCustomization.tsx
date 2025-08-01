
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette, RotateCcw } from "lucide-react";

export function ThemeCustomization() {
  const { colors, updateColors, resetToDefault, applyPreset } = useTheme();
  const [tempColors, setTempColors] = useState(colors);

  const handleColorChange = (colorKey: string, value: string) => {
    setTempColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleSave = () => {
    updateColors(tempColors);
  };

  const handleReset = () => {
    resetToDefault();
    setTempColors(colors);
  };

  const presets = [
    {
      name: "Azul Clássico",
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#06b6d4',
        background: '#ffffff',
        foreground: '#0f172a'
      }
    },
    {
      name: "Verde Médico",
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#10b981',
        background: '#ffffff',
        foreground: '#111827'
      }
    },
    {
      name: "Roxo Moderno",
      colors: {
        primary: '#7c3aed',
        secondary: '#6b7280',
        accent: '#a855f7',
        background: '#ffffff',
        foreground: '#111827'
      }
    },
    {
      name: "Laranja Vibrante",
      colors: {
        primary: '#ea580c',
        secondary: '#6b7280',
        accent: '#f97316',
        background: '#ffffff',
        foreground: '#111827'
      }
    }
  ];

  const colorOptions = [
    { key: 'primary', label: 'Cor Primária', description: 'Cor principal do sistema' },
    { key: 'secondary', label: 'Cor Secundária', description: 'Cor complementar' },
    { key: 'accent', label: 'Cor de Destaque', description: 'Cor para elementos de destaque' },
    { key: 'background', label: 'Cor de Fundo', description: 'Cor de fundo principal' },
    { key: 'foreground', label: 'Cor do Texto', description: 'Cor principal do texto' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-blue-600" />
          <span>Personalização de Tema</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalize as cores principais do sistema (disponível apenas para administradores)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estilos Padrões */}
        <div>
          <h4 className="font-medium mb-3">Estilos Padrões</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset) => (
              <div key={preset.name} className="space-y-2">
                <div className="border rounded-lg p-3 cursor-pointer hover:border-gray-400 transition-colors"
                     onClick={() => {
                       setTempColors(preset.colors);
                       applyPreset(preset.colors);
                     }}>
                  <div className="flex space-x-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                  <p className="text-xs font-medium">{preset.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalização Manual */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Personalização Manual</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorOptions.map((option) => (
              <div key={option.key} className="space-y-2">
                <Label htmlFor={option.key} className="text-sm font-medium">
                  {option.label}
                </Label>
                <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                <div className="flex space-x-2">
                  <div 
                    className="w-10 h-10 rounded border-2 border-gray-300"
                    style={{ backgroundColor: tempColors[option.key as keyof typeof tempColors] }}
                  />
                  <Input
                    id={option.key}
                    type="color"
                    value={tempColors[option.key as keyof typeof tempColors]}
                    onChange={(e) => handleColorChange(option.key, e.target.value)}
                    className="w-20 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={tempColors[option.key as keyof typeof tempColors]}
                    onChange={(e) => handleColorChange(option.key, e.target.value)}
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Pré-visualização</h4>
          <div className="p-4 border rounded-lg space-y-3">
            <div 
              className="h-12 rounded flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: tempColors.primary }}
            >
              Cor Primária
            </div>
            <div 
              className="h-8 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: tempColors.secondary }}
            >
              Cor Secundária
            </div>
            <div 
              className="h-8 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: tempColors.accent }}
            >
              Cor de Destaque
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Restaurar Padrão</span>
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
