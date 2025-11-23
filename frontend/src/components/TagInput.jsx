import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import api from '../api';

export default function TagInput({ value, onChange, placeholder }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Parse value (comma separated string) into array
    const tags = value ? value.split(',').map(t => t.trim()).filter(t => t) : [];

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (inputValue.trim().length < 1) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await api.get('/tags/', { params: { q: inputValue, limit: 5 } });
                // Filter out tags already selected
                const filtered = response.data.filter(tag => !tags.includes(tag.name));
                setSuggestions(filtered);
                setSelectedIndex(0);
            } catch (error) {
                console.error("Failed to fetch tags", error);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [inputValue, tags]);

    const addTag = (tag) => {
        const newTags = [...tags, tag];
        onChange(newTags.join(', '));
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (index) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onChange(newTags.join(', '));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                addTag(suggestions[selectedIndex].name);
            } else if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative">
            <div
                className="min-h-[50px] border border-gray-600 rounded-md px-4 py-3 bg-white flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                            className="ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600 focus:outline-none"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 min-w-[120px] border-none focus:ring-0 p-0 text-base text-gray-900 placeholder-gray-400"
                    placeholder={tags.length === 0 ? placeholder : ""}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => inputValue && setShowSuggestions(true)}
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.id}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${index === selectedIndex ? 'text-white bg-indigo-600' : 'text-gray-900'
                                }`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                addTag(suggestion.name);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <span className={`block truncate ${index === selectedIndex ? 'font-semibold' : 'font-normal'}`}>
                                {suggestion.name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
