import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Tag as TagIcon, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import EntityTile from '../components/EntityTile';

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [loadingEntities, setLoadingEntities] = useState(false);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchTags();
    }, [searchQuery]);

    useEffect(() => {
        if (selectedTag) {
            fetchTagEntities(selectedTag.name);
            setEditName(selectedTag.name);
            setIsEditing(false);
        } else {
            setEntities([]);
        }
    }, [selectedTag]);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tags/', {
                params: { q: searchQuery, limit: 100 }
            });
            setTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTagEntities = async (tagName) => {
        setLoadingEntities(true);
        try {
            // Reusing the main entities search endpoint which supports filtering by tag
            // We need to ensure the backend supports searching by specific field 'tags'
            const response = await api.get('/entities/', {
                params: { q: tagName, search_field: 'tags', exact_match: true, limit: 50 }
            });
            setEntities(response.data);
        } catch (error) {
            console.error("Failed to fetch entities for tag", error);
        } finally {
            setLoadingEntities(false);
        }
    };

    const handleRename = async () => {
        if (!editName.trim() || editName === selectedTag.name) {
            setIsEditing(false);
            return;
        }

        if (!window.confirm(`Are you sure you want to rename "${selectedTag.name}" to "${editName}"? This will update ${entities.length} entities.`)) {
            return;
        }

        try {
            const response = await api.put(`/tags/${selectedTag.id}`, { name: editName });
            // Update local state
            const updatedTag = response.data;
            setTags(tags.map(t => t.id === updatedTag.id ? updatedTag : t));
            setSelectedTag(updatedTag);
            setIsEditing(false);
            // Refresh entities to show new tag name
            fetchTagEntities(updatedTag.name);
        } catch (error) {
            console.error("Failed to rename tag", error);
            alert("Failed to rename tag");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to DELETE "${selectedTag.name}"? This will remove the tag from ${entities.length} entities. This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/tags/${selectedTag.id}`);
            // Remove from list
            setTags(tags.filter(t => t.id !== selectedTag.id));
            setSelectedTag(null);
        } catch (error) {
            console.error("Failed to delete tag", error);
            alert("Failed to delete tag");
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
            {/* Left Sidebar: Tag List */}
            <div className="w-full md:w-1/3 bg-white shadow rounded-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : tags.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No tags found</div>
                    ) : (
                        tags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => setSelectedTag(tag)}
                                className={`w-full text-left px-4 py-3 rounded-md flex items-center justify-between group transition-colors ${selectedTag?.id === tag.id
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <TagIcon className={`h-4 w-4 mr-3 ${selectedTag?.id === tag.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <span className="font-medium">{tag.name}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Content: Tag Details */}
            <div className="flex-1 bg-white shadow rounded-lg flex flex-col overflow-hidden">
                {selectedTag ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</span>
                                </div>

                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="block w-full max-w-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                                            autoFocus
                                        />
                                        <button onClick={handleRename} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                            <Save className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-gray-900">{selectedTag.name}</h1>
                                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600">
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                <p className="mt-2 text-sm text-gray-500">
                                    Used in <span className="font-semibold text-gray-900">{entities.length}</span> entities
                                </p>
                            </div>

                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Tag
                            </button>
                        </div>

                        {/* Entities Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {loadingEntities ? (
                                <div className="text-center py-12">Loading entities...</div>
                            ) : entities.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>No entities found with this tag.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {entities.map(entity => (
                                        <EntityTile key={entity.id} entity={entity} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <TagIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg">Select a tag to manage</p>
                    </div>
                )}
            </div>
        </div>
    );
}
