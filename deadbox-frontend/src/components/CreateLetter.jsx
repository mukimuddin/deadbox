import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateLetter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    videoLink: '',
    scheduledDate: '',
    triggerType: 'date', // 'date' or 'inactivity'
    inactivityDays: 30,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement letter creation logic
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create a New Letter
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700">
                  Video Link (Optional)
                </label>
                <input
                  type="url"
                  name="videoLink"
                  id="videoLink"
                  value={formData.videoLink}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Trigger
                </label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="triggerType"
                      value="date"
                      checked={formData.triggerType === 'date'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700">
                      Schedule for specific date
                    </label>
                  </div>
                  {formData.triggerType === 'date' && (
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  )}

                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="triggerType"
                      value="inactivity"
                      checked={formData.triggerType === 'inactivity'}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label className="ml-3 block text-sm font-medium text-gray-700">
                      Trigger after inactivity period
                    </label>
                  </div>
                  {formData.triggerType === 'inactivity' && (
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="inactivityDays"
                        value={formData.inactivityDays}
                        onChange={handleChange}
                        min="1"
                        className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <span className="ml-2 text-sm text-gray-500">days of inactivity</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLetter; 