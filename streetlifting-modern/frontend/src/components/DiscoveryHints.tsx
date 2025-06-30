import React from 'react';

interface DiscoveryHintsProps {
  hints: string[];
}

const DiscoveryHints: React.FC<DiscoveryHintsProps> = ({ hints }) => {
  if (hints.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xl">💡</span>
        <h3 className="text-lg font-semibold text-blue-900">Discover More</h3>
      </div>
      
      <div className="grid gap-2">
        {hints.map((hint, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            <p className="text-sm text-blue-800 leading-relaxed">{hint}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600 italic">
          These suggestions help you discover features that match your training style.
        </p>
      </div>
    </div>
  );
};

export default DiscoveryHints;
