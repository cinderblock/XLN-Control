import React from 'react';
import FA from 'react-fontawesome';

export default class ActivitySpinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      i: 0,
    };
  }

  static propTypes = {
    scale: React.PropTypes.number,
  };

  static defaultProps = {
    scale: 4,
  };

  ping() {
    this.setState({i: this.state.i + 1});
  }

  render() {
    var val = this.state.i;

    val *= this.props.scale;
    val %= 360;
    var style = {
      // IE 9
      msTransform: 'rotate(' + val + 'deg)',
      // Chrome, Safari, Opera
      WebkitTransform: 'rotate(' + val + 'deg)',
      transform: 'rotate(' + val + 'deg)',
    }

    return <FA name='spinner' style={style} />;
  }
}
