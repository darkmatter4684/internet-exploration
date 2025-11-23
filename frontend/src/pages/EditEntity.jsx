import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import ImageInput from '../components/ImageInput';
import { Plus, Minus, Save, X, Image as ImageIcon } from 'lucide-react';

export default function EditEntity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState(null);

  const [formData, setFormData] = useState({
    entity_type: 'Website',
    name: '',
    locator: '',
    description: '',
    tags: '',
    image_url: ''
  });

  const [dynamicAttributes, setDynamicAttributes] = useState([]);

  useEffect(() => {
    fetchEntity();
  }, [id]);

  const fetchEntity = async () => {
    try {
      const response = await api.get(`/entities/${id}`);
      const data = response.data;

      setFormData({
        entity_type: data.entity_type,
        name: data.name,
        locator: data.locator,
        description: data.description || '',
        tags: data.tags ? data.tags.join(', ') : '',
        image_url: data.image_url || ''
      });

      // Convert attributes dict to array
      const attrs = [];
      if (data.attributes) {
        Object.values(data.attributes).forEach(attr => {
          if (attr.active) {
            attrs.push(attr);
          }
        });
      }
      setDynamicAttributes(attrs);

    } catch (error) {
      console.error("Failed to fetch entity", error);
      alert("Failed to load entity data.");
      navigate('/');
    }
  };

  const handleFixedChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url) => {
    setFormData({ ...formData, image_url: url });
  };

  const addDynamicAttribute = () => {
    setDynamicAttributes([
      ...dynamicAttributes,
      { key: '', description: '', url: '', remarks: '', active: true }
    ]);
  };

  const removeDynamicAttribute = (index) => {
    const newAttrs = [...dynamicAttributes];
    newAttrs.splice(index, 1);
    setDynamicAttributes(newAttrs);
  };

  const handleDynamicChange = (index, field, value) => {
    const newAttrs = [...dynamicAttributes];
    newAttrs[index][field] = value;
    setDynamicAttributes(newAttrs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tagsList = formData.tags.split(',').map(t => t.trim()).filter(t => t);

    const attributesDict = {};
    dynamicAttributes.forEach(attr => {
      if (attr.key) {
        attributesDict[attr.key] = attr;
      }
    });

    const payload = {
      ...formData,
      tags: tagsList,
      attributes: attributesDict
    };

    try {
      await api.put(`/entities/${id}`, payload);
      navigate(`/entity/${id}`);
    } catch (error) {
      console.error("Failed to update entity", error);
      alert("Failed to update entity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Entity</h1>
        <button onClick={() => navigate(`/entity/${id}`)} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fixed Fields Section */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Entity Type</label>
            <select
              name="entity_type"
              value={formData.entity_type}
              onChange={handleFixedChange}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option>Website</option>
              <option>Personality</option>
              <option>Service</option>
              <option>Software</option>
              <option>Other</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleFixedChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3 px-4"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Locator (URL/Handle)</label>
            <input
              type="text"
              name="locator"
              required
              value={formData.locator}
              onChange={handleFixedChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3 px-4"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleFixedChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3 px-4"
            />
          </div>

          <div className="sm:col-span-6">
            <ImageInput
              value={formData.image_url}
              onChange={handleImageChange}
              label="Main Image"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              placeholder="tech, blog, ai"
              value={formData.tags}
              onChange={handleFixedChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm text-base border-gray-300 rounded-md py-3 px-4"
            />
          </div>
        </div>

        {/* Dynamic Attributes Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Dynamic Attributes</h3>
            <button
              type="button"
              onClick={addDynamicAttribute}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Attribute
            </button>
          </div>

          <div className="space-y-4">
            {dynamicAttributes.map((attr, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => removeDynamicAttribute(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Key (Unique ID)</label>
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => handleDynamicChange(index, 'key', e.target.value)}
                      className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4"
                      placeholder="e.g., pricing_model"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Description/Value</label>
                    <input
                      type="text"
                      value={attr.description}
                      onChange={(e) => handleDynamicChange(index, 'description', e.target.value)}
                      className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4"
                      placeholder="e.g., Freemium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">URL / Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={attr.url}
                        onChange={(e) => handleDynamicChange(index, 'url', e.target.value)}
                        className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveImageModal(index)}
                        className="mt-1 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        title="Upload Image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Remarks (Optional)</label>
                    <input
                      type="text"
                      value={attr.remarks}
                      onChange={(e) => handleDynamicChange(index, 'remarks', e.target.value)}
                      className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4"
                    />
                  </div>
                </div>
              </div>
            ))}
            {dynamicAttributes.length === 0 && (
              <p className="text-sm text-gray-500 italic">No dynamic attributes added yet.</p>
            )}
          </div>
        </div>

        {/* Image Modal for Dynamic Attributes */}
        {activeImageModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set Image for Attribute</h3>
              <ImageInput
                value={dynamicAttributes[activeImageModal]?.url || ''}
                onChange={(url) => {
                  handleDynamicChange(activeImageModal, 'url', url);
                  // Don't close immediately so they can see preview
                }}
                label="Attribute Image"
              />
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveImageModal(null)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/entity/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save Entity'}
          </button>
        </div>
      </form>
    </div>
  );
}
