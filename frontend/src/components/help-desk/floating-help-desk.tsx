import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, MessageSquare, HelpCircle, Home, Send, MessageCircle, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";


const teamAvatars = [
  <User key="1" className="h-8 w-8 rounded-full bg-white text-primary p-1 border-2 border-background -ml-2" />,
  <User key="2" className="h-8 w-8 rounded-full bg-white text-primary p-1 border-2 border-background -ml-2" />,
  <User key="3" className="h-8 w-8 rounded-full bg-white text-primary p-1 border-2 border-background -ml-2" />
];

const helpFaqs = [
  {
    title: 'Como Cadastrar um Procedimento para Convênio',
    description: 'Tipo de guia: Consulta SADT (para exames e pequenos procedimentos) GHI Tipo',
    highlights: ['SADT'],
  },
  {
    title: 'Como Cadastrar Manualmente um Convênio',
    description: '... envio de guias (Consulta, SADT, GHI).',
    highlights: ['SADT', 'GHI'],
  },
  {
    title: 'Como recepcionar pacientes na clínica',
    description: '... da Guia de Consulta ou Guia SADT: Executante Solicitante',
    highlights: ['SADT'],
  },
  {
    title: 'Como Configurar a Tabela AMB',
    description: '... de procedimentos, como SADT',
    highlights: ['SADT'],
  },
];

const quickQuestions = [
  'Produção de Convênio (NOVO)',
  'Configuração de Repasse para Orçamento',
  'Como adequar receita eletrônica à Resolução nº 1131 da SESA',
  'Visão Geral de Repasse',
];

export function FloatingHelpDesk() {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [helpSearch, setHelpSearch] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-[60]"
      >
        <motion.button
          onClick={() => setIsOpen((open) => !open)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center relative shadow-lg"
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: 1
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)"
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-xl" />
          <div className="relative z-10">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageCircle className="h-6 w-6 text-white" />
            )}
          </div>

        </motion.button>
      </motion.div>

      {/* Card do help desk */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.1,
              x: 0,
              y: 0,
              transformOrigin: "bottom right"
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              width: chatOpen && chatExpanded ? 600 : 400
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.1,
              x: 0,
              y: 0,
              transformOrigin: "bottom right"
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className="fixed top-12 right-4 bg-background rounded-2xl shadow-xl flex flex-col z-50 sm:h-[600px]"
            style={{ maxWidth: '100vw', maxHeight: '78vh', right: '1rem' }}
          >
            {/* Chat animado */}
            <AnimatePresence>
              {chatOpen ? (
                <motion.div
                  key="chat"
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 bg-background rounded-2xl flex flex-col z-20"
                >
                  {/* Header do chat */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b">
                    <button onClick={() => setChatOpen(false)} className="mr-2 text-muted-foreground hover:text-primary">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Vini" className="h-9 w-9 rounded-full object-cover" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-base truncate">Vini</span>
                      <span className="text-xs text-muted-foreground truncate">A equipe também pode ajudar</span>
                    </div>
                    <button onClick={() => setChatExpanded(exp => !exp)} className="ml-2 text-muted-foreground hover:text-primary">
                      {/* Expand/contract icon */}
                      {chatExpanded ? (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </button>
                  </div>
                  {/* Mensagens do chat */}
                  <div
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-3 relative"
                    style={{
                      backgroundImage: `url(${resolvedTheme === 'dark' ? '/bg-dark.svg' : '/bg-light.svg'})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Camada escura para o modo escuro */}
                    {resolvedTheme === 'dark' && (
                      <div
                        className="absolute inset-0 z-0 rounded-2xl"
                        style={{
                          background: "rgba(10, 10, 10, 0.75)",
                          pointerEvents: "none"
                        }}
                      />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-start gap-2">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Vini" className="h-8 w-8 rounded-full object-cover mt-1" />
                        <div className="flex flex-col gap-2">
                          <div className="bg-card rounded-xl px-4 py-2 shadow text-sm">
                            <span className="font-semibold text-foreground">Vini • AI Agent</span>
                            <div className="text-foreground mt-1">Olá, Francisco!</div>
                            <div className="text-foreground mt-2">Sou o Vini 🧑‍💻, o novo assistente virtual do Amigo Clinic e estou aqui para responder às suas perguntas ainda mais rápido e a qualquer hora. ⏰</div>
                          </div>
                          <div className="bg-card rounded-xl px-4 py-2 shadow text-sm text-foreground">
                            Mas não se preocupe! Caso necessário, você ainda terá a opção de falar com nossa equipe de analistas. 😍
                          </div>
                          <div className="bg-card rounded-xl px-4 py-2 shadow text-sm text-foreground">
                            Poderia informar, em poucas palavras, como posso te ajudar?
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Campo de digitação */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-border px-4 py-3 bg-card relative z-20">
                    {/* Remova o div do emojiBtnRef e botão de emoji */}
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Faça uma pergunta..."
                      className="flex-1 border-none shadow-none focus:ring-0 bg-background text-foreground"
                    />
                    <button type="submit" className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full p-2 flex items-center justify-center transition-all duration-200 shadow-md">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {/* Header customizado - só na aba inicial */}
            {activeTab === "home" && !chatOpen && (
              <div className="relative flex flex-col items-stretch bg-gradient-to-b from-blue-600 to-blue-400 rounded-t-2xl p-6 pb-2">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  {/* Avatares */}
                  <div className="flex -space-x-2">{teamAvatars}</div>
                </div>
                <div className="mt-4">
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    Olá Francisco <span className="animate-bounce">👋</span>
                  </h2>
                  <p className="text-white/90 text-lg font-medium mt-1">Como podemos ajudar?</p>
                </div>
              </div>
            )}
            {/* Conteúdo das abas */}
            {!chatOpen && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === "home" && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <TabsContent value="home" className="flex flex-col gap-3 px-4 pt-4 pb-2">
                        {/* Conteúdo da aba inicial */}
                        <div 
                          className="bg-card hover:bg-accent/50 rounded-lg shadow p-3 flex items-center gap-3 cursor-pointer transition-colors"
                          onClick={() => setChatOpen(true)}
                        >
                          <User className="h-10 w-10 rounded-full bg-muted p-1" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Mensagem recente</div>
                            <div className="font-medium text-sm text-foreground">Classifique sua conversa</div>
                            <div className="text-xs text-muted-foreground">Priscilla • Há 3d</div>
                          </div>
                          <span className="h-3 w-3 bg-red-500 rounded-full block" />
                        </div>
                        <div className="bg-card rounded-lg shadow p-3 flex items-center gap-3">
                          <HelpCircle className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">Faça uma pergunta</div>
                            <div className="text-sm text-foreground">Nosso bot e nossa equipe podem ajudar</div>
                          </div>
                          <button onClick={() => setChatOpen(true)} className="ml-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-3 py-1 text-xs font-medium shadow hover:shadow-md transition-all duration-200">
                            Perguntar
                          </button>
                        </div>
                        <div className="bg-card rounded-lg shadow p-3">
                          <div className="text-xs text-muted-foreground mb-2">Criar ticket de suporte</div>
                          <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline">
                              <MessageSquare className="h-4 w-4" /> 2ª via da Nota Fiscal
                            </button>
                            <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline">
                              <MessageSquare className="h-4 w-4" /> 2ª via de Boleto
                            </button>
                            <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline">
                              <MessageSquare className="h-4 w-4" /> Cancelamento
                            </button>
                          </div>
                        </div>
                        {/* Card: Qual é a sua dúvida? */}
                        <div className="bg-gradient-to-b from-primary/10 to-background rounded-xl shadow p-0 overflow-hidden">
                          <div className="flex items-center justify-between px-4 pt-3 pb-1">
                            <span className="font-semibold text-base text-foreground">Qual é a sua dúvida?</span>
                            <span className="text-primary"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                          </div>
                          <div className="px-4 pb-2">
                            <div className="relative mb-2">
                              <input
                                type="text"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Digite sua dúvida..."
                              />
                              <span className="absolute right-3 top-2.5 text-muted-foreground">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {quickQuestions.map((q, i) => (
                                <button key={i} className="flex items-center justify-between w-full text-left px-2 py-2 rounded-lg hover:bg-accent/50 transition text-sm font-medium text-foreground">
                                  <span>{q}</span>
                                  <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </motion.div>
                  )}
                  {activeTab === "messages" && (
                    <motion.div
                      key="messages"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <TabsContent value="messages" className="flex flex-col gap-3 px-0 pt-0 pb-2 flex-1">
                        {/* Título centralizado */}
                        <div className="pt-4 pb-2 px-4 text-center text-lg font-semibold text-foreground">Mensagens</div>
                        <div className="flex-1 overflow-y-auto px-2">
                          {/* Mensagem de destaque */}
                          <div className="flex items-center gap-3 bg-card rounded-lg shadow p-3 mb-2">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Priscilla" className="h-10 w-10 rounded-full object-cover" />
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-foreground">Classifique sua conversa</div>
                              <div className="text-xs text-muted-foreground">Priscilla • Há 4d</div>
                            </div>
                            <span className="h-3 w-3 bg-red-500 rounded-full block" />
                          </div>
                          {/* Outras mensagens */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 bg-card rounded-lg p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Vini" className="h-9 w-9 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">Olá, Francisco! Sou o Vini 🎓, o novo ass...</div>
                                <div className="text-xs text-muted-foreground truncate">Vini • Há 6d</div>
                              </div>
                              <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                            </div>
                            <div className="flex items-center gap-3 bg-card rounded-lg p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Vini" className="h-9 w-9 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">Cronograma de Treinamentos 📅 13 a 28...</div>
                                <div className="text-xs text-muted-foreground truncate">Vini • Há 2sem</div>
                              </div>
                              <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                            </div>
                            <div className="flex items-center gap-3 bg-card rounded-lg p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Vini" className="h-9 w-9 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">Francisco, quer ganhar um MacBook 13 P...</div>
                                <div className="text-xs text-muted-foreground truncate">Vini • Há 3sem</div>
                              </div>
                              <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                            </div>
                            <div className="flex items-center gap-3 bg-card rounded-lg p-2 cursor-pointer hover:bg-accent/50 transition-colors">
                              <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Marcel" className="h-9 w-9 rounded-full object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">Francisco, em função do feriado nacional ...</div>
                                <div className="text-xs text-muted-foreground truncate">Marcel • Há 4sem</div>
                              </div>
                              <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                            </div>
                          </div>
                        </div>
                        {/* Botão flutuante */}
                        <div className="flex justify-center mt-3 mb-1">
                          <button onClick={() => setChatOpen(true)} className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-6 py-2 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200">
                            Faça uma pergunta <HelpCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </TabsContent>
                    </motion.div>
                  )}
                  {activeTab === "help" && (
                    <motion.div
                      key="help"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <TabsContent value="help" className="flex flex-col gap-3 px-0 pt-0 pb-2 flex-1">
                        {/* Conteúdo da aba ajuda */}
                        {/* Título centralizado */}
                        <div className="pt-4 pb-2 px-4 text-center text-lg font-semibold text-foreground">Ajuda</div>
                        {/* Campo de busca */}
                        <div className="relative px-4 mb-2">
                          <span className="absolute left-6 top-2.5 text-muted-foreground">
                            <HelpCircle className="h-5 w-5" />
                          </span>
                          <Input
                            value={helpSearch}
                            onChange={e => setHelpSearch(e.target.value)}
                            placeholder="Buscar ajuda..."
                            className="pl-10 pr-10 h-10 text-base bg-background text-foreground border-input"
                          />
                          {helpSearch && (
                            <button
                              className="absolute right-6 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setHelpSearch("")}
                              tabIndex={-1}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
                        </div>
                        {/* Lista de resultados só aparece se houver busca */}
                        {helpSearch && (
                          <div className="flex-1 overflow-y-auto px-2 pb-2">
                            {helpFaqs.filter(faq =>
                              faq.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
                              faq.description.toLowerCase().includes(helpSearch.toLowerCase())
                            ).map((faq, i) => (
                              <div key={i} className="bg-card rounded-lg p-3 mb-2 shadow flex flex-col cursor-pointer hover:bg-accent/50 transition-colors">
                                <div className="font-semibold text-sm mb-1 text-foreground">{faq.title}</div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  {faq.description.split(/(SADT|GHI)/g).map((part, idx) =>
                                    faq.highlights.includes(part) ? (
                                      <span key={idx} className="text-primary font-semibold">{part}</span>
                                    ) : (
                                      <span key={idx}>{part}</span>
                                    )
                                  )}
                                </div>
                                <div className="flex justify-end">
                                  <span className="text-primary"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                                </div>
                              </div>
                            ))}
                            {helpFaqs.filter(faq =>
                              faq.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
                              faq.description.toLowerCase().includes(helpSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="text-center text-muted-foreground py-8">Nenhum resultado encontrado.</div>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Navegação inferior */}
              <div className="border-t bg-white flex flex-row items-center justify-between h-[64px] px-0 sticky bottom-0 z-10 shadow-[0_0_25px_0_rgba(15,15,15,0.06)]">
                <TabsList className="w-full flex flex-row items-center justify-between h-full">
                  <TabsTrigger value="home" className="flex-1 flex flex-col items-center gap-1 h-full justify-center">
                    <Home className="h-5 w-5" />
                    <span className="text-xs">Início</span>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex-1 flex flex-col items-center gap-1 h-full justify-center">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs">Mensagens</span>
                  </TabsTrigger>
                  <TabsTrigger value="help" className="flex-1 flex flex-col items-center gap-1 h-full justify-center">
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-xs">Ajuda</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}