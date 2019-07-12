import React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Glyphicon,
  InputGroup,
  OverlayTrigger,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Well,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import * as bip39 from 'bip39';

const GENERATE_WALLET_MODE = 1;
const RECOVER_WALLET_MODE = 2;

export class Account extends React.Component {
  state = {
    walletMode: GENERATE_WALLET_MODE,
    generatedPhrase: bip39.generateMnemonic(),
    recoveredPhrase: '',
  };

  regenerateSeedPhrase() {
    const generatedPhrase = bip39.generateMnemonic();
    this.setState({generatedPhrase});
  }

  copyGeneratedPhrase() {
    copy(this.state.generatedPhrase);
  }

  createAccount() {
    this.props.store.createAccountFromSeed(this.state.generatedPhrase);
  }

  recoverAccount() {
    this.props.store.createAccountFromSeed(this.state.recoveredPhrase);
  }

  onModeChange(walletMode) {
    this.setState({walletMode});
  }

  onRecoverPhraseChange(e) {
    this.setState({recoveredPhrase: e.target.value});
  }

  validateRecoverPhrase() {
    if (this.state.recoveredPhrase) {
      if (bip39.validateMnemonic(this.state.recoveredPhrase)) {
        return 'success';
      } else {
        return 'error';
      }
    }
    return null;
  }

  render() {
    return (
      <Well>
        <h2>Account Setup</h2>
        <p>
          A locally cached wallet account was not found. Generate a new one or
          recover an existing wallet from its seed phrase.
        </p>
        <hr />
        <FormGroup>
          <ToggleButtonGroup
            name="options"
            value={this.state.walletMode}
            onChange={mode => this.onModeChange(mode)}
            justified
          >
            <ToggleButton value={GENERATE_WALLET_MODE}>
              Generate New Wallet
            </ToggleButton>
            <ToggleButton value={RECOVER_WALLET_MODE}>
              Recover Existing Wallet
            </ToggleButton>
          </ToggleButtonGroup>
        </FormGroup>
        {this.state.walletMode === GENERATE_WALLET_MODE &&
          this.renderGenerateWalletMode()}
        {this.state.walletMode === RECOVER_WALLET_MODE &&
          this.renderRecoverWalletMode()}
      </Well>
    );
  }

  renderRecoverWalletMode() {
    return (
      <React.Fragment>
        <FormGroup validationState={this.validateRecoverPhrase()}>
          <ControlLabel>
            Enter a valid seed phrase to recover a wallet
          </ControlLabel>
          <FormControl
            type="password"
            autoComplete="current-password"
            value={this.state.recoveredPhrase}
            placeholder="Enter seed phrase"
            onChange={e => this.onRecoverPhraseChange(e)}
          />
          <FormControl.Feedback />
          <HelpBlock>Seed phrase should be 12 words in length.</HelpBlock>
        </FormGroup>
        <hr />
        <Button bsStyle="primary" onClick={() => this.recoverAccount()}>
          Recover Account
        </Button>
      </React.Fragment>
    );
  }

  renderGenerateWalletMode() {
    const regenerateTooltip = (
      <Tooltip id="clipboard">Generate new phrase</Tooltip>
    );

    const copyTooltip = (
      <Tooltip id="clipboard">Copy seed phrase to clipboard</Tooltip>
    );

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Generated Seed Phrase</ControlLabel>
          <InputGroup>
            <InputGroup.Button>
              <OverlayTrigger placement="bottom" overlay={regenerateTooltip}>
                <Button onClick={() => this.regenerateSeedPhrase()}>
                  <Glyphicon glyph="refresh" />
                </Button>
              </OverlayTrigger>
            </InputGroup.Button>
            <FormControl
              type="password"
              autoComplete="new-password"
              size="21"
              value={this.state.generatedPhrase}
              onChange={() => { return false; }}
            />
            <InputGroup.Button>
              <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                <Button onClick={() => this.copyGeneratedPhrase()}>
                  <Glyphicon glyph="copy" />
                </Button>
              </OverlayTrigger>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
        <hr />
        <p>
          <b>WARNING:</b> The seed phrase will not be shown again, copy it down
          or save in your password manager to recover this wallet in the future.
        </p>
        <Button bsStyle="primary" onClick={() => this.createAccount()}>
          Create Account
        </Button>
      </React.Fragment>
    );
  }
}

Account.propTypes = {
  store: PropTypes.object,
};
