import {ButtonGroup, Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, InputGroup} from 'react-bootstrap';
import {Glyphicon} from 'react-bootstrap'
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import EditorField from './editor-field'

export default class EntryEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editingEntry: {},
      savingEntry: false
    }
  }

  render() {
    const entry = this.props.entry
    const editingEntry = this.state.editingEntry

    if (entry) {
      return <div className='expand scroller'>
        <Form>
          <EditorField key={`${entry.name}name`} name='Entry Name' value={editingEntry.name || entry.name}
            onEdited={this.onNameChanged.bind(this)} />

          <EditorField key={`${entry.name}password`} name='Password' value={editingEntry.password || entry.password}
            secret={true}  onEdited={this.onPasswordChanged.bind(this)} />

          {this.mapFields('metaInfo', (value, name) => {
            return <EditorField key={`${entry.name}metaInfo${name}`} name={name} value={value}
              removable={true} onEdited={this.onFieldEdited.bind(this, 'metaInfo', name)}
              onRemoved={this.onFieldEdited.bind(this, 'metaInfo', name, null)} />
          })}

          {this.mapFields('extraInfo', (value, name) => {
            return <EditorField key={`${entry.name}extraInfo${name}`} name={name} value={value}
              secret={true} totp={name === 'TOTP'} onEdited={this.onFieldEdited.bind(this, 'extraInfo', name)}
              removable={true} onRemoved={this.onFieldEdited.bind(this, 'extraInfo', name, null)} />
          })}

          <FormGroup>
            <DropdownButton dropup id='add-field' title='Add ...'>
              <MenuItem onClick={this.onAddFieldClicked.bind(this, true)}>Encrypted Field</MenuItem>
              <MenuItem onClick={this.onAddFieldClicked.bind(this, false)}>Unencrypted Field</MenuItem>
              <MenuItem onClick={this.onAddTOTPFieldClicked.bind(this)}>TOTP Field</MenuItem>
            </DropdownButton>
          </FormGroup>
          <FormGroup>
            <Button bsStyle={_.isEmpty(this.state.editingEntry) ? 'default' : 'primary'}
              disabled={this.state.savingEntry} onClick={this.onSaveClicked.bind(this)}>Save</Button>
          </FormGroup>
        </Form>
      </div>
    } else {
      return null;
    }
  }

  mapFields(type, callback) {
    return _.map(_.omitBy(_.extend({}, this.props.entry[type], this.state.editingEntry[type]), (value, name) => {
      return this.state.editingEntry[type] && this.state.editingEntry[type][name] === null
    }), callback)
  }

  onNameChanged() {

  }

  onPasswordChanged(value) {
    this.setState({
      editingEntry: _.extend({}, this.state.editingEntry, {
        password: value
      })
    })
  }

  onFieldEdited(type, name, value) {
    this.setState({
      editingEntry: _.extend({}, this.state.editingEntry, {
        [type]: _.extend({}, this.state.editingEntry[type], {
          [name]: value
        })
      })
    })
  }

  onAddFieldClicked(encrypted) {
    if (this.state.newFieldName) {
      const field = encrypted ? 'extraInfo' : 'metaInfo';

      this.setState({
        newFieldName: '',
        editingEntry: _.extend(this.state.editingEntry, {
          [field]: _.extend(this.state.editingEntry[field], {
            [this.state.newFieldName]: ''
          })
        })
      });
    }
  }

  onAddTOTPFieldClicked() {
    if (!this.state.editingEntry.TOTP) {
      this.setState({
        editingEntry: _.extend(this.state.editingEntry, {
          extraInfo: _.extend(this.state.editingEntry.extraInfo, {
            TOTP: ''
          })
        })
      });
    }
  }

  onSaveClicked() {
    this.setState({savingEntry: true});

    this.passStore.encryptAndWriteEntry(this.state.entry).then( () => {
      this.setState({
        savingEntry: false,
        creating: false,
        editingEntry: {}
      });
    }).catch(alert);
  }
}

EntryEditor.propTyeps = {
  entry: PropTypes.shape({
    name: PropTypes.string.isRequired,
    password: PropTypes.string,
    metaInfo: PropTypes.object,
    extraInfo: PropTypes.object
  })
}
