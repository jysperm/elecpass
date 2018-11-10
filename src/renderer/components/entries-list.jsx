import React, {Component} from 'react';
import {FormControl, ListGroup, ListGroupItem} from 'react-bootstrap';

export default class EntriesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterByString: ''
    };
  }

  render() {
    const entries = _.sortBy(this.props.entries, 'name').filter( entry => {
      return _.includes(entry.lowerCase, this.state.filterByString.toLowerCase())
    })

    return <div className='column-container expand'>
      <div className='shrink'>
        <FormControl
          type='text'
          value={this.state.filterByString}
          placeholder='Filter entries'
          onChange={({target: {value}}) => this.setState({filterByString: value})}
        />
      </div>
      <div className='expand scroller'>
        <ListGroup>
          {entries.map( entry => {
            return <ListGroupItem key={entry.name} onClick={this.props.onEntrySelected.bind(this, entry)}>
              {entry.name}
            </ListGroupItem>;
          })}
        </ListGroup>
      </div>
    </div>;
  }
}
