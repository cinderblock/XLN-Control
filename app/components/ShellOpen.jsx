import React from 'react';
import {remote} from 'electron';
const shell = remote.require('shell');

export default class ShellOpen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    function openFolder() {
      if (!this.props.target) return;
      shell.openItem(this.props.target);
    }

    return <div><a onClick={openFolder.bind(this)}>{this.props.target || 'No target selected'}</a></div>;
  }
}
