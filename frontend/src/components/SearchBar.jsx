import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');
    const [field, setField] = useState('all');

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query, field);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [query, field, onSearch]);

    return (
        <div className="relative max-w-2xl mx-auto w-full flex gap-2">
            <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="block w-32 pl-3 pr-8 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm bg-white"
            >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="description">Description</option>
                <option value="tags">Tags</option>
                <option value="locator">Locator</option>
                <option value="type">Type</option>
            </select>
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                    placeholder={`Search by ${field === 'all' ? 'keyword' : field}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
        </div>
    );
}
