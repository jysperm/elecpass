import path from 'path';

import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {ButtonGroup, Button} from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

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
              return <ListGroupItem key={entry.id} onClick={this.onEntrySelected.bind(this, entry)}>
                {entryName(entry)}
              </ListGroupItem>;
            })}
          </ListGroup>
        </Col>
        <Col xs={6}>
          <Form horizontal>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={4}>
                Email
              </Col>
              <Col xs={8}>
                <FormControl type='email' placeholder='Email' />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={4}>
                Password
              </Col>
              <Col xs={8}>
                <FormControl type='password' placeholder='Password' />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col xsOffset={4} xs={8}>
                <Button>Save</Button>
              </Col>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </Grid>;
  }

  onEntrySelected(entry) {
    this.setState({currentEntry: entry});
    this.passStore.decryptEntry(entry);
  }
}

function entryName(entry) {
  return entry.relativePath.endsWith('.gpg') ? entry.relativePath.slice(0, -'.gpg'.length) : entry.relativePath;
}
