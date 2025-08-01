import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ArrowRight, Stethoscope, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      console.log('Tentando fazer login com:', { email });
      await login(email, password);
      console.log('Login realizado com sucesso');
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema.",
      });
    } catch (error) {
      console.error('Erro detalhado no login:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left side - Image and Text */}
      <div 
        className="hidden lg:flex lg:w-[60%] relative bg-cover bg-center items-end pb-8"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-700/60" />
        <div className="relative z-10 p-12 text-white max-w-3xl flex flex-col justify-between h-full">
          <div className="flex-grow flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-6">
              Sistema de Gestão Clínica
            </h1>
            <p className="text-lg leading-relaxed text-white/90">
              Gerencie sua clínica de forma eficiente e organizada. 
              Tenha controle total sobre pacientes, agendamentos, 
              finanças e muito mais em um só lugar.
            </p>
          </div>
          
          {/* Footer content for left side */}
          <div className="mt-auto text-center">
            <p className="text-sm text-white/80">Sistema de Gestão Clínica</p>
            <p className="text-xs text-white/70 mt-1">© 2024 Todos os direitos reservados</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:w-[40%] bg-white">
        <Card className="w-full max-w-sm border-none shadow-lg">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail*</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-white border-muted"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha*</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white border-muted"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
              <a href="#" className="block text-center text-sm text-blue-600 hover:underline mt-4">Esqueceu a senha</a>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 