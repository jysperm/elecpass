import path from 'path';

import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {ButtonGroup, Button} from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

import PassStore from '../pass-store';

export default class ElecpassView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: []
    };

    this.passStore = new PassStore();

    this.passStore.loadEntries().then( entries => {
      this.setState({entries});
    });
  }

  render() {
    return <Grid>
      <Row>
        <ButtonGroup>
          <Button bsStyle='success'>Insert</Button>
        </ButtonGroup>
      </Row>
      <Row>
        <Col md={6}>
          <ListGroup>
            {this.state.entries.map( entry => {
              return <ListGroupItem>{entry}</ListGroupItem>;
            })}
          </ListGroup>
        </Col>
        <Col md={6}></Col>
      </Row>
    </Grid>;
  }
}
