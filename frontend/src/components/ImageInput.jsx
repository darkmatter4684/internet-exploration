import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import api from '../api';

export default function ImageInput({ value, onChange, label = "Image" }) {
    const [preview, setPreview] = useState(value);
    const [loading, setLoading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [mode, setMode] = useState('upload'); // 'upload' or 'url'
    const fileInputRef = useRef(null);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    // Handle File Upload
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const serverUrl = api.defaults.baseURL + response.data.url;
            onChange(serverUrl);
            setPreview(serverUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    // Handle Paste
    const handlePaste = async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                await uploadFile(blob);
                e.preventDefault();
                break;
            }
        }
    };

    // Handle URL Fetch
    const handleUrlFetch = async () => {
        if (!urlInput) return;
        setLoading(true);
        try {
            const response = await api.post('/fetch-image/', { url: urlInput });
            const serverUrl = api.defaults.baseURL + response.data.url;
            onChange(serverUrl);
            setPreview(serverUrl);
            setUrlInput('');
        } catch (error) {
            console.error("Fetch failed", error);
            alert("Failed to fetch image from URL");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2" onPaste={handlePaste}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden group">
                    {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    ) : preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => { onChange(''); setPreview(''); }}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-2">
                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                            <span className="text-xs text-gray-400">Paste (Ctrl+V)</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-3">
                    <div className="flex gap-2 border-b border-gray-200 pb-2">
                        <button
                            type="button"
                            onClick={() => setMode('upload')}
                            className={`text-sm font-medium px-2 py-1 rounded-md ${mode === 'upload' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Upload / Paste
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('url')}
                            className={`text-sm font-medium px-2 py-1 rounded-md ${mode === 'url' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            From URL
                        </button>
                    </div>

                    {mode === 'upload' ? (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Or paste an image directly from your clipboard (Ctrl+V).
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                            <button
                                type="button"
                                onClick={handleUrlFetch}
                                disabled={!urlInput || loading}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <LinkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
