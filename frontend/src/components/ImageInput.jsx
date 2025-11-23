import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2, Video as VideoIcon, Play } from 'lucide-react';
import api from '../api';

export default function ImageInput({ value, onChange, label = "Media" }) {
    const [preview, setPreview] = useState(value);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [urlInput, setUrlInput] = useState('');
    const [mode, setMode] = useState('upload'); // 'upload' or 'url'
    const fileInputRef = useRef(null);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const isVideo = (url) => {
        if (!url) return false;
        return url.match(/\.(mp4|webm)$/) != null;
    };

    // Handle File Upload
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        setLoading(true);
        setProgress(0);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            const serverUrl = api.defaults.baseURL + response.data.url;
            onChange(serverUrl);
            setPreview(serverUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload media");
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    // Handle Paste
    const handlePaste = async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
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
            const response = await api.post('/fetch-media/', { url: urlInput });
            const serverUrl = api.defaults.baseURL + response.data.url;
            onChange(serverUrl);
            setPreview(serverUrl);
            setUrlInput('');
        } catch (error) {
            console.error("Fetch failed", error);
            alert("Failed to fetch media from URL");
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
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                            {progress > 0 && <span className="text-xs text-gray-500">{progress}%</span>}
                        </div>
                    ) : preview ? (
                        <>
                            {isVideo(preview) ? (
                                <div className="relative w-full h-full flex items-center justify-center bg-black">
                                    <VideoIcon className="h-10 w-10 text-white opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="h-8 w-8 text-white fill-current" />
                                    </div>
                                </div>
                            ) : (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => { onChange(''); setPreview(''); }}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 z-10"
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
                                accept="image/*,video/mp4,video/webm"
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
                                Or paste media directly from your clipboard (Ctrl+V).
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
