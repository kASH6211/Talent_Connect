'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface Option { value: number; label: string; }

interface Props {
    label: string;
    options: Option[];
    selected: number[];
    onChange: (vals: number[]) => void;
    placeholder?: string;
}

export default function MultiSelectDropdown({ label, options, selected, onChange, placeholder }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = (options ?? []).filter(o => o.label?.toLowerCase().includes(search.toLowerCase()));
    const count = selected.length;

    const toggle = (val: number) => {
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    };

    const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange([]); };

    return (
        <div className="relative" ref={ref}>
            <div className="text-[10px] font-semibold text-base-content/50 uppercase tracking-widest mb-1">{label}</div>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={clsx(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition-all',
                    open
                        ? 'border-primary bg-base-300'
                        : 'border-base-300 bg-base-200 hover:border-primary/40',
                    count > 0 ? 'text-base-content' : 'text-base-content/40'
                )}
            >
                <span className="truncate text-left">
                    {count === 0
                        ? (placeholder ?? 'Select…')
                        : count === 1
                            ? (options ?? []).find(o => o.value === selected[0])?.label
                            : `${count} selected`}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {count > 0 && (
                        <span onClick={clear} className="w-4 h-4 rounded flex items-center justify-center hover:bg-base-300 text-base-content/40 hover:text-error transition-colors">
                            <X size={10} />
                        </span>
                    )}
                    <ChevronDown size={14} className={clsx('text-base-content/40 transition-transform', open && 'rotate-180')} />
                </div>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-base-200 border border-base-300 rounded-xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-base-300">
                        <input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="input input-sm input-bordered w-full rounded-lg text-sm"
                        />
                    </div>
                    {/* Options */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0
                            ? <div className="px-3 py-3 text-xs text-base-content/40 text-center">No results</div>
                            : filtered.map(opt => {
                                const checked = selected.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggle(opt.value)}
                                        className={clsx(
                                            'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                                            checked ? 'bg-primary/10 text-base-content' : 'text-base-content/70 hover:bg-base-300'
                                        )}
                                    >
                                        <span className={clsx(
                                            'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
                                            checked ? 'bg-primary border-primary' : 'border-base-content/30'
                                        )}>
                                            {checked && <Check size={10} className="text-primary-content" />}
                                        </span>
                                        {opt.label}
                                    </button>
                                );
                            })}
                    </div>
                    {count > 0 && (
                        <div className="border-t border-base-300 px-3 py-2 flex justify-between items-center">
                            <span className="text-xs text-base-content/40">{count} selected</span>
                            <button onClick={clear} className="text-xs text-primary hover:text-primary/70 transition-colors">Clear all</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
