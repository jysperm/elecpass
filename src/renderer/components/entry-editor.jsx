import {ButtonGroup, Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, InputGroup} from 'react-bootstrap';
import {Glyphicon} from 'react-bootstrap'
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Promise from 'bluebird'

import EditorField from './editor-field'

export default class EntryEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editingEntry: {},
      savingEntry: false,
      addingFieldType: null,
      addingFieldName: ''
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

          {this.state.addingFieldType && <FormGroup>
            <ControlLabel>New field name</ControlLabel>
            <InputGroup>
              <FormControl autoFocus type='text' value={this.state.addingFieldName} onChange={this.onAddFieldChanged.bind(this)} />
              <InputGroup.Button>
                <Button bsStyle='success' onClick={this.onAddFieldFinished.bind(this)}>
                  <Glyphicon glyph='plus' />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>}

          <FormGroup>
            <DropdownButton dropup id='add-field' title='Add ...'>
              <MenuItem onClick={this.onAddField.bind(this, true)}>Encrypted Field</MenuItem>
              <MenuItem onClick={this.onAddField.bind(this, false)}>Unencrypted Field</MenuItem>
              <MenuItem onClick={this.onAddTOTPField.bind(this)}>TOTP Field</MenuItem>
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

  getEntrySnapshot() {
    return _.extend({}, this.props.entry, this.state.editingEntry, {
      metaInfo: _.omitBy(_.extend({}, this.props.entry.metaInfo, this.state.editingEntry.metaInfo), (value, name) => {
        return this.state.editingEntry.metaInfo && this.state.editingEntry.metaInfo[name] === null
      }),
      extraInfo: _.omitBy(_.extend({}, this.props.entry.extraInfo, this.state.editingEntry.extraInfo), (value, name) => {
        return this.state.editingEntry.extraInfo && this.state.editingEntry.extraInfo[name] === null
      })
    })
  }

  mapFields(type, callback) {
    return _.map(this.getEntrySnapshot()[type], callback)
  }

  onNameChanged(name) {
    this.setState({
      editingEntry: _.extend({}, this.state.editingEntry, {name})
    })
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

  onAddField(encrypted) {
    if (!this.state.addingFieldType) {
      this.setState({
        addingFieldType: encrypted ? 'extraInfo' : 'metaInfo',
        addingFieldName: ''
      })
    }
  }

  onAddFieldChanged({target}) {
    this.setState({
      addingFieldName: target.value
    })
  }

  onAddFieldFinished() {
    const {addingFieldType, addingFieldName} = this.state

    this.setState({
      addingFieldType: null,
      editingEntry: _.extend({}, this.state.editingEntry, {
        [addingFieldType]: _.extend({}, this.state.editingEntry[addingFieldType], {
          [addingFieldName]: ''
        })
      })
    })
  }

  onAddTOTPField() {
    if (!this.state.editingEntry.TOTP) {
      this.setState({
        editingEntry: _.extend({}, this.state.editingEntry, {
          extraInfo: _.extend({}, this.state.editingEntry.extraInfo, {
            TOTP: ''
          })
        })
      });
    }
  }

  onSaveClicked() {
    this.setState({savingEntry: true});

    Promise.try( () => {
      if (this.props.entry.name && this.state.editingEntry.name) {
        return this.props.onEntryRenamed(this.props.entry.name, this.getEntrySnapshot())
      } else {
        return this.props.onEntrySaved(this.getEntrySnapshot())
      }
    }).then( () => {
      this.setState({
        savingEntry: false,
        editingEntry: {}
      });
    }).catch(alert)
  }
}

EntryEditor.propTyeps = {
  entry: PropTypes.shape({
    name: PropTypes.string.isRequired,
    password: PropTypes.string,
    metaInfo: PropTypes.object,
    extraInfo: PropTypes.object
  }),

  onEntrySaved: PropTypes.func.isRequired,
  onEntryRenamed: PropTypes.func.isRequired
}
