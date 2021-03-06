import React from 'react';
import ReactDOM from 'react-dom';
import routes from './routes/routes';
import {Router} from 'react-router';
import debug from './utils/debug';
// import jQuery from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'font-awesome/css/font-awesome.css';
import './app.css';


window.location.hash = '/';

ReactDOM.render(<Router location={Router.HashLocation}>{routes}</Router>, document.getElementById('react-root'));
