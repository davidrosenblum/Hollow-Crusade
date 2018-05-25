import React from 'react';
import ReactDOM from 'react-dom';
import App from './component/App.jsx';
import Client from './module/Client';

window.addEventListener("load", evt => {
    ReactDOM.render(<App/>, document.querySelector("#app-root"));
    
    Client.connect();
});