import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [letters, setLetters] = useState([]); // Will be populated from API

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Letters</h1>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Letter
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {letters.length === 0 ? (
                <li className="px-4 py-4">
                  <p className="text-gray-500 text-center">No letters found. Create your first letter to get started.</p>
                </li>
              ) : (
                letters.map((letter) => (
                  <li key={letter._id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">{letter.title}</p>
                        <p className="text-sm text-gray-500">Scheduled for: {letter.scheduledDate}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 