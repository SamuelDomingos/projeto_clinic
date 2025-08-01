"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import FloatingActionMenu from "@/components/ui/floating-action-menu";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

interface AnimatedAIChatProps {
    hideHeader?: boolean;
    hideClipButton?: boolean;
    onSendMessage?: (message: string) => void;
    onGenerateDiagnostics?: () => void;
    onGenerateActionPlan?: () => void;
    inputClassName?: string; // Allow parent to customize input
    disabled?: boolean;
}

export function AnimatedAIChat({ hideHeader = false, hideClipButton = false, onSendMessage, onGenerateDiagnostics, onGenerateActionPlan, inputClassName, disabled = false }: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            // setShowCommandPalette(true); // Removed
            
            // const matchingSuggestionIndex = commandSuggestions.findIndex( // Removed
            //     (cmd) => cmd.prefix.startsWith(value) // Removed
            // ); // Removed
            
            // if (matchingSuggestionIndex >= 0) { // Removed
            //     setActiveSuggestion(matchingSuggestionIndex); // Removed
            // } else { // Removed
            //     setActiveSuggestion(-1); // Removed
            // } // Removed
        } else {
            // setShowCommandPalette(false); // Removed
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                // setShowCommandPalette(false); // Removed
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // if (showCommandPalette) { // Removed
        //     if (e.key === 'ArrowDown') { // Removed
        //         e.preventDefault(); // Removed
        //         setActiveSuggestion(prev =>  // Removed
        //             prev < commandSuggestions.length - 1 ? prev + 1 : 0 // Removed
        //         ); // Removed
        //     } else if (e.key === 'ArrowUp') { // Removed
        //         e.preventDefault(); // Removed
        //         setActiveSuggestion(prev =>  // Removed
        //             prev > 0 ? prev - 1 : commandSuggestions.length - 1 // Removed
        //         ); // Removed
        //     } else if (e.key === 'Tab' || e.key === 'Enter') { // Removed
        //         e.preventDefault(); // Removed
        //         if (activeSuggestion >= 0) { // Removed
        //             const selectedCommand = commandSuggestions[activeSuggestion]; // Removed
        //             setValue(selectedCommand.prefix + ' '); // Removed
        //             setShowCommandPalette(false); // Removed
                    
        //             setRecentCommand(selectedCommand.label); // Removed
        //             setTimeout(() => setRecentCommand(null), 3500); // Removed
        //         } // Removed
        //     } else if (e.key === 'Escape') { // Removed
        //         e.preventDefault(); // Removed
        //         setShowCommandPalette(false); // Removed
        //     } // Removed
        // } else if (e.key === "Enter" && !e.shiftKey) { // Removed
        //     e.preventDefault(); // Removed
        //     if (value.trim()) { // Removed
        //         handleSendMessage(); // Removed
        //     } // Removed
        // } // Removed
    };

    const handleSendMessage = () => {
        if (value.trim()) {
            if (onSendMessage) {
                onSendMessage(value.trim());
                setValue("");
                adjustHeight(true);
            } else {
                startTransition(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setIsTyping(false);
                        setValue("");
                        adjustHeight(true);
                    }, 3000);
                });
            }
        }
    };

    const handleAttachFile = () => {
        const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    // const selectCommandSuggestion = (index: number) => { // Removed
    //     const selectedCommand = commandSuggestions[index]; // Removed
    //     setValue(selectedCommand.prefix + ' '); // Removed
    //     setShowCommandPalette(false); // Removed
        
    //     setRecentCommand(selectedCommand.label); // Removed
    //     setTimeout(() => setRecentCommand(null), 2000); // Removed
    // }; // Removed

    return (
        <div className="flex flex-col w-full items-center justify-center text-white p-0 relative overflow-visible">
            <div className="w-full max-w-2xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {!hideHeader && (
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block"
                        >
                            <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                                How can I help today?
                            </h1>
                            <motion.div 
                                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />
                        </motion.div>
                        <motion.p 
                            className="text-sm text-white/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Type a command or ask a question
                        </motion.p>
                    </div>
                    )}

                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {/* {showCommandPalette && ( // Removed
                                <motion.div  // Removed
                                    ref={commandPaletteRef} // Removed
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden" // Removed
                                    initial={{ opacity: 0, y: 5 }} // Removed
                                    animate={{ opacity: 1, y: 0 }} // Removed
                                    exit={{ opacity: 0, y: 5 }} // Removed
                                    transition={{ duration: 0.15 }} // Removed
                                > // Removed
                                    <div className="py-1 bg-black/95"> // Removed
                                        {commandSuggestions.map((suggestion, index) => ( // Removed
                                            <motion.div // Removed
                                                key={suggestion.prefix} // Removed
                                                className={cn( // Removed
                                                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer", // Removed
                                                    activeSuggestion === index  // Removed
                                                        ? "bg-white/10 text-white"  // Removed
                                                        : "text-white/70 hover:bg-white/5" // Removed
                                                )} // Removed
                                                onClick={() => selectCommandSuggestion(index)} // Removed
                                                initial={{ opacity: 0 }} // Removed
                                                animate={{ opacity: 1 }} // Removed
                                                transition={{ delay: index * 0.03 }} // Removed
                                            > // Removed
                                                <div className="w-5 h-5 flex items-center justify-center text-white/60"> // Removed
                                                    {suggestion.icon} // Removed
                                                </div> // Removed
                                                <div className="font-medium">{suggestion.label}</div> // Removed
                                                <div className="text-white/40 text-xs ml-1"> // Removed
                                                    {suggestion.prefix} // Removed
                                                </div> // Removed
                                            </motion.div> // Removed
                                        ))} // Removed
                                    </div> // Removed
                                </motion.div> // Removed
                            )} */}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask zap a question..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-white/20",
                                    "min-h-[40px]",
                                    inputClassName // <-- allow parent to override/add
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                                disabled={disabled}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button 
                                                onClick={() => removeAttachment(index)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {!hideClipButton && (
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                                )}
                                <FloatingActionMenu
                                    className="relative"
                                    inline
                                    options={[
                                        {
                                            label: "Gerar Diagnóstico",
                                            onClick: onGenerateDiagnostics,
                                            Icon: <PlusIcon className="w-4 h-4" />,
                                        },
                                        {
                                            label: "Gerar Plano de Ação",
                                            onClick: onGenerateActionPlan,
                                            Icon: <Command className="w-4 h-4" />,
                                        },
                                    ]}
                                />
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim() || disabled}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim()
                                        ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>Enviar</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* <div className="flex flex-wrap items-center justify-center gap-2"> // Removed
                        {commandSuggestions.map((suggestion, index) => ( // Removed
                            <motion.button // Removed
                                key={suggestion.prefix} // Removed
                                onClick={() => selectCommandSuggestion(index)} // Removed
                                className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group" // Removed
                                initial={{ opacity: 0, y: 10 }} // Removed
                                animate={{ opacity: 1, y: 0 }} // Removed
                                transition={{ delay: index * 0.1 }} // Removed
                            > // Removed
                                {suggestion.icon} // Removed
                                <span>{suggestion.label}</span> // Removed
                                <motion.div // Removed
                                    className="absolute inset-0 border border-white/[0.05] rounded-lg" // Removed
                                    initial={false} // Removed
                                    animate={{ // Removed
                                        opacity: [0, 1], // Removed
                                        scale: [0.98, 1], // Removed
                                    }} // Removed
                                    transition={{ // Removed
                                        duration: 0.3, // Removed
                                        ease: "easeOut", // Removed
                                    }} // Removed
                                /> // Removed
                            </motion.button> // Removed
                        ))} // Removed
                    </div> */}
                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div 
                        className="fixed bottom-8 mx-auto transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-center">
                                <span className="text-xs font-medium text-white/90 mb-0.5">zap</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>Thinking</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}
interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="text-xs relative z-10">{label}</span>
            </div>
            
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
            
            <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
}


