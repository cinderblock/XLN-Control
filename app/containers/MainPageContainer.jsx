import React from 'react';
import { Link } from 'react-router';
import XLN from '../components/XLN';

export default class MainPageContainer extends React.Component {

  // static defaultProps = {
  //
  // }

  render() {
    return (
      <div>
        <XLN host="192.168.1.167" />
      </div>
    );
  }

}
