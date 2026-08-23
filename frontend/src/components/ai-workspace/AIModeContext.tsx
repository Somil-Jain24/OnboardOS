import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { UserRole, User } from '../../types';
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

const getUserStorageKey = (role: UserRole, user: User | null): string => {
  if (!user) return `${CONV_STORAGE_KEY_PREFIX}${role}_default`;
  const rawId = (user.id || user.employeeId || user.email || user.name || role)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  return `${CONV_STORAGE_KEY_PREFIX}${role}_${rawId}`;
};

const getInitialUserConversations = (role: UserRole, user: User | null): AIConversation[] => {
  if (!user) return getInitialConversations(role);
  if (role === 'EMPLOYEE' && (user.email.includes('rahul') || user.name.toLowerCase().includes('rahul'))) {
    return getInitialConversations('EMPLOYEE');
  }
  if (role === 'HR' && (user.email.includes('sarah') || user.name.toLowerCase().includes('sarah'))) {
    return getInitialConversations('HR');
  }
  if (role === 'MANAGER' && (user.email.includes('marcus') || user.name.toLowerCase().includes('marcus'))) {
    return getInitialConversations('MANAGER');
  }
  return [];
};

export const AIModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole, currentUser } = useAuth();

  const [theme, setThemeState] = useState<'dark' | 'light'>('light');

  const [isAIMode, setIsAIMode] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionStep, setTransitionStep] = useState<number>(0);

  // Sync theme with HTML document element for global Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

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

  const currentStorageKey = getUserStorageKey(currentRole, currentUser);

  const [conversations, setConversations] = useState<AIConversation[]>(() => {
    try {
      const stored = localStorage.getItem(currentStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return getInitialUserConversations(currentRole, currentUser);
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Sync / reload conversations whenever currentUser or currentRole changes
  useEffect(() => {
    const key = getUserStorageKey(currentRole, currentUser);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setConversations(parsed);
          setActiveConversationId(null);
          return;
        }
      }
    } catch {}
    setConversations(getInitialUserConversations(currentRole, currentUser));
    setActiveConversationId(null);
  }, [currentRole, currentUser?.id, currentUser?.email, currentUser?.employeeId]);

  // Persist conversations for the exact user
  useEffect(() => {
    const key = getUserStorageKey(currentRole, currentUser);
    try {
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch {}
  }, [conversations, currentRole, currentUser?.id, currentUser?.email, currentUser?.employeeId]);

  // Smooth, snappy transition when toggling AI Mode
  const toggleAIMode = (override?: boolean) => {
    const nextState = override !== undefined ? override : !isAIMode;

    if (nextState) {
      // Entering AI Mode -> Snappy Cinematic Sequence
      setIsTransitioning(true);
      setTransitionStep(1); // Dim & blur

      setTimeout(() => setTransitionStep(2), 150); // Glow appearance
      setTimeout(() => setTransitionStep(3), 300); // Orb appearance
      setTimeout(() => {
        setIsAIMode(true);
        setTransitionStep(4);
      }, 500);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionStep(0);
      }, 800);
    } else {
      // Exiting AI Mode -> Smooth reverse to manual mode
      setIsTransitioning(true);
      setTransitionStep(3);
      setTimeout(() => {
        setIsAIMode(false);
        setTransitionStep(1);
      }, 150);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionStep(0);
      }, 350);
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

    // AI Thinking State with modern jumping dots
    setIsThinking(true);

    const tempAiMessageId = `ai-${Date.now()}`;
    const placeholderMessage: AIMessage = {
      id: tempAiMessageId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'thinking',
      roleContext: currentRole,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === targetConvId ? { ...c, messages: [...c.messages, placeholderMessage] } : c))
    );

    try {
      // Natural thinking delay (4.0s - 5.0s) as requested
      const thinkingDelay = Math.floor(Math.random() * 1000) + 4000;
      await new Promise((resolve) => setTimeout(resolve, thinkingDelay));

      const aiResult = await generateAIResponse(textToSend, currentRole, currentUser);
      const fullContent = aiResult.content || 'I have analyzed your request based on current system data.';

      setIsThinking(false);

      // Natural, smooth word-by-word streaming effect
      let charIndex = 0;
      const totalLength = fullContent.length;
      const streamSpeed = 16;

      const interval = setInterval(() => {
        // Increment characters smoothly
        const step = Math.max(4, Math.floor(totalLength / 60));
        charIndex = Math.min(totalLength, charIndex + step);

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
