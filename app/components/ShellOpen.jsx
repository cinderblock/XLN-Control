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
      if (!this.props.folder) return;
      shell.openItem(this.props.folder);
    }

    return <div><a onClick={openFolder.bind(this)}>{this.props.folder || 'No folder selected'}</a></div>;
  }
}
