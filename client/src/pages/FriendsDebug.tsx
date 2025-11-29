/**
 * Friends Debug Page
 * Debugging version to identify rendering issues
 */

import React from 'react';

export const FriendsDebug: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6" style={{ background: 'blue', minHeight: '400px' }}>
      <h1 className="text-3xl font-bold text-white">FRIENDS DEBUG PAGE - IF YOU SEE THIS, COMPONENT IS RENDERING</h1>
      <p className="text-white mt-4">This is a test version to verify basic rendering works</p>
    </div>
  );
};
