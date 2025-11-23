import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDateIST } from '../utils';
import api from '../api';
import { Edit, MoreVertical, Trash2, ExternalLink, ArrowUp, Maximize2, Minimize2 } from 'lucide-react';

export default function EntityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedKeys, setExpandedKeys] = useState({});
    const [expandedMainImage, setExpandedMainImage] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const fetchEntity = async () => {
        try {
            const response = await api.get(`/entities/${id}`);
            setEntity(response.data);
        } catch (error) {
            console.error("Failed to fetch entity", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntity();

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this entity?")) {
            try {
                await api.delete(`/entities/${id}`);
                navigate('/');
            } catch (error) {
                console.error("Failed to delete entity", error);
            }
        }
    };

    // Helper to check if a URL is an image
    const isImage = (url) => {
        if (!url) return false;
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    };

    const toggleExpand = (key) => {
        setExpandedKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const expandAll = () => {
        if (entity.image_url) setExpandedMainImage(true);

        const newExpandedKeys = {};
        if (entity.attributes) {
            Object.values(entity.attributes).forEach(attr => {
                if (attr.active && isImage(attr.url)) {
                    newExpandedKeys[attr.key] = true;
                }
            });
        }
        setExpandedKeys(newExpandedKeys);
    };

    const collapseAll = () => {
        setExpandedMainImage(false);
        setExpandedKeys({});
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!entity) return <div className="text-center py-12">Entity not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 relative pb-12">
            {/* Header Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="md:flex">
                    {/* Main Image */}
                    <div className="md:w-1/3 h-64 md:h-auto bg-gray-100 relative">
                        {entity.image_url ? (
                            <img
                                src={entity.image_url}
                                alt={entity.name}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setExpandedMainImage(!expandedMainImage)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>

                    {/* Fixed Details */}
                    <div className="p-8 md:w-2/3 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-2">
                                        {entity.entity_type}
                                    </span>
                                    <h1 className="text-3xl font-bold text-gray-900">{entity.name}</h1>
                                    <a href={entity.locator} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center mt-1">
                                        {entity.locator} <ExternalLink className="h-4 w-4 ml-1" />
                                    </a>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/entity/${id}/edit`}
                                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                <span>Created: {formatDateIST(entity.created_at)}</span>
                                <span>Updated: {formatDateIST(entity.updated_at)}</span>
                            </div>

                            <p className="mt-4 text-gray-600 text-lg">{entity.description}</p>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tags</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {entity.tags && entity.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Main Image */}
                {expandedMainImage && entity.image_url && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 animate-fade-in">
                        <img
                            src={entity.image_url}
                            alt="Expanded Main"
                            className="w-full h-auto rounded-lg shadow-sm cursor-pointer"
                            onClick={() => setExpandedMainImage(false)}
                        />
                    </div>
                )}
            </div>

            {/* Dynamic Attributes Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Attributes & Metadata</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={expandAll}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Maximize2 className="h-4 w-4 mr-1" />
                            Expand All
                        </button>
                        <button
                            onClick={collapseAll}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Minimize2 className="h-4 w-4 mr-1" />
                            Collapse All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {Object.values(entity.attributes || {}).filter(attr => attr.active).map((attr, idx) => (
                        <div key={idx} className="bg-white shadow rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                                {/* Thumbnail if URL is image */}
                                {isImage(attr.url) && (
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden cursor-pointer" onClick={() => toggleExpand(attr.key)}>
                                        <img
                                            src={attr.url}
                                            alt={attr.key}
                                            className="w-full h-full object-cover hover:opacity-90"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{attr.key}</h3>
                                        {attr.updated_at && (
                                            <span className="text-xs text-gray-400" title={`Created: ${formatDateIST(attr.created_at)}`}>
                                                Updated: {formatDateIST(attr.updated_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mt-1">{attr.description}</p>
                                    {attr.url && !isImage(attr.url) && (
                                        <a href={attr.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block mt-1 truncate">
                                            {attr.url}
                                        </a>
                                    )}
                                    {attr.remarks && (
                                        <p className="text-sm text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                                            "{attr.remarks}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Image Inline */}
                            {isImage(attr.url) && expandedKeys[attr.key] && (
                                <div className="mt-4 animate-fade-in">
                                    <img
                                        src={attr.url}
                                        alt={attr.key}
                                        className="w-full h-auto rounded-lg shadow-sm"
                                        onClick={() => toggleExpand(attr.key)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {Object.values(entity.attributes || {}).filter(attr => attr.active).length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500 italic">
                            No dynamic attributes found.
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 z-50"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
