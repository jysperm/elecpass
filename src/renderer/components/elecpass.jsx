import {clipboard} from 'electron';
import path from 'path';

import _ from 'lodash';
import {ButtonGroup, Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {Form, FormGroup, FormControl, ControlLabel, InputGroup} from 'react-bootstrap';
import {Grid, Row, Col, Glyphicon} from 'react-bootstrap';
import {Alert} from 'react-bootstrap';
import React, {Component} from 'react';

import {generatePassword} from '../../common/utils';

import InputModal from './input-modal';
import PassStore from '../../common/pass-store';
import TOTPTokenButton from './totp-token';
import EntriesList from './entries-list';

export default class ElecpassView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creating: false,
      currentEntry: null,
      editingEntry: {},
      entries: [],
      newFieldName: '',
      savingEntry: false,

      repoStatus: null,
      settingRemoteRepo: false,
      gpgId: '',
      settingGPGId: false
    };

    this.passStore = new PassStore();

    this.passStore.loadEntries().then( entries => {
      this.setState({entries});
    });

    this.passStore.on('entry-changed', entry => {
      this.setState({
        entries: _.concat(entry, _.reject(this.state.entries, {name: entry.name}))
      });

      if (this.state.currentEntry && this.state.currentEntry.name == entry.name) {
        this.setState({
          currentEntry: entry
        });
      }
    });

    this.passStore.on('entry-removed', ({name}) => {
      this.setState({
        entries: _.reject(this.state.entries, {name})
      });

      if (this.state.currentEntry && this.state.currentEntry.name == name) {
        this.setState({
          creating: false,
          currentEntry: null
        });
      }
    });

    this.passStore.on('repo-status-changed', repoStatus => {
      this.setState({repoStatus});
    });

    this.passStore.on('error', err => {
      alert(err.message);
    });

    this.passStore.gpgAdapter.gpgId().then( gpgId => {
      this.setState({gpgId});
    }).catch( err => {
      if (err.code === 'ENOENT') {
        this.setState({
          settingGPGId: true
        });
      } else {
        alert(err.message);
      }
    });
  }

  render() {
    const {repoStatus} = this.state;

    return <Grid fluid={true}>
      <Row className='window-header'>
        {(!repoStatus || !repoStatus.remoteRepo) && <Alert bsStyle='warning'>
          We recommend you <strong>Init Git Repo</strong> and <strong>Set Remote Repo</strong> to sync your entries.
        </Alert>}
        <ButtonGroup className='pull-left'>
          <Button bsStyle='success' onClick={this.onInsertEntry.bind(this)}>Insert</Button>
          {repoStatus && repoStatus.remoteRepo && <Button bsStyle='info' onClick={this.onGitPull.bind(this)}>
            Git Pull{repoStatus.behind > 0 ? ` (${repoStatus.behind})` : ''}
          </Button>}
          {repoStatus && repoStatus.remoteRepo && <Button bsStyle='info' onClick={this.onGitPush.bind(this)}>
            Git Push{repoStatus.ahead > 0 ? ` (${repoStatus.ahead})` : ''}
          </Button>}
          <DropdownButton bsStyle='warning' title='' id='extra-settings'>
            {repoStatus && repoStatus.isGitRepo === false && <MenuItem eventKey='init-git-repo' onClick={this.onGitInit.bind(this)}>
              Init Git Repo
            </MenuItem>}
            <MenuItem eventKey='set-remote-repo' onClick={() => {this.setState({settingRemoteRepo: true})}}>
              Set Remote Repo ({repoStatus && repoStatus.remoteRepo})
            </MenuItem>
            <MenuItem eventKey='set-gpg-id' onClick={() => {this.setState({settingGPGId: true})}}>
              Set GPG Id ({this.state.gpgId})
            </MenuItem>
          </DropdownButton>
        </ButtonGroup>
        <ButtonGroup className='pull-right'>
          {this.state.currentEntry && <Button bsStyle='danger' onClick={this.onRemoveEntry.bind(this)}>Remove</Button>}
        </ButtonGroup>
      </Row>
      <Row className='window-body'>
        <Col xs={6}>
          <EntriesList entries={this.state.entries} onEntrySelected={this.onEntrySelected.bind(this)} />
        </Col>
        <Col xs={6}>
          {this.state.currentEntry && <Form>
            <FormGroup>
              <ControlLabel>Entry Name</ControlLabel>
              <FormControl type='text' {...this.linkEntryField('name')}/>
            </FormGroup>

            {this.mapFields('metaInfo', (value, key) => {
              return <FormGroup key={key}>
                <ControlLabel>{key}</ControlLabel>
                <FormControl type='text' {...this.linkEntryField(`metaInfo.${key}`)}/>
              </FormGroup>
            })}

            <FormGroup>
              <ControlLabel>Password 🔓</ControlLabel>
                <InputGroup>
                  <FormControl type='text' {...this.linkEntryField('password')}/>
                  <InputGroup.Button>
                    <Button onClick={this.onCopyToClipboard.bind(this, this.linkEntryField('password').value)}>
                      <Glyphicon glyph='copy' />
                    </Button>
                    <Button onClick={this.onRandomPasswordClicked.bind(this, 'password')}>
                      <Glyphicon glyph='random' />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
            </FormGroup>

            {this.mapFields('extraInfo', (value, key) => {
              if (key === 'TOTP') {
                return <FormGroup key={key}>
                  <ControlLabel>{key} 🔓</ControlLabel>
                    <InputGroup>
                      <InputGroup.Button>
                        <TOTPTokenButton secret={value} />
                      </InputGroup.Button>
                      <FormControl type='text' {...this.linkEntryField(`extraInfo.${key}`)}/>
                    </InputGroup>
                </FormGroup>;
              } else {
                return <FormGroup key={key}>
                  <ControlLabel>{key} 🔓</ControlLabel>
                  <FormControl type='text' {...this.linkEntryField(`extraInfo.${key}`)}/>
                </FormGroup>;
              }
            })}

            <FormGroup>
              <InputGroup>
                <DropdownButton id='add-field' componentClass={InputGroup.Button} title='Add ...'>
                  <MenuItem onClick={this.onAddFieldClicked.bind(this, true)}>Encrypted Field</MenuItem>
                  <MenuItem onClick={this.onAddFieldClicked.bind(this, false)}>Unencrypted Field</MenuItem>
                  <MenuItem onClick={this.onAddTOTPFieldClicked.bind(this)}>TOTP Field</MenuItem>
                </DropdownButton>
                <FormControl type='text' value={this.state.newFieldName} placeholder='Some feild name'
                  onChange={({target: {value}}) => this.setState({newFieldName: value})} />
              </InputGroup>
            </FormGroup>

            <ButtonGroup>
              <Button bsStyle={_.isEmpty(this.state.editingEntry) ? 'default' : 'primary'}
                disabled={this.state.savingEntry} onClick={this.onSaveClicked.bind(this)}>Save</Button>
            </ButtonGroup>
          </Form>}
        </Col>
      </Row>

      {this.state.settingGPGId && <InputModal onClose={this.onModalClose.bind(this)}
        onConfirm={this.onSaveGPGId.bind(this)} field='GPG Id' value={this.state.gpgId}>
          Set your GPG public key, like `5A804BF5`
      </InputModal>}

      {this.state.settingRemoteRepo && <InputModal onClose={this.onModalClose.bind(this)}
        onConfirm={this.onSaveRemoteRepo.bind(this)} field='Remote Repo'
        value={this.state.remoteRepo && this.state.remoteRepo.remoteRepo}>
          Set your Git remote repo, like `git@github.com:jysperm/passwords.git`
      </InputModal>}
    </Grid>;
  }

  linkEntryField(field) {
    return {
      value: _.get(this.state.editingEntry, field) || _.get(this.state.currentEntry, field) || '',
      onChange: ({target}) => {
        if (!this.state.savingEntry) {
          this.setState(_.set(this.state.editingEntry, field, target.value));
        }
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

  onRemoveEntry() {
    this.passStore.removeEntry(this.state.currentEntry).catch(alert);
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

  onCopyToClipboard(text) {
    clipboard.writeText(text);
  }

  onRandomPasswordClicked(field) {
    this.setState(_.set(this.state.editingEntry, field, generatePassword()));
  }

  onSaveClicked() {
    this.setState({savingEntry: true});

    this.passStore.encryptAndWriteEntry(_.extend({}, this.state.currentEntry, this.state.editingEntry)).then( () => {
      this.setState({
        savingEntry: false,
        creating: false,
        editingEntry: {}
      });
    }).catch(alert);
  }

  onEntrySelected(entry) {
    this.setState({currentEntry: entry});

    this.passStore.decryptEntry(entry).then( decrypted => {
      this.setState({
        creating: false,
        currentEntry: _.extend(decrypted, entry),
        editingEntry: {}
      });
    }).catch(alert);
  }

  onSaveGPGId(gpgId) {
    this.passStore.gpgAdapter.setGPGId(gpgId).then( () => {
      this.setState({
        gpgId: gpgId,
        settingGPGId: false
      });
    }).catch(alert);
  }

  onSaveRemoteRepo(remoteRepo) {
    this.passStore.gitAdapter.setRemoteRepo(remoteRepo).then( () => {
      this.setState({
        repoStatus: _.extend(this.state.repoStatus, {remoteRepo}),
        settingRemoteRepo: false
      });
    }).catch(alert);
  }

  onModalClose() {
    this.setState({
      settingGPGId: false,
      settingRemoteRepo: false
    });
  }

  onGitInit() {
    this.passStore.gitAdapter.initRepo().then( () => {
      return this.passStore.loadRepoStatus();
    }).catch(alert);
  }

  onGitPull() {
    this.passStore.gitAdapter.pullRemote().then( () => {
      this.passStore.loadEntries().then( entries => {
        this.setState({entries});
      });
    }).catch(alert);
  }

  onGitPush() {
    this.passStore.gitAdapter.pushRemote().then( () => {
      return this.passStore.loadRepoStatus();
    }).catch(alert);
  }
}
