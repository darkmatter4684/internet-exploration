import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { formatDateIST } from '../utils';

export default function EntityTile({ entity }) {
    return (
        <Link to={`/entity/${entity.id}`} className="block group">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex h-40">
                {/* Image Section */}
                <div className="w-40 h-40 flex-shrink-0 bg-gray-100 relative">
                    {entity.image_url ? (
                        <img
                            src={entity.image_url}
                            alt={entity.name}
                            className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 mr-4">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 truncate">
                                {entity.name}
                            </h3>
                            <p className="text-sm text-indigo-600 truncate hover:underline">
                                {entity.locator}
                            </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex-shrink-0">
                            {entity.entity_type}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">
                        {entity.description || <span className="italic text-gray-400">No description provided.</span>}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        {entity.tags && entity.tags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                {tag}
                            </span>
                        ))}
                        {entity.tags && entity.tags.length > 5 && (
                            <span className="text-xs text-gray-500">+{entity.tags.length - 5} more</span>
                        )}
                    </div>

                    {entity.updated_at && (
                        <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400 text-right">
                            Updated: {formatDateIST(entity.updated_at)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
