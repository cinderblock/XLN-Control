import React from 'react';
import { Link } from 'react-router';
import {tcpXLN} from 'xln';

export default class XLN extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Number of messages seen since start of connection
      messages: 0,
      connectedSince: false,
      setVoltage: null,
      setCurrent: null,
      measVoltage: null,
      measCurrent: null,
      output: null
    }
    this.connection = null;
  }

  // static defaultProps = {
  //   host: null
  // }

  componentWillMount() {
    this.connection = new tcpXLN({host:this.props.host},null);
    let probe = setInterval(() => {

      this.connection.getMeasuredCurrent(current => {
        this.connection.getMeasuredVoltage(voltage => {
          this.connection.getOutputState(state => {
            this.connection.getOutput(enabled => {
              this.updateState({
                measCurrent: current,
                measVoltage: voltage,
                output: enabled + ' (' + state + ')'
              })
            })
          })
        })
      })


    }, 200);

    // this.connection.on('close', () => {
    //   clearInterval(probe);
    // })
  }

  updateState(state) {
    state.messages = this.state.messages + 1;
    this.setState(state);
  }

  render() {
    return (
      <div>
        <div>{this.props.host || 'No host specified'}</div>
        <div>{this.state.setVoltage}</div>
        <div>{this.state.setCurrent}</div>
        <div>{this.state.measVoltage}</div>
        <div>{this.state.measCurrent}</div>
        <div>{this.state.output}</div>
        <div>{this.state.messages}</div>
        <div>{this.state.connectedSince}</div>
      </div>
    );
  }

}
