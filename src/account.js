import React from 'react';
import {
  Button as BaseButton,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
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

import FileCopyIcon from './icons/file-copy.svg';
import EyeIcon from './icons/eye.svg';
import Button from './components/Button';
const GENERATE_WALLET_MODE = 1;
const RECOVER_WALLET_MODE = 2;

export class Account extends React.Component {
  state = {
    walletMode: GENERATE_WALLET_MODE,
    revealSeedPhrase: false,
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
    this.props.store.createAccountFromMnemonic(this.state.generatedPhrase);
  }

  recoverAccount() {
    this.props.store.createAccountFromMnemonic(this.state.recoveredPhrase);
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
      <React.Fragment>
        <div className="container">
          <h2 className="decor">Account Setup</h2>
          <hr />
          <p className="text lg setup-desc">
            A locally cached wallet account was not found. Generate a new one or
            recover an existing wallet from its seed phrase.
          </p>
          <div className="setup-switch">
            <ToggleButtonGroup
              name="options"
              value={this.state.walletMode}
              onChange={mode => this.onModeChange(mode)}
              justified
            >
              <ToggleButton className="sl-toggle" value={GENERATE_WALLET_MODE}>
                Generate New Wallet
              </ToggleButton>
              <ToggleButton className="sl-toggle" value={RECOVER_WALLET_MODE}>
                Recover Existing Wallet
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <Well bsStyle="well">
            {this.state.walletMode === GENERATE_WALLET_MODE &&
              this.renderGenerateWalletMode()}
            {this.state.walletMode === RECOVER_WALLET_MODE &&
              this.renderRecoverWalletMode()}
          </Well>
        </div>
      </React.Fragment>
    );
  }

  seedPhraseInputType() {
    if (this.state.revealSeedPhrase) {
      return 'text';
    } else {
      return 'password';
    }
  }

  toggleReveal() {
    this.setState({revealSeedPhrase: !this.state.revealSeedPhrase});
  }

  renderRevealToggle() {
    let toggleText = 'Reveal';
    if (this.state.revealSeedPhrase) {
      toggleText = 'Hide';
    }

    const revealTooltip = <Tooltip id="reveal">{toggleText}</Tooltip>;

    return (
      <InputGroup.Button>
        <OverlayTrigger placement="bottom" overlay={revealTooltip}>
          <BaseButton onClick={() => this.toggleReveal()}>
            <EyeIcon />
          </BaseButton>
        </OverlayTrigger>
      </InputGroup.Button>
    );
  }

  renderRecoverWalletMode() {
    return (
      <React.Fragment>
        <FormGroup validationState={this.validateRecoverPhrase()}>
          <ControlLabel className="setup-label">
            Enter a valid seed phrase to recover a wallet
          </ControlLabel>
          <InputGroup className="sl-input">
            {this.renderRevealToggle()}
            <FormControl
              autoFocus={true}
              type={this.seedPhraseInputType()}
              autoComplete="current-password"
              value={this.state.recoveredPhrase}
              placeholder="Enter seed phrase"
              onChange={e => this.onRecoverPhraseChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
          <HelpBlock className="text">
            Seed phrase should be 12 words in length.
          </HelpBlock>
        </FormGroup>
        <div className="text-center-xs">
          <Button
            disabled={!this.state.recoveredPhrase}
            onClick={() => this.recoverAccount()}
          >
            Recover Account
          </Button>
        </div>
      </React.Fragment>
    );
  }

  renderGenerateWalletMode() {
    const copyTooltip = (
      <Tooltip id="clipboard">Copy seed phrase to clipboard</Tooltip>
    );

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel className="sl-label setup-label">
            Generated Seed Phrase
          </ControlLabel>
          <InputGroup className="sl-input">
            {this.renderRevealToggle()}
            <FormControl
              autoFocus={true}
              type={this.seedPhraseInputType()}
              autoComplete="new-password"
              size="21"
              value={this.state.generatedPhrase}
              onChange={() => {
                return false;
              }}
            />
            <InputGroup.Button>
              <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                <BaseButton onClick={() => this.copyGeneratedPhrase()}>
                  <FileCopyIcon />
                </BaseButton>
              </OverlayTrigger>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
        <p className="text setup-warn">
          <span className="green">WARNING:</span> The seed phrase will not be
          shown again, copy it down or save in your password manager to recover
          this wallet in the future.
        </p>
        <div className="text-center-xs">
          <Button
            onClick={() => this.createAccount()}
            disabled={!this.state.generatedPhrase}
          >
            Create Account
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

Account.propTypes = {
  store: PropTypes.object,
};
