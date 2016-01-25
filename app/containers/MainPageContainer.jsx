import React from 'react';
import { Link } from 'react-router';
import XLN from '../components/XLN';
import config from 'config';

export default class MainPageContainer extends React.Component {

  // static defaultProps = {
  //
  // }

  render() {
    return (
      <div>
        <XLN host={config.get('host')} />
      </div>
    );
  }

}
