import React from 'react';
import { Link } from 'react-router';
import {tcpXLN} from 'xln';
import {Button} from 'react-bootstrap';

class XLN extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Number of messages seen since start of connection
      messages: 0,
      connected: false,
      setVoltage: null,
      setCurrent: null,
      measVoltage: null,
      measCurrent: null,
      output: 'N/A',
      outputSet: false,
      connectionError: null,
      connectionState: 'Initializing'
    }
    this.connection = null;
    this.updateNumber = 0;
  }

 static propTypes = {
    host: React.PropTypes.string.isRequired
  }

  componentWillMount() {
    this.reconnect();
  }

  componentWillUnmount() {
    this.connection.end();
  }

  reconnect() {
    this.setState({connectionState: 'Connecting'});

    this.connection = new tcpXLN({host:this.props.host}, () => {

      this.setState({connected: true});

      this.connection.on('close', () => {
        this.setState({connected: false});
        this.setState({connectionState: 'Disconnected'});
      });

      this.update();
    });

    this.connection.on('error', err => {
      this.setState({connectionState: 'Error'});
      this.setState({connectionError: err.toString()});
    });
  }

  /** handle the next check */
  update() {
    if (!this.state.connected) return;

    if (this.updateNumber == 0) this.updateMeasuredCurrent(this.update.bind(this));
    else if (this.updateNumber == 1) this.updateMeasuredVoltage(this.update.bind(this));
    else if (this.updateNumber == 2) this.updateOutputState(this.update.bind(this));
    if (++this.updateNumber >= 3) this.updateNumber = 0;
  }

  updateMeasuredCurrent(cb) {
    this.connection.getMeasuredCurrent(current => {
      this.updateState({measCurrent: current})
      cb();
    });
  }

  updateMeasuredVoltage(cb) {
    this.connection.getMeasuredVoltage(voltage => {
      this.updateState({measVoltage: voltage})
      cb();
    });
  }

  updateOutputState(cb) {
    this.connection.getOutputState(state => {
      this.updateState({output: state})
      cb();
    });
  }

  updateState(state) {
    state.messages = this.state.messages + 1;
    this.setState(state);
  }

  toggleOutput() {

    var nxt = !(this.state.outputSet);

    this.connection.setOutput(nxt);

    this.setState({outputSet: nxt});

  }

  render() {
    if (!this.state.connected) {
      return (
        <div>
         <div>{this.state.connectionState}</div>
         <div>{this.state.connectionError}</div>
        </div>
      );
    }
    return (
      <div>
        <div>{this.props.host || 'No host specified'}</div>
        <div>{this.state.setVoltage}</div>
        <div>{this.state.setCurrent}</div>
        <div>{this.state.measVoltage}</div>
        <div>{this.state.measCurrent}</div>
        <div><Button active={this.state.outputSet} onClick={this.toggleOutput.bind(this)}>{this.state.output}</Button></div>
        <div>{this.state.messages}</div>
        <div>{this.state.connected}</div>
      </div>
    );
  }

}

export default XLN;
