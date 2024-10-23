import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
    console.log("Hello, World!");
    return <h1>Hello, World!</h1>;
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
