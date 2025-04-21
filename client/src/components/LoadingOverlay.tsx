import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Generating Diagram</h3>
        </div>
        <p className="text-sm text-gray-500">Gemini AI is analyzing your requirements and creating a system architecture diagram. This may take a few moments...</p>
        <div className="mt-4 bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[70%]"></div>
        </div>
      </div>
    </div>
  );
}
