import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function EntityTile({ entity }) {
    return (
        <Link to={`/entity/${entity.id}`} className="block group">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex h-32">
                {/* Image Section */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 relative">
                    {entity.image_url ? (
                        <img
                            src={entity.image_url}
                            alt={entity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-1">
                                    {entity.entity_type}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 truncate">
                                    {entity.name}
                                </h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{entity.locator}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        {entity.tags && entity.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                            </span>
                        ))}
                        {entity.tags && entity.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{entity.tags.length - 3} more</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
