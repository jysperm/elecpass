import React, {Component} from 'react';
import {Modal, Form, FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';

export default class InputModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
      confirming: false
    };
  }

  render() {
    return <Modal show={true} onHide={this.props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.children}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormGroup>
            <ControlLabel>{this.props.field}</ControlLabel>
            <FormControl type='text' value={this.state.value} onChange={({target: {value}}) => this.setState({value})}/>
          </FormGroup>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='primary' onClick={this.onConfirm.bind(this)} disabled={this.state.confirming}>Confirm</Button>
      </Modal.Footer>
    </Modal>;
  }

  onConfirm() {
    this.setState({confirming: true})
    this.props.onConfirm(this.state.value);
  }
}
