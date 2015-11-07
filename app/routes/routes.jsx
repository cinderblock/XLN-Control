import React from 'react';
import { Route, IndexRoute } from 'react-router';
import AppContainer from '../containers/AppContainer';
import MainPageContainer from '../containers/MainPageContainer';
import AboutPageContainer from '../containers/AboutPageContainer';


export default (
  <Route path="/" component={AppContainer}>
    <IndexRoute component={MainPageContainer} />
    <Route component={AboutPageContainer} />
  </Route>
);
