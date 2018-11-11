import {clipboard} from 'electron';

import {FormGroup, ControlLabel, InputGroup, FormControl, Button, Glyphicon} from 'react-bootstrap'
import PropTypes from 'prop-types'
import React, {Component} from 'react'

import {generatePassword} from '../../common/utils'
import TOTPTokenButton from './totp-token'

export default class EditorField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false,
      editingValue: null
    }
  }

  render() {
    const currentValue = this.state.editingValue || this.props.value;

    if (this.state.editing) {
      return <FormGroup>
        <ControlLabel>{this.props.name} {this.props.secret ? '🔓' : ''}</ControlLabel>
        <InputGroup>
          <FormControl autoFocus type='text' value={currentValue} onChange={this.onValueChanged.bind(this)} />
          <InputGroup.Button>
            <Button onClick={this.onRandomPasswordClicked.bind(this)}>
              <Glyphicon glyph='random' />
            </Button>
            <Button bsStyle='success' onClick={this.onEditFinished.bind(this)}>
              <Glyphicon glyph='floppy-saved' />
            </Button>
            {this.props.removable && <Button bsStyle='danger' onClick={this.onRemoved.bind(this)}>
              <Glyphicon glyph='remove' />
            </Button>}
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    } else {
      return <FormGroup>
        <ControlLabel>{this.props.name} {this.props.secret ? '🔓' : ''}</ControlLabel>
        <InputGroup>
          {this.props.totp && <InputGroup.Button>
            <TOTPTokenButton secret={currentValue} />
          </InputGroup.Button>}
          <FormControl readOnly={true} type='text' value={currentValue} />
          <InputGroup.Button>
            <Button onClick={onCopyToClipboard.bind(null, currentValue)}>
              <Glyphicon glyph='copy' />
            </Button>
            <Button onClick={this.onEdit.bind(this)}>
              <Glyphicon glyph='edit' />
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    }
  }

  onEdit() {
    this.setState({
      editing: true
    })
  }

  onRandomPasswordClicked() {
    this.setState({
      editingValue: generatePassword()
    })
  }

  onValueChanged({target}) {
    this.setState({
      editingValue: target.value
    });
  }

  onEditFinished() {
    this.props.onEdited(this.state.editingValue || this.props.value)

    this.setState({
      editing: false
    })
  }

  onRemoved() {
    this.props.onRemoved({
      name: this.props.name
    })
  }
}

EditorField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,

  removable: PropTypes.bool,
  secret: PropTypes.bool,
  totp: PropTypes.bool,

  onEdited: PropTypes.func.isRequired,
  onRemoved: PropTypes.func
}

function onCopyToClipboard(text) {
  clipboard.writeText(text)
}
