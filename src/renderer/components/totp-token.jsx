import {clipboard} from 'electron';

import {Button} from 'react-bootstrap';
import React, {Component} from 'react';

import {generateTOTPToken} from '../../common/utils';

export default class TOTPTokenButton extends Component {
  componentDidMount() {
    this.setState({
      intervalId: setInterval( () => {
        this.forceUpdate()
      }, 1000)
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  render() {
    const token = generateTOTPToken(this.props.secret);

    return <Button onClick={this.onCopyToClipboard.bind(this, token)}>
      {token}
    </Button>;
  }

  onCopyToClipboard(text) {
    clipboard.writeText(text);
  }
}
