import path from 'path';

import _ from 'lodash';
import {ButtonGroup, Button} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import {Grid, Row, Col} from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import React, {Component} from 'react';

import PassStore from '../pass-store';

export default class ElecpassView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: [],
      currentEntry: null
    };

    this.passStore = new PassStore();

    this.passStore.loadEntries().then( entries => {
      this.setState({entries});
    });
  }

  render() {
    return <Grid fluid={true}>
      <Row className='window-header'>
        <ButtonGroup>
          <Button bsStyle='success'>Insert</Button>
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
              <FormControl.Static>{this.state.currentEntry.name}</FormControl.Static>
            </FormGroup>

            {_.map(this.state.currentEntry.metaInfo, (value, key) => {
              return <FormGroup key={key}>
                <ControlLabel>{key}</ControlLabel>
                <FormControl type='text' value={value}/>
              </FormGroup>
            })}

            {this.state.currentEntry.password && <FormGroup>
              <ControlLabel>Password 🔓</ControlLabel>
              <FormControl type='text' value={this.state.currentEntry.password}/>
            </FormGroup>}

            {_.map(this.state.currentEntry.extraInfo, (value, key) => {
              return <FormGroup key={key}>
                <ControlLabel>{key} 🔓</ControlLabel>
                <FormControl type='text' value={value}/>
              </FormGroup>
            })}

            <Button>Save</Button>
          </Form>}
        </Col>
      </Row>
    </Grid>;
  }

  onEntrySelected(entry) {
    this.setState({currentEntry: entry});

    this.passStore.decryptEntry(entry).then( decrypted => {
      this.setState({currentEntry: _.extend(decrypted, entry)});
    });
  }
}
