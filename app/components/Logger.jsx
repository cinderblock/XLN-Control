import React from 'react';
import {Button} from 'react-bootstrap';
import ActivitySpinner from './ActivitySpinner.jsx';
import {remote} from 'electron';
import ShellOpen from './ShellOpen.jsx';
const dialog = remote.require('dialog');
import strftime from 'strftime';
import path from 'path';

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

  DisplayOpenFolder() {
    // Open system dialog
    dialog.showOpenDialog({properties: ['openDirectory']}, directory => {
      // User canceled
      if (!directory) return;

      // No dir selected
      if (!directory[0]) return;

      // Set folder mode
      this.setState({selectedFolder: directory[0]});
    });
  }

  NewLogFileInCurrentFolder() {
    if (!this.state.selectedFolder) return;

    var filename = '';

    filename += this.state.selectedFolder;

    filename += path.sep;

    filename += strftime(this.refs.filename.value);


    this.logToFile(filename);
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
        Selected Folder: <ShellOpen folder={this.state.selectedFolder} />
        <input ref="filename" type="text" defaultValue="log-%F-%H-%M-%S.csv" />
        <Button onClick={this.NewLogFileInCurrentFolder.bind(this)}>New File</Button>
      </div>;
    }

    var loggingState = null;
    if (this.state.currentFile) {
      loggingState = <div><ActivitySpinner ref='loggerActivity'/>Logging to file: {this.state.currentFile}</div>;
    } else {
      loggingState = 'Not logging';
    }

    return <div>
      <Button onClick={this.DisplayOpenFolder.bind(this)}>Open Folder</Button>
      <Button onClick={this.DisplaySelectFile.bind(this)}>Save to File</Button>
      {folderUI}
      <div>{loggingState}</div>
      <Button onClick={this.stopLogging.bind(this)}>Stop Logging</Button>
    </div>;
  }
}
