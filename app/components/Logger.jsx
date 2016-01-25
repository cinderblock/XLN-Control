import React from 'react';
import {Button} from 'react-bootstrap';
import ActivitySpinner from './ActivitySpinner.jsx';
import {remote} from 'electron';
import ShellOpen from './ShellOpen.jsx';
const dialog = remote.require('dialog');
import strftime from 'strftime';
import path from 'path';
import csv from 'fast-csv';
import fs from 'fs';

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
      this.fileNumber = 0;
    });
  }

  NewLogFileInCurrentFolder() {
    if (!this.state.selectedFolder) return;

    // Start with the selected folder
    var filename = this.state.selectedFolder;

    // Add platform specific path separator
    filename += path.sep;

    // Append filename
    filename += strftime(this.refs.filename.value.trim().replace(/\*/, this.fileNumber));

    // Force file extension
    filename += '.csv';

    this.logToFile(filename);

    this.fileNumber++;
  }

  DisplaySelectFile() {
    // Open system dialog
    dialog.showSaveDialog({filters: [
      { name: 'CSV (Comma Separated Values)', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] },
    ]}, file => {
      // User canceled
      if (!file) return;

      this.setState({selectedFolder: false});
      this.logToFile(file);
    });
  }

  logToFile(file) {
    this.stopLogging();
    this.setState({currentFile: file});

    // Open file for writing
    this.csvStream = csv.createWriteStream({headers: true});
    this.csvStream.pipe(fs.createWriteStream(file));

    // Write header
    this.csvStream.write(this.props.transformer.header);
  }

  stopLogging() {
    if (!this.csvStream)
      return;

    this.csvStream.end();
    this.csvStream = undefined;
    this.setState({currentFile: false});
  }

  append(data) {
    this.refs.loggerActivity.ping();

    if (!this.csvStream)
      return;

    // Format data to array with formatter
    data = this.props.transformer(data);

    // Write array to csv file
    this.csvStream.write(data);
  }

  render() {
    var folderUI = null;
    if (this.state.selectedFolder) {
      folderUI = <div>
        Selected Folder: <ShellOpen target={this.state.selectedFolder} />
      <input ref="filename" type="text" defaultValue="log %F %H.%M.%S #*" />
        <Button onClick={this.NewLogFileInCurrentFolder.bind(this)}>New File</Button>
      </div>;
    }

    var loggingState = null;
    if (this.state.currentFile) {
      loggingState = <div><ActivitySpinner ref='loggerActivity'/>Logging to file: <ShellOpen target={this.state.currentFile} /></div>;
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
