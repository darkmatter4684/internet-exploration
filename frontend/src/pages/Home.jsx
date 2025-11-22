import React, { useState, useEffect } from 'react';
import api from '../api';
import SearchBar from '../components/SearchBar';
import EntityTile from '../components/EntityTile';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [hasMore, setHasMore] = useState(true); // Simple way to handle pagination for now

    const fetchEntities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/entities/', {
                params: {
                    q: searchQuery,
                    skip: page * limit,
                    limit: limit
                }
            });
            setEntities(response.data);
            // If we got fewer items than limit, we reached the end
            if (response.data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error("Failed to fetch entities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, [searchQuery, page, limit]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(0); // Reset to first page on new search
    };

    return (
        <div className="space-y-6">
            {/* Top Section: Search and New Entity Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <Link
                    to="/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Entity
                </Link>
            </div>

            {/* Results Section */}
            <div className="bg-white shadow rounded-lg p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Results</h2>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(0);
                            }}
                            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : entities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No entities found. Try adjusting your search or add a new one.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {entities.map((entity) => (
                            <EntityTile key={entity.id} entity={entity} />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6 border-t pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {page + 1}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
