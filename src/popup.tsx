// src/popup.tsx
import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  return (
    <div>
      <h1>WebTOC</h1>
      <p>This extension generates a table of contents for the current page based on header tags (h1-h6).</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
