import React from 'react';
import {Button} from 'react-bootstrap';

export default class Logger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFile: false,
      selectedFolder: false,
      messages: 0,
    }
  }

  static propTypes = {
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
  }

  stopLogging() {
    if (!this.openFile)
      return;

    this.openFile.close();
  }

  append(data) {
    this.setState({messages: this.state.messages + 1});

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
      loggingState = 'Logging to file:' + this.state.currentFile;
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
