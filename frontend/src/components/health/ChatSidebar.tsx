import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";

export interface ChatHistory {
  id: number;
  created_at?: string;
}

interface ChatSidebarProps {
  chatHistories: ChatHistory[];
  chatHistoryId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatHistories, chatHistoryId, onSelect, onCreate }) => {
  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-20 fixed left-0 top-0 bottom-0 h-full">
      <div className="flex flex-col gap-2 p-4 border-b border-gray-800">
        <Button variant="default" className="w-full flex items-center gap-2" onClick={() => onSelect(null)}>
          <Plus className="w-4 h-4" /> Nova Conversa
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        {chatHistories.length === 0 && (
          <Card className="text-gray-400 text-sm p-2 bg-gray-900 border-none shadow-none">Nenhuma conversa ainda</Card>
        )}
        {chatHistories.map((h) => (
          <Button
            key={h.id}
            variant={chatHistoryId === h.id ? "secondary" : "ghost"}
            className={`w-full justify-start mb-1 ${chatHistoryId === h.id ? 'bg-blue-500 text-white' : ''}`}
            onClick={() => onSelect(h.id)}
          >
            Conversa #{h.id}
          </Button>
        ))}
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar; 