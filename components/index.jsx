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
      <Row>
        <ButtonGroup>
          <Button bsStyle='success'>Insert</Button>
        </ButtonGroup>
      </Row>
      <Row>
        <Col md={6} xs={6}>
          <ListGroup>
            {this.state.entries.map( entry => {
              return <ListGroupItem key={entry.id} onClick={this.onEntrySelected.bind(this, entry)}>
                {entryName(entry)}
              </ListGroupItem>;
            })}
          </ListGroup>
        </Col>
        <Col md={6} xs={6}>
          <Form horizontal>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4}>
                Email
              </Col>
              <Col sm={8}>
                <FormControl type="email" placeholder="Email" />
              </Col>
            </FormGroup>
            <FormGroup controlId="formHorizontalPassword">
              <Col componentClass={ControlLabel} sm={4}>
                Password
              </Col>
              <Col sm={8}>
                <FormControl type="password" placeholder="Password" />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={4} sm={8}>
                <Button type="submit">Save</Button>
              </Col>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </Grid>;
  }

  onEntrySelected(entry) {
    this.setState({currentEntry: entry});
  }
}

function entryName(entry) {
  return entry.relativePath.endsWith('.gpg') ? entry.relativePath.slice(0, -'.gpg'.length) : entry.relativePath;
}
