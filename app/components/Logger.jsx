import React from 'react';
import {Button} from 'react-bootstrap';
import ActivitySpinner from './ActivitySpinner.jsx';

export default class Logger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFile: false,
      selectedFolder: false,
    }
  }

  static propTypes = {
    transformer: React.PropTypes.func.isRequired,
  };

  DisplayOpenFolderOrFile() {
    // Open system dialog

    // Check if folder or file selected
    var file = false;
    var selectedFolder = false;

    // If file
    if (file) {
      this.setState({selectedFolder: flase});
      this.logToFile(file);
      return;
    }

    // Set folder mode
    this.setState({selectedFolder});
  }

  DisplaySelectFile() {
    // Open system dialog
    var file = false;

    this.logToFile(file);
  }

  logToFile(file) {
    this.setState({currentFile: file});
    this.stopLogging();

    // Open file for writing
    this.openFile = true; //FS.open(...)

    // Write header
  }

  stopLogging() {
    if (!this.openFile)
      return;

    this.openFile.close();
  }

  append(data) {
    this.refs.loggerActivity.ping();

    if (!this.openFile)
      return;

  }

  render() {
    var folderUI = null;
    if (this.state.selectedFolder) {
      folderUI = <div>
        Selected Folder: {this.state.selectedFolder}
        <input type="text" defaultValue="prefix" />-<input type="text" defaultValue="postfix" />
        <Button>New File</Button>
      </div>;
    }

    var loggingState = null;
    if (this.state.currentFile) {
      loggingState = 'Logging to file:' + this.state.currentFile + <ActivitySpinner ref='loggerActivity'/>;
    } else {
      loggingState = 'Not logging';
    }

    return <div>
      <Button onClick={this.DisplayOpenFolderOrFile.bind(this)}>Open File/Folder</Button>
      <Button onClick={this.DisplaySelectFile.bind(this)}>Save to File</Button>
      {folderUI}
      <div>{loggingState}</div>
    </div>;
  }
}
