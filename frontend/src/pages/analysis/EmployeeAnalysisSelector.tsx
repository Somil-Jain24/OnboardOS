import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, User, Sparkles } from 'lucide-react';
import { ANALYSIS_EMPLOYEES, type EmployeeAnalysisProfile } from './analysisData';
import { cn } from '../../utils/cn';

interface Props {
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const EmployeeAnalysisSelector: React.FC<Props> = ({ selectedKey, onSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const quickKeys = ['rahul', 'amit', 'priya'];
  const allEmployees = Object.values(ANALYSIS_EMPLOYEES);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = allEmployees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  const selectedProfile = ANALYSIS_EMPLOYEES[selectedKey] || ANALYSIS_EMPLOYEES['rahul'];
  const isCustomSelected = !quickKeys.includes(selectedKey);

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200 self-start lg:self-auto relative select-none">
      <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider font-mono">
        Employee:
      </span>

      {/* 1. Quick Pill: Rahul */}
      <button
        type="button"
        onClick={() => {
          onSelect('rahul');
          setDropdownOpen(false);
        }}
        className={cn(
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
          selectedKey === 'rahul'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
        )}
      >
        <span>Rahul</span>
        <span className={cn('text-[10px] font-mono', selectedKey === 'rahul' ? 'opacity-85 text-white' : 'text-slate-400')}>
          (EMP10024)
        </span>
      </button>

      {/* 2. Quick Pill: Amit */}
      <button
        type="button"
        onClick={() => {
          onSelect('amit');
          setDropdownOpen(false);
        }}
        className={cn(
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
          selectedKey === 'amit'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
        )}
      >
        <span>Amit</span>
        <span className={cn('text-[10px] font-mono', selectedKey === 'amit' ? 'opacity-85 text-white' : 'text-slate-400')}>
          (EMP10031)
        </span>
      </button>

      {/* 3. Quick Pill: Priya */}
      <button
        type="button"
        onClick={() => {
          onSelect('priya');
          setDropdownOpen(false);
        }}
        className={cn(
          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
          selectedKey === 'priya'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
        )}
      >
        <span>Priya</span>
        <span className={cn('text-[10px] font-mono', selectedKey === 'priya' ? 'opacity-85 text-white' : 'text-slate-400')}>
          (EMP10029)
        </span>
      </button>

      {/* 4. Fourth Button: Dropdown Button with Search Feature */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
            isCustomSelected
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : dropdownOpen
              ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
          )}
        >
          <Search className="w-3.5 h-3.5 opacity-70" />
          <span>
            {isCustomSelected ? `${selectedProfile.name.split(' ')[0]} (${selectedProfile.id})` : 'Search Employee'}
          </span>
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
        </button>

        {/* Dropdown Menu Popup */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, role..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Employee List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 ai-scrollbar">
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No employee matches &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = selectedKey === emp.key;
                  return (
                    <button
                      key={emp.key}
                      type="button"
                      onClick={() => {
                        onSelect(emp.key);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black font-mono flex-shrink-0">
                          {emp.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate leading-tight">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {emp.id} • {emp.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={cn(
                          'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                          emp.overallScore >= 75
                            ? 'bg-emerald-50 text-emerald-700'
                            : emp.overallScore >= 60
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        )}>
                          {emp.overallScore}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
