"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

type Option = {
    label: string;
    value: string;
};

type Props = {
    options: Option[];
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    title?: string;
};

export default function MultiSelectDropdown({
    options,
    value,
    onChange,
    placeholder = "Select options",
    title,
}: Props) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    /* 🔴 Outside click handler */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const removeTag = (val: string) => {
        onChange(value.filter((v) => v !== val));
    };

    return (
        <div ref={wrapperRef} className="relative w-full">

            {title && <label className="label font-semibold">{title}</label>}

            {/* Input */}
            <div
                onClick={() => setOpen((prev) => !prev)}
                className="input input-bordered flex items-center justify-between cursor-pointer"
            >
                <div className="flex flex-wrap gap-1 overflow-hidden">
                    {value.length === 0 ? (
                        <span className="opacity-60">{placeholder}</span>
                    ) : (
                        value.map((v) => {
                            const opt = options.find((o) => o.value === v);
                            return (
                                <span
                                    key={v}
                                    className="badge badge-primary badge-sm gap-1"
                                >
                                    {opt?.label}
                                    <X
                                        className="w-3 h-3 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeTag(v);
                                        }}
                                    />
                                </span>
                            );
                        })
                    )}
                </div>

                <ChevronDown className="w-4 h-4 opacity-60" />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-[9999] mt-2 w-full bg-base-100 border border-base-300 rounded-box shadow-xl p-2">

                    <ul className="menu menu-sm max-h-60 overflow-y-auto">
                        {options.map((opt) => {
                            const checked = value.includes(opt.value);
                            return (
                                <li key={opt.value}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={checked}
                                            onChange={() => toggleOption(opt.value)}
                                        />
                                        <span className={checked ? "font-semibold" : ""}>
                                            {opt.label}
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Footer */}
                    <div className="mt-2 flex justify-between items-center px-1">
                        <button
                            onClick={() => onChange([])}
                            className="btn btn-ghost btn-xs"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="btn btn-primary btn-xs"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
