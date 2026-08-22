import { useState, useEffect } from 'react';
import {
  subscribeToDomainEvents,
  getRecentDomainEvents,
  getRealtimeConnectionState,
  type DomainEvent,
} from '../../utils/domainEventBus';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import {
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
} from 'lucide-react';

export function LiveActivityTicker() {
  const { currentRole, currentUser } = useAuth();
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const connection = getRealtimeConnectionState();

  useEffect(() => {
    // Initial events
    const empId = currentRole === 'EMPLOYEE' ? 'emp-rahul' : undefined;
    setEvents(getRecentDomainEvents(10, currentRole, empId));

    // Subscribe to new incoming live events
    const unsubscribe = subscribeToDomainEvents((newEvent) => {
      if (currentRole === 'EMPLOYEE' && newEvent.employeeId && newEvent.employeeId !== 'emp-rahul') {
        return;
      }
      setEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)].slice(0, 15));
      setCurrentIndex(0); // Jump to latest event
    });

    return unsubscribe;
  }, [currentRole]);

  // Auto-rotate ticker every 6 seconds if not paused
  useEffect(() => {
    if (events.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [events.length, isPaused]);

  if (events.length === 0) return null;

  const currentEvent = events[currentIndex] || events[0];

  const getPriorityBadge = (priority: DomainEvent['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getEventIcon = (type: DomainEvent['type']) => {
    if (type.includes('failed') || type.includes('exception')) {
      return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
    }
    if (type.includes('approved') || type.includes('succeeded') || type.includes('ready')) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (type.includes('automation')) {
      return <Zap className="w-3.5 h-3.5 text-indigo-600" />;
    }
    return <Radio className="w-3.5 h-3.5 text-blue-600" />;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `${diffHr}h ago`;
    } catch {
      return 'recent';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-xs transition-all select-none shadow-xs z-10"
    >
      {/* Left: Pulse Indicator & Feed Label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
        </span>
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono hidden sm:inline">
          Live Domain Stream
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[9px] font-bold border',
            getPriorityBadge(currentEvent.priority)
          )}
        >
          {currentEvent.priority}
        </span>
      </div>

      {/* Center: Active Event Message */}
      <div className="flex-1 mx-3 min-w-0 flex items-center gap-2 truncate">
        {getEventIcon(currentEvent.type)}
        <span className="font-semibold text-slate-800 text-[11px] truncate">
          {currentEvent.summary}
        </span>
        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 hidden md:inline">
          ({formatRelativeTime(currentEvent.timestamp)})
        </span>
      </div>

      {/* Right: Controls & Connection Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-[10px] text-slate-400 font-mono hidden lg:flex items-center gap-1">
          <span className="text-slate-500 font-medium">Source:</span>
          <span className="text-slate-600 font-semibold">{currentEvent.source}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-0.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1))}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
            title="Previous event"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-600 px-1">
            {currentIndex + 1}/{events.length}
          </span>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % events.length)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
            title="Next event"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
