import path from 'path';

import _ from 'lodash';
import {ButtonGroup, Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, InputGroup} from 'react-bootstrap';
import {Grid, Row, Col} from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import React, {Component} from 'react';

import PassStore from '../pass-store';

export default class ElecpassView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creating: false,
      currentEntry: null,
      editingEntry: {},
      entries: [],
      newFieldName: ''
    };

    this.passStore = new PassStore();

    this.passStore.loadEntries().then( entries => {
      this.setState({entries});
    });
  }

  render() {
    return <Grid fluid={true}>
      <Row className='window-header'>
        <ButtonGroup className='pull-left'>
          <Button bsStyle='success' onClick={this.onInsertEntry.bind(this)}>Insert</Button>
          <Button bsStyle='info'>Pull</Button>
          <Button bsStyle='info'>Push</Button>
        </ButtonGroup>
        <ButtonGroup className='pull-right'>
          <Button bsStyle='danger'>Remove</Button>
        </ButtonGroup>
      </Row>
      <Row className='window-body'>
        <Col xs={6}>
          <ListGroup>
            {this.state.entries.map( entry => {
              return <ListGroupItem key={entry.realpath} onClick={this.onEntrySelected.bind(this, entry)}>
                {entry.name}
              </ListGroupItem>;
            })}
          </ListGroup>
        </Col>
        <Col xs={6}>
          {this.state.currentEntry && <Form>
            <FormGroup>
              <ControlLabel>Entry Name</ControlLabel>
              <FormControl type='text' {...this.linkField('name')}/>
            </FormGroup>

            {this.mapFields('metaInfo', (value, key) => {
              return <FormGroup key={key}>
                <ControlLabel>{key}</ControlLabel>
                <FormControl type='text' {...this.linkField(`metaInfo.${key}`)}/>
              </FormGroup>
            })}

            <FormGroup>
              <ControlLabel>Password 🔓</ControlLabel>
              <FormControl type='text' {...this.linkField('password')}/>
            </FormGroup>

            {this.mapFields('extraInfo', (value, key) => {
              return <FormGroup key={key}>
                <ControlLabel>{key} 🔓</ControlLabel>
                <FormControl type='text' {...this.linkField(`extraInfo.${key}`)}/>
              </FormGroup>
            })}

            <FormGroup>
              <InputGroup>
                <DropdownButton id='add-field' componentClass={InputGroup.Button} title='Add ...'>
                  <MenuItem onClick={this.onAddFieldClicked.bind(this, true)}>Encrypted Field</MenuItem>
                  <MenuItem onClick={this.onAddFieldClicked.bind(this, false)}>Unencrypted Field</MenuItem>
                </DropdownButton>
                <FormControl type='text' value={this.state.newFieldName} placeholder='Some feild name'
                  onChange={({target: {value}}) => this.setState({newFieldName: value})} />
              </InputGroup>
            </FormGroup>

            <ButtonGroup>
              <Button bsStyle={_.isEmpty(this.state.editingEntry) ? 'default' : 'primary'}
                onClick={this.onSaveClicked.bind(this)}>Save</Button>
            </ButtonGroup>
          </Form>}
        </Col>
      </Row>
    </Grid>;
  }

  linkField(field) {
    return {
      value: _.get(this.state.editingEntry, field) || _.get(this.state.currentEntry, field) || '',
      onChange: ({target}) => {
        this.setState(_.set(this.state.editingEntry, field, target.value));
      }
    };
  }

  mapFields(type, fn) {
    return _.map(_.extend({}, this.state.currentEntry[type], this.state.editingEntry[type]), fn);
  }

  onInsertEntry() {
    this.setState({
      creating: true,
      currentEntry: {},
      editingEntry: {}
    });
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

  onSaveClicked() {
    this.passStore.encryptAndWriteEntry(_.extend({}, this.state.currentEntry, this.state.editingEntry));
  }

  onEntrySelected(entry) {
    this.setState({currentEntry: entry});

    this.passStore.decryptEntry(entry).then( decrypted => {
      this.setState({
        creating: false,
        currentEntry: _.extend(decrypted, entry),
        editingEntry: {}
      });
    });
  }
}
