import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import type { AIConversation, AIMessage } from './types';
import { getInitialConversations, generateAIResponse } from './aiRoleKnowledge';

interface AIModeContextType {
  isAIMode: boolean;
  toggleAIMode: (override?: boolean) => void;
  isTransitioning: boolean;
  transitionStep: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
  conversations: AIConversation[];
  activeConversationId: string | null;
  currentConversation: AIConversation | null;
  sendMessage: (queryText: string) => Promise<void>;
  selectConversation: (id: string) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string, e?: React.MouseEvent) => void;
  renameConversation: (id: string, newTitle: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (open: boolean) => void;
  filteredConversations: AIConversation[];
  isThinking: boolean;
}

const AIModeContext = createContext<AIModeContextType | undefined>(undefined);

const CONV_STORAGE_KEY_PREFIX = 'onboardos_ai_conversations_';
const THEME_STORAGE_KEY = 'onboardos_ai_theme';

export const AIModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole, currentUser } = useAuth();

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionStep, setTransitionStep] = useState<number>(0);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  };

  const [conversations, setConversations] = useState<AIConversation[]>(() => {
    try {
      const stored = localStorage.getItem(`${CONV_STORAGE_KEY_PREFIX}${currentRole}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getInitialConversations(currentRole);
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Sync / reload role conversations when role changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${CONV_STORAGE_KEY_PREFIX}${currentRole}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(null);
          return;
        }
      }
    } catch {}
    setConversations(getInitialConversations(currentRole));
    setActiveConversationId(null);
  }, [currentRole]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(`${CONV_STORAGE_KEY_PREFIX}${currentRole}`, JSON.stringify(conversations));
    } catch {}
  }, [conversations, currentRole]);

  // Smooth cinematic multi-step transition when toggling AI Mode
  const toggleAIMode = (override?: boolean) => {
    const nextState = override !== undefined ? override : !isAIMode;

    if (nextState) {
      // Entering AI Mode -> Cinematic Sequence
      setIsTransitioning(true);
      setTransitionStep(1); // Dim & blur

      setTimeout(() => setTransitionStep(2), 250); // Glow appearance
      setTimeout(() => setTransitionStep(3), 550); // Neural orb manifestation
      setTimeout(() => setTransitionStep(4), 900); // Glow expands outward
      setTimeout(() => {
        setTransitionStep(5); // Switch view
        setIsAIMode(true);
      }, 1200);
      setTimeout(() => {
        setTransitionStep(6); // Finalize slide & fade
      }, 1450);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionStep(0);
      }, 1750);
    } else {
      // Exiting AI Mode -> Smooth reverse
      setIsTransitioning(true);
      setTransitionStep(5);
      setTimeout(() => {
        setIsAIMode(false);
        setTransitionStep(2);
      }, 250);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionStep(0);
      }, 550);
    }
  };

  const currentConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarMobileOpen(false);
  };

  const createNewConversation = () => {
    setActiveConversationId(null);
    setSidebarMobileOpen(false);
  };

  const deleteConversation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
    );
  };

  const generateDynamicTitle = (prompt: string): string => {
    const clean = prompt.replace(/[^\w\s-]/g, '').trim();
    const words = clean.split(/\s+/).slice(0, 4);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'New Discussion';
  };

  const sendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    let targetConvId = activeConversationId;
    let isNewConv = false;

    const userMessage: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    if (!targetConvId) {
      // Create new conversation
      isNewConv = true;
      targetConvId = `conv-${Date.now()}`;
      const newTitle = generateDynamicTitle(textToSend);

      const newConversation: AIConversation = {
        id: targetConvId,
        title: newTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: currentRole,
        timeGroup: 'Today',
        messages: [userMessage],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(targetConvId);
    } else {
      // Append to active conversation
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === targetConvId) {
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              timeGroup: 'Today',
              messages: [...conv.messages, userMessage],
            };
          }
          return conv;
        })
      );
    }

    // AI Thinking & Multi-step Realistic Loading Sequence
    setIsThinking(true);

    const tempAiMessageId = `ai-${Date.now()}`;
    const placeholderMessage: AIMessage = {
      id: tempAiMessageId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'thinking',
      loadingStep: 'Querying employee database & identity graph...',
      loadingProgress: 18,
      roleContext: currentRole,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === targetConvId ? { ...c, messages: [...c.messages, placeholderMessage] } : c))
    );

    // Step 2: Scan task DAG & SLAs at 2.5s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempAiMessageId
                  ? {
                      ...m,
                      loadingStep: 'Scanning task DAG, deadlines & SLA breaches...',
                      loadingProgress: 48,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    }, 2500);

    // Step 3: Audit IT queues & Access policies at 5.5s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempAiMessageId
                  ? {
                      ...m,
                      loadingStep: 'Auditing IT access queues & RBAC policy entitlements...',
                      loadingProgress: 76,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    }, 5500);

    // Step 4: Synthesize intelligence at 8.2s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempAiMessageId
                  ? {
                      ...m,
                      loadingStep: 'Synthesizing decision intelligence & recommendations...',
                      loadingProgress: 94,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    }, 8200);

    // Step 5: Start streaming response at 10.5s
    setTimeout(async () => {
      try {
        const aiResult = await generateAIResponse(textToSend, currentRole, currentUser);
        const fullContent = aiResult.content || 'I have analyzed your request based on current system data.';

        // Streaming text simulation
        setIsThinking(false);
        let charIndex = 0;
        const totalLength = fullContent.length;
        const streamSpeed = totalLength > 400 ? 8 : 14;

        const interval = setInterval(() => {
          charIndex += Math.max(4, Math.floor(totalLength / 35));
          if (charIndex >= totalLength) {
            clearInterval(interval);
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetConvId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempAiMessageId
                        ? {
                            ...m,
                            content: fullContent,
                            status: 'completed',
                            loadingStep: undefined,
                            loadingProgress: 100,
                            evidence: aiResult.evidence,
                            actions: aiResult.actions,
                          }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          } else {
            const currentSlice = fullContent.slice(0, charIndex);
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetConvId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempAiMessageId
                        ? {
                            ...m,
                            content: currentSlice,
                            status: 'streaming',
                            loadingStep: undefined,
                          }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          }
        }, streamSpeed);
      } catch {
        setIsThinking(false);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempAiMessageId
                    ? {
                        ...m,
                        content: 'Something went wrong while synthesizing the response. Please try again.',
                        status: 'error',
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
      }
    }, 10500);
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  return (
    <AIModeContext.Provider
      value={{
        isAIMode,
        toggleAIMode,
        isTransitioning,
        transitionStep,
        theme,
        toggleTheme,
        setTheme,
        conversations,
        activeConversationId,
        currentConversation,
        sendMessage,
        selectConversation,
        createNewConversation,
        deleteConversation,
        renameConversation,
        searchQuery,
        setSearchQuery,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        sidebarMobileOpen,
        setSidebarMobileOpen,
        filteredConversations,
        isThinking,
      }}
    >
      {children}
    </AIModeContext.Provider>
  );
};

export const useAIMode = () => {
  const context = useContext(AIModeContext);
  if (!context) {
    throw new Error('useAIMode must be used within an AIModeProvider');
  }
  return context;
};
