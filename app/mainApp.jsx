import React from 'react';
import ReactDOM from 'react-dom';
import routes from './routes/routes';
import {Router} from 'react-router';
import debug from './utils/debug';
import './app.css';


window.location.hash = '/';

ReactDOM.render(<Router location={Router.HashLocation}>{routes}</Router>, document.getElementById('react-root'));
