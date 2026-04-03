'use client';

import React from 'react';
import Select, { Props } from 'react-select';

export interface OptionType {
    value: string | number;
    label: string;
}

interface SearchableSelectProps extends Omit<Props<OptionType, false>, 'options' | 'value' | 'defaultValue'> {
    options: OptionType[];
    name?: string;
    required?: boolean;
    defaultValue?: string | number | null;
    placeholder?: string;
    className?: string;
}

export default function SearchableSelect({
    options,
    name,
    required,
    defaultValue,
    placeholder = 'اختر...',
    className = '',
    ...props
}: SearchableSelectProps) {
    const defaultOption = defaultValue
        ? options.find(opt => String(opt.value) === String(defaultValue))
        : null;

    return (
        <div className={`relative ${className}`}>
            <Select
                options={options}
                defaultValue={defaultOption}
                name={name}
                required={required}
                placeholder={placeholder}
                isSearchable={true}
                isClearable={true}
                noOptionsMessage={() => 'لا يوجد نتائج مطابقة'}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        borderRadius: '0.5rem',
                        borderColor: state.isFocused ? '#c5b358' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 2px rgba(197, 179, 88, 0.2)' : 'none',
                        '&:hover': {
                            borderColor: state.isFocused ? '#c5b358' : '#d1d5db'
                        },
                        backgroundColor: '#f9fafb',
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 50,
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#eff6ff' : 'white',
                        color: state.isSelected ? 'white' : '#111827',
                        '&:active': {
                            backgroundColor: '#1e3a8a',
                            color: 'white'
                        },
                        cursor: 'pointer'
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: '#1e3a8a',
                        fontWeight: 500
                    }),
                    input: (base) => ({
                        ...base,
                        color: '#1e3a8a',
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: '#9ca3af',
                    })
                }}
                {...props}
            />
            {/* Hidden input to ensure native form submission works reliably even if react-select prevents default on some elements */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    style={{
                        opacity: 0,
                        width: '100%',
                        height: 0,
                        position: 'absolute',
                        bottom: 0
                    }}
                    required={required}
                    // React Select handles the actual value, but this ensures HTML5 validation triggers
                    // if the select is empty.
                    value={defaultOption ? "filled" : ""}
                    onChange={() => { }}
                />
            )}
        </div>
    );
}
