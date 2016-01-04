import React from 'react';
import { Link } from 'react-router';
import {tcpXLN} from 'xln';
import {Button} from 'react-bootstrap';
import Smoothie from 'react-smoothie';
import FA from 'react-fontawesome';

class ChartLayout extends React.Component {
  render() {

    var controlSize = 300;
    var chartWidth = 1000;
    var chartHeight = 300;

    var wrapperStyle = {
      marginRight: controlSize,
      width: chartWidth,
    };

    var chartStyle = {
      float: 'left',
      width: chartWidth,
    };

    var controlStyle = {
      float: 'right',
      width: controlSize,
      marginRight: -controlSize,
    };

    var clear = {
      clear: 'both',
    }

    return (
      <div style={wrapperStyle}>
        <div style={chartStyle}><Smoothie ref={this.props.chartCallback.bind(this)} interpolation="step" width={chartWidth} height={chartHeight} /></div>
        <div style={controlStyle}>{this.props.children}</div>
        <div style={clear}></div>
      </div>
    );
  }

}

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
      outVoltage: null,
      outCurrent: null,
      limitVoltage: null,
      limitCurrent: null,
      output: 'N/A',
      outputSet: false,
      connectionError: null,
      connectionState: 'Initializing'
    }
    this.connection = null;
    this.updateNumber = 0;
    this.nextUpdate = false;
  }

 static propTypes = {
    host: React.PropTypes.string.isRequired
  }

  componentDidMount() {
    this.reconnect();
  }

  setupVoltageChart(chart) {
    if (!chart || this.voltageChart === chart) return;

    this.voltageChart = chart;

    this.voltageTimeSeries = chart.addTimeSeries(null, {strokeStyle: 'rgba(0, 255, 0, 1)', lineWidth: 2});
    this.vLimitTimeSeries  = chart.addTimeSeries(null, {strokeStyle: 'rgba(0, 255, 0, 0)', fillStyle: 'rgba(0, 255, 0, 0.5)', lineWidth: 0});
  }

  setupCurrentChart(chart) {
    if (!chart || this.currentChart === chart) return;

    this.currentChart = chart;

    this.currentTimeSeries = chart.addTimeSeries(null, {strokeStyle: 'rgba(255, 0, 0, 1)', lineWidth: 2});
    this.cLimitTimeSeries  = chart.addTimeSeries(null, {strokeStyle: 'rgba(255, 0, 0, 0)', fillStyle: 'rgba(0, 0, 255, 0.5)', lineWidth: 0});
  }

  setupPowerChart(chart) {
    if (!chart || this.powerChart === chart) return;

    this.powerChart = chart;

    this.powerTimeSeries   = chart.addTimeSeries(null, {strokeStyle: 'rgba(0, 0, 255, 1)', lineWidth: 2});
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

      this.updateSourceCurrent(() => {
        this.updateSourceVoltage(this.update.bind(this));
      });
    });

    this.connection.on('error', err => {
      this.setState({connectionState: 'Error'});
      this.setState({connectionError: err.toString()});
    });
  }

  /** handle the next check */
  update() {
    if (!this.state.connected) return;

    if (this.nextUpdate) return this.nextUpdate.bind(this)();

    if (this.updateNumber == 0) this.updateMeasuredCurrent(this.update.bind(this));
    else if (this.updateNumber == 1) this.updateMeasuredVoltage(this.update.bind(this));
    else if (this.updateNumber == 2) this.updateOutputState(this.update.bind(this));
    if (++this.updateNumber >= 3) this.updateNumber = 0;
  }

  updateMeasuredCurrent(cb) {
    var time = new Date().getTime();
    this.connection.getMeasuredCurrent(current => {
      this.updateStateIncrementMessages({measCurrent: current});
      this.currentTimeSeries.append(time, current);
      this.powerTimeSeries.append(time, current * this.state.measVoltage);
      cb();
    });
  }

  updateMeasuredVoltage(cb) {
    var time = new Date().getTime();
    this.connection.getMeasuredVoltage(voltage => {
      this.updateStateIncrementMessages({measVoltage: voltage});
      this.voltageTimeSeries.append(time, voltage);
      this.powerTimeSeries.append(time, voltage * this.state.measCurrent);
      cb();
    });
  }

  updateOutputState(cb) {
    var time = new Date().getTime();
    this.connection.getOutputState(state => {
      this.updateStateIncrementMessages({output: state});
      if (state == 'CV') {
        this.vLimitTimeSeries.append(time, this.state.measVoltage);
        this.cLimitTimeSeries.append(time, 0);
      } else if (state == 'CC') {
        this.vLimitTimeSeries.append(time, 0);
        this.cLimitTimeSeries.append(time, this.state.measCurrent);
      } else {
        var max = Math.max(this.state.measCurrent, this.state.measVoltage);
        this.vLimitTimeSeries.append(time, max);
        this.cLimitTimeSeries.append(time, max);
      }
      cb();
    });
  }

  updateSourceCurrent(cb) {
    this.connection.getSourceCurrent(current => {
      this.updateStateIncrementMessages({outCurrent: current});
      cb();
    });
  }

  updateSourceVoltage(cb) {
    this.connection.getSourceVoltage(voltage => {
      this.updateStateIncrementMessages({outVoltage: voltage});
      cb();
    });
  }

  updateOutputCurrentLimit(cb) {
    this.connection.getOutputCurrentLimit(current => {
      this.updateStateIncrementMessages({limitCurrent: current});
      cb();
    });
  }

  updateOutputVoltageLimit(cb) {
    this.connection.getOutputVoltageLimit(voltage => {
      this.updateStateIncrementMessages({limitVoltage: voltage});
      cb();
    });
  }

  updateStateIncrementMessages(state) {
    state.messages = this.state.messages + 1;
    this.setState(state);
  }

  toggleOutput() {
    var nxt = !(this.state.outputSet);
    this.connection.setOutput(nxt);
    this.setState({outputSet: nxt});
  }

  setSourceVoltage(voltage) {
    this.connection.setSourceVoltage(voltage);
  }

  setSourceCurrent(current) {
    this.connection.setSourceCurrent(current);
  }

  setOutputVoltageLimit(voltage) {
    this.connection.setOutputVoltageLimit(voltage);
  }

  setOutputCurrentLimit(current) {
    this.connection.setOutputCurrentLimit(current);
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
    if (!this.props.host) {
      return <div>'No host specified'</div>;
    }

    return (
      <div>
        <div>
          <div style={{float: 'right'}}><FA name='spinner' style={messagesSpin(this.state.messages)} /></div>
          <div>{this.props.host}</div>
          <div>{this.state.connected}</div>
          <div style={{clear: 'both'}}></div>
        </div>
        <ChartLayout chartCallback={this.setupVoltageChart}>
          <div>{this.state.setVoltage}</div>
          <div>{this.state.measVoltage}</div>
          <form onSubmit={e => {e.preventDefault(); setSourceVoltage(e.target[0].value);}}>
            <input defaultValue={this.state.outVoltage} />
          </form>
        </ChartLayout>
        <ChartLayout chartCallback={this.setupCurrentChart}>
          <div>{this.state.setCurrent}</div>
          <div>{this.state.measCurrent}</div>
          <form onSubmit={e => {e.preventDefault(); setSourceCurrent(e.target[0].value);}}>
            <input defaultValue={this.state.outCurrent} />
          </form>
        </ChartLayout>
        <ChartLayout chartCallback={this.setupPowerChart}>
          <Button active={this.state.outputSet} onClick={this.toggleOutput.bind(this)}>{this.state.output}</Button>
          <div>{this.state.measVoltage * this.state.measCurrent}</div>
        </ChartLayout>
      </div>
    );
  }

}

function messagesSpin(val) {
  val *= 4;
  val %= 360;
  return {
    // IE 9
    msTransform: 'rotate(' + val + 'deg)',
    // Chrome, Safari, Opera
    WebkitTransform: 'rotate(' + val + 'deg)',
    transform: 'rotate(' + val + 'deg)',
  }
}

export default XLN;
