import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Outer Ring Animation */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-pink-300 animate-ping opacity-75"
        style={{ animationDuration: '1.5s' }}
      ></div>
      
      {/* Main Logo Container */}
      <div className="relative w-16 h-16 flex items-center justify-center z-10">
        <div 
          className="absolute w-full h-full rounded-full border-4 border-pink-300 animate-spin"
          style={{ animationDuration: '3s' }}
        ></div>
        
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 shadow-md animate-bounce" 
               style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-purple-500 shadow-md animate-bounce" 
               style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;