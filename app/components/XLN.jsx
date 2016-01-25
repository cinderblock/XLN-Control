import React from 'react';
import { Link } from 'react-router';
import {tcpXLN} from 'xln';
import {Button} from 'react-bootstrap';
import Smoothie from 'react-smoothie';
import FA from 'react-fontawesome';
import Logger from './Logger.jsx';
import ActivitySpinner from './ActivitySpinner.jsx';

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
        <div style={chartStyle}><Smoothie ref={this.props.chartCallback} minValue={0} interpolation='step' width={chartWidth} height={chartHeight} /></div>
        <div style={controlStyle}>{this.props.children}</div>
        <div style={clear}></div>
      </div>
    );
  }

}

function LoggerDataTransformer(data) {
  const empty = '';
  return [
    data.time || empty,
    data.voltage || empty,
    data.current || empty,
    data.power || empty,
  ];
}
LoggerDataTransformer.header = LoggerDataTransformer({
  time: 'Time (ms)',
  voltage: 'Voltage (V)',
  current: 'Current (A)',
  power: 'Power (W)',
});

class XLN extends React.Component {

  constructor(props) {
    super(props);
    if (props.host) {
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
    } else {
      // Dev mode
      this.state = {
        // Number of messages seen since start of connection
        messages: 0,
        connected: true,
        setVoltage: 'setV',
        setCurrent: 'setC',
        measVoltage: 'measV',
        measCurrent: 'measC',
        outVoltage: 'outV',
        outCurrent: 'outC',
        limitVoltage: 'limitV',
        limitCurrent: 'limitC',
        output: 'N/A',
        outputSet: false,
        connectionError: null,
        connectionState: 'Initializing'
      }
    }
    this.connection = null;
    this.updateNumber = 0;
    this.nextUpdate = false;
  }

 static propTypes = {
    host: React.PropTypes.string,
  };

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
    // Disconnected mode
    if (!this.props.host) {
      this.setState({connectionState: 'Disconnected'});
      return;
    }

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
      var power = current * this.state.measVoltage;
      this.updateStateIncrementMessages({measCurrent: current});
      this.currentTimeSeries.append(time, current);
      this.powerTimeSeries.append(time, power);
      this.refs.logger.append({time, current, power});
      cb();
    });
  }

  updateMeasuredVoltage(cb) {
    var time = new Date().getTime();
    this.connection.getMeasuredVoltage(voltage => {
      var power = voltage * this.state.measCurrent;
      this.updateStateIncrementMessages({measVoltage: voltage});
      this.voltageTimeSeries.append(time, voltage);
      this.powerTimeSeries.append(time, power);
      this.refs.logger.append({time, voltage, power});
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
    this.refs.connectionActivity.ping();
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

    return (
      <div>
        <div>
          <div style={{float: 'right'}}><ActivitySpinner ref='connectionActivity'/></div>
          <div>{this.props.host}</div>
          <div>{this.state.connected}</div>
          <div style={{clear: 'both'}}></div>
        </div>
        <ChartLayout chartCallback={this.setupVoltageChart.bind(this)}>
          <h3>Voltage</h3>
          <div>{this.state.setVoltage} Volts</div>
          <div>{this.state.measVoltage} Volts</div>
          <h4>Set new voltage limit</h4>
          <form onSubmit={e => {e.preventDefault(); this.setSourceVoltage(e.target[0].value);}}>
            <input defaultValue={this.state.outVoltage} />
          </form>
        </ChartLayout>
        <ChartLayout chartCallback={this.setupCurrentChart.bind(this)}>
          <h3>Current</h3>
          <div>{this.state.setCurrent} Amps</div>
          <div>{this.state.measCurrent} Amps</div>
          <h4>Set new current limit</h4>
          <form onSubmit={e => {e.preventDefault(); this.setSourceCurrent(e.target[0].value);}}>
            <input defaultValue={this.state.outCurrent} />
          </form>
        </ChartLayout>
        <ChartLayout chartCallback={this.setupPowerChart.bind(this)}>
          <h3>Power</h3>
          <div>{(this.state.measVoltage * this.state.measCurrent).toFixed(3)} Watts</div>
          <h3>Output Control</h3>
          <Button active={this.state.outputSet} onClick={this.toggleOutput.bind(this)} block bsSize="large" bsStyle="primary">{this.state.output}</Button>
        </ChartLayout>
        <h3>Logging Control</h3>
        <Logger ref='logger' transformer={LoggerDataTransformer} />
      </div>
    );
  }

}

export default XLN;
