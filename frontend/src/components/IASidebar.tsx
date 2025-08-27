import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Adicione isso se não estiver importado
import { Send, Mic, Image, AtSign, Hash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IASidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function IASidebar({ open, onOpenChange }: IASidebarProps) {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Olá! Como posso ajudar hoje?" },
    { role: "user", content: "Quero saber sobre agendamentos." },
    { role: "assistant", content: "Claro! Aqui estão os detalhes..." },
  ]);
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState("Grok-4");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      setInput("");
      // Aqui você pode adicionar lógica para resposta da IA
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col z-[70]">
        <SheetHeader className="pb-4">
          <SheetTitle>Chat com IA</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex flex-col space-y-2 border-t pt-4">
          <div className="flex items-center space-x-2">

            <Button variant="ghost" size="icon"><Image className="h-4 w-4" /></Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon"><Mic className="h-4 w-4" /></Button>
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="↑ to navigate input history. Shift+Enter to insert a new line."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[40px] resize-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
