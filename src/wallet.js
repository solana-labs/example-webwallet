import React from 'react';
import {
  Alert,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  InputGroup,
  Modal,
  OverlayTrigger,
  Panel,
  Tooltip,
  Well,
  Grid,
  Row,
  Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

import Loader from './components/Loader';
import NetworkSelect from './components/NetworkSelect';
import RefreshIcon from './icons/refresh.svg';
import SendIcon from './icons/send.svg';
import FileCopyIcon from './icons/file-copy.svg';
import GearIcon from './icons/gear.svg';
import CloseIcon from './icons/close.svg';
import WarnIcon from './icons/warn.svg';
import Button from './components/Button';
import {Account} from './account';
import {Settings} from './settings';

const alertIcon = {
  danger: <WarnIcon fill="#F71EF4" />,
  warning: <WarnIcon fill="#FFC617 " />,
};

const copyTooltip = (
  <Tooltip id="clipboard">Copy public key to clipboard</Tooltip>
);
const refreshBalanceTooltip = (
  <Tooltip id="refresh">Refresh account balance</Tooltip>
);

const airdropTooltip = <Tooltip id="airdrop">Request an airdrop</Tooltip>;

class PublicKeyInput extends React.Component {
  state = {
    value: '',
    validationState: null,
    help: '',
  };

  componentDidMount() {
    this.handleChange(this.props.defaultValue || '');
  }

  getValidationState(value) {
    const length = value.length;
    if (length === 0) {
      return [null, ''];
    }

    try {
      new web3.PublicKey(value);
      return ['success', this.identityText(value)];
    } catch (err) {
      return ['error', 'Invalid Public Key'];
    }
  }

  handleChange(value) {
    const [validationState, help] = this.getValidationState(value);
    this.setState({value, validationState, help});
    this.props.onPublicKey(validationState === 'success' ? value : null);
  }

  identityText(value) {
    if (this.props.identity && value === this.props.defaultValue) {
      const {name, keybaseUsername} = this.props.identity;
      if (keybaseUsername) {
        const verifyUrl = `https://keybase.pub/${keybaseUsername}/solana/validator-${value}`;
        return (
          <span>
            {`Identified "${name}" who can be verified on `}
            <a href={verifyUrl}>Keybase</a>
          </span>
        );
      } else {
        return <span>{`Identified "${name}"`}</span>;
      }
    }
  }

  render() {
    const {help, validationState} = this.state;
    return (
      <form>
        <FormGroup validationState={validationState}>
          <ControlLabel>Recipient&apos;s Public Key</ControlLabel>
          <InputGroup className="sl-input">
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter the public key of the recipient"
              onChange={e => this.handleChange(e.target.value)}
            />
            <FormControl.Feedback />
          </InputGroup>
          <HelpBlock>{help}</HelpBlock>
        </FormGroup>
      </form>
    );
  }
}
PublicKeyInput.propTypes = {
  onPublicKey: PropTypes.func,
  defaultValue: PropTypes.string,
  identity: PropTypes.object,
};

class TokenInput extends React.Component {
  state = {
    value: '',
    validationState: null,
    help: '',
  };

  componentDidMount() {
    this.handleChange(this.props.defaultValue || '');
  }

  componentDidUpdate(prevProps) {
    if (this.props.maxValue !== prevProps.maxValue) {
      this.handleChange(this.state.value);
    }
  }

  getValidationState(value) {
    if (value.length === 0) {
      return [null, ''];
    }
    if (parseInt(value) > this.props.maxValue) {
      return ['error', 'Insufficient funds, did you account for fees?'];
    }
    if (value.match(/^\d+$/)) {
      return ['success', ''];
    }
    return ['error', 'Not a valid number'];
  }

  handleChange(value) {
    const [validationState, help] = this.getValidationState(value);
    this.setState({value, validationState, help});
    this.props.onAmount(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <ControlLabel>Amount</ControlLabel>
          <InputGroup className="sl-input">
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter amount to transfer"
              onChange={e => this.handleChange(e.target.value)}
            />
            <FormControl.Feedback />
          </InputGroup>
          <HelpBlock>{this.state.help}</HelpBlock>
        </FormGroup>
      </form>
    );
  }
}
TokenInput.propTypes = {
  onAmount: PropTypes.func,
  defaultValue: PropTypes.string,
  maxValue: PropTypes.number,
};

class SignatureInput extends React.Component {
  state = {
    value: '',
    validationState: null,
  };

  getValidationState(value) {
    if (value.length === 0) return null;

    try {
      if (bs58.decode(value).length === 64) {
        return 'success';
      } else {
        return 'error';
      }
    } catch (err) {
      return 'error';
    }
  }

  handleChange(e) {
    const {value} = e.target;
    const validationState = this.getValidationState(value);
    this.setState({value, validationState});
    this.props.onSignature(validationState === 'success' ? value : null);
  }

  render() {
    return (
      <form>
        <FormGroup validationState={this.state.validationState}>
          <ControlLabel>Signature</ControlLabel>
          <InputGroup className="sl-input">
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter a transaction signature"
              onChange={e => this.handleChange(e)}
            />
            <FormControl.Feedback />
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}
SignatureInput.propTypes = {
  onSignature: PropTypes.func,
};

class DismissibleMessages extends React.Component {
  render() {
    const messages = this.props.messages.map(([msg, style], index) => {
      return (
        <Alert key={index} bsStyle={style}>
          {alertIcon[style]}
          <span>{msg}</span>
          <a href="#" onClick={() => this.props.onDismiss(index)}>
            <CloseIcon fill="#fff" width={19} height={19} />
          </a>{' '}
        </Alert>
      );
    });
    return <div>{messages}</div>;
  }
}
DismissibleMessages.propTypes = {
  messages: PropTypes.array,
  onDismiss: PropTypes.func,
};

class BusyModal extends React.Component {
  render() {
    return (
      <Modal
        {...this.props}
        bsSize="small"
        className="sl-modal sl-modal-light"
        aria-labelledby="contained-modal-title-sm"
      >
        <Modal.Header>
          <Modal.Title
            className="sl-modal-title-light"
            id="contained-modal-title-sm"
          >
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.text}
          <br />
          <br />
          <Loader />
        </Modal.Body>
      </Modal>
    );
  }
}
BusyModal.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
};

class SettingsModal extends React.Component {
  render() {
    return (
      <Modal
        {...this.props}
        className="sl-modal"
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-sl-title" id="contained-modal-title-lg">
            Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Settings store={this.props.store} onHide={this.props.onHide} />
        </Modal.Body>
      </Modal>
    );
  }
}
SettingsModal.propTypes = {
  onHide: PropTypes.func,
  store: PropTypes.object,
};

export class Wallet extends React.Component {
  state = {
    messages: [],
    busyModal: null,
    settingsModal: false,
    balance: 0,
    account: null,
    url: '',
    requestMode: false,
    requesterOrigin: '*',
    requestPending: false,
    requestedPublicKey: '',
    requestedAmount: '',
    recipientPublicKey: '',
    recipientAmount: '',
    recipientIdentity: null,
    confirmationSignature: null,
    transactionConfirmed: null,
  };

  setConfirmationSignature(confirmationSignature) {
    this.setState({
      transactionConfirmed: null,
      confirmationSignature,
    });
  }

  async setRecipientPublicKey(recipientPublicKey) {
    this.setState({recipientPublicKey});
    if (recipientPublicKey) {
      const recipientIdentity = await this.fetchIdentity(
        new web3.PublicKey(recipientPublicKey),
      );
      this.setState({recipientIdentity});
    }
  }

  async fetchIdentity(publicKey) {
    const configKey = new web3.PublicKey(
      'Config1111111111111111111111111111111111111',
    );
    const keyAndAccountList = await this.web3sol.getProgramAccounts(configKey);
    for (const {account} of keyAndAccountList) {
      const validatorInfo = web3.ValidatorInfo.fromConfigData(account.data);
      if (validatorInfo && validatorInfo.key.equals(publicKey)) {
        return validatorInfo.info;
      }
    }
  }

  setRecipientAmount(recipientAmount) {
    this.setState({recipientAmount});
  }

  dismissMessage(index) {
    const {messages} = this.state;
    messages.splice(index, 1);
    this.setState({messages});
  }

  addError(message) {
    this.addMessage(message, 'danger');
  }

  addWarning(message) {
    this.addMessage(message, 'warning');
  }

  addInfo(message) {
    this.addMessage(message, 'info');
  }

  addMessage(message, type) {
    const {messages} = this.state;
    messages.push([message, type]);
    this.setState({messages});
  }

  async runModal(title, text, f) {
    this.setState({
      busyModal: {title, text},
    });

    try {
      await f();
    } catch (err) {
      console.error(err);
      this.addError(err.message);
    }

    this.setState({busyModal: null});
  }

  onStoreChange = () => {
    const {
      networkEntryPoint: url,
      feeCalculator,
      connection,
      accountSecretKey,
      minBalanceForRentException,
    } = this.props.store;

    this.web3sol = connection;
    this.feeCalculator = feeCalculator;
    this.minBalanceForRentException = minBalanceForRentException;

    if (url !== this.state.url) {
      this.addWarning(`Changed wallet network to "${url}"`);
    }

    let account = null;
    if (accountSecretKey) {
      account = new web3.Account(accountSecretKey);
    }

    this.setState({account, url}, this.refreshBalance);
  };

  onAddFunds(params, origin) {
    if (!params || this.state.requestPending) return;
    if (!params.pubkey || !params.network) {
      if (!params.pubkey) this.addError(`Request did not specify a public key`);
      if (!params.network) this.addError(`Request did not specify a network`);
      return;
    }

    let requestedNetwork;
    try {
      requestedNetwork = new URL(params.network).origin;
    } catch (err) {
      this.addError(`Request network is invalid: "${params.network}"`);
      return;
    }

    const walletNetwork = new URL(this.props.store.networkEntryPoint).origin;
    if (requestedNetwork !== walletNetwork) {
      this.setNetworkEntryPoint(requestedNetwork);
    }

    this.setState({
      requesterOrigin: origin,
      requestPending: true,
      requestedAmount: `${params.amount || ''}`,
      requestedPublicKey: params.pubkey,
    });
  }

  postWindowMessage(method, params) {
    if (window.opener) {
      window.opener.postMessage({method, params}, this.state.requesterOrigin);
    }
  }

  onWindowOpen() {
    this.setState({requestMode: true});
    window.addEventListener('message', e => {
      if (e.data) {
        switch (e.data.method) {
          case 'addFunds':
            this.onAddFunds(e.data.params, e.origin);
            return true;
        }
      }
    });

    this.postWindowMessage('ready');
  }

  closeRequestModal = () => {
    window.close();
  };

  componentDidMount() {
    this.setState({url: this.props.store.networkEntryPoint}, () => {
      this.props.store.onChange(this.onStoreChange);
      this.onStoreChange();
      if (window.opener) {
        this.onWindowOpen();
      }
    });
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this.onStoreChange);
  }

  copyPublicKey() {
    copy(this.state.account.publicKey);
  }

  refreshBalance() {
    if (this.state.account) {
      this.runModal('Updating Account Balance', 'Please wait...', async () => {
        if (this.web3sol) {
          const url = this.state.url;
          const balance = await this.web3sol.getBalance(
            this.state.account.publicKey,
          );
          if (url === this.state.url) {
            this.setState({balance});
          }
        } else {
          this.addWarning(`Encountered unexpected error, please report!`);
        }
      });
    } else {
      this.setState({balance: 0});
    }
  }

  airdropAmount() {
    if (this.feeCalculator && this.feeCalculator.lamportsPerSignature) {
      // Drop enough to create 100 rent exempt accounts, that should be plenty
      return (
        100 *
        (this.feeCalculator.lamportsPerSignature +
          this.minBalanceForRentException)
      );
    }
    // Otherwise some large number
    return 100000000;
  }

  requestAirdrop() {
    this.runModal('Requesting Airdrop', 'Please wait...', async () => {
      const airdrop = this.airdropAmount();
      await this.web3sol.requestAirdrop(this.state.account.publicKey, airdrop);
      this.setState({
        balance: await this.web3sol.getBalance(this.state.account.publicKey),
      });
    });
  }

  sendTransaction(closeOnSuccess) {
    this.runModal('Sending Transaction', 'Please wait...', async () => {
      const amount = this.state.recipientAmount;
      this.setState({requestedAmount: '', requestPending: false});
      const transaction = web3.SystemProgram.transfer({
        fromPubkey: this.state.account.publicKey,
        toPubkey: new web3.PublicKey(this.state.recipientPublicKey),
        lamports: amount,
      });

      let signature = '';
      try {
        signature = await web3.sendAndConfirmTransaction(
          this.web3sol,
          transaction,
          [this.state.account],
          {confirmations: 1},
        );
      } catch (err) {
        // Transaction failed but fees were still taken
        this.setState({
          balance: await this.web3sol.getBalance(this.state.account.publicKey),
        });
        this.postWindowMessage('addFundsResponse', {err: true});
        throw err;
      }

      this.addInfo(`Transaction ${signature} has been confirmed`);
      this.postWindowMessage('addFundsResponse', {signature, amount});
      if (closeOnSuccess) {
        window.close();
      } else {
        this.setState({
          balance: await this.web3sol.getBalance(this.state.account.publicKey),
        });
      }
    });
  }

  confirmTransaction() {
    this.runModal('Confirming Transaction', 'Please wait...', async () => {
      const result = (
        await this.web3sol.confirmTransaction(
          this.state.confirmationSignature,
          1,
        )
      ).value;
      console.log({result});
      const transactionConfirmed =
        result !== null &&
        (result.confirmations === null || result.confirmations > 0);
      this.setState({
        transactionConfirmed,
      });
    });
  }

  sendDisabled() {
    return (
      this.state.recipientPublicKey === null ||
      this.state.recipientAmount === null
    );
  }

  render() {
    if (!this.state.account) {
      return <Account store={this.props.store} />;
    }

    const busyModal = this.state.busyModal ? (
      <BusyModal
        show
        title={this.state.busyModal.title}
        text={this.state.busyModal.text}
      />
    ) : null;

    const settingsModal = this.state.settingsModal ? (
      <SettingsModal
        show
        store={this.props.store}
        onHide={() => this.setState({settingsModal: false})}
      />
    ) : null;

    return (
      <div>
        {busyModal}
        {settingsModal}
        {this.state.requestMode
          ? this.renderTokenRequestPanel()
          : this.renderMainPanel()}
      </div>
    );
  }

  setNetworkEntryPoint(val) {
    if (this.props.store.networkEntryPoint !== val) {
      this.setState(
        {
          busyModal: {
            title: 'Changing network',
            text: 'Please wait...',
          },
        },
        () => {
          this.props.store.setNetworkEntryPoint(val);
        },
      );
    }
  }

  renderMainPanel() {
    const {store} = this.props;
    const {networkEntryPoint, feeCalculator} = store;
    let fee;
    if (feeCalculator && feeCalculator.lamportsPerSignature) {
      fee = feeCalculator.lamportsPerSignature;
    } else {
      fee = 5000;
    }
    let minBalanceForRentException;
    if (store.minBalanceForRentException) {
      minBalanceForRentException = store.minBalanceForRentException;
    } else {
      minBalanceForRentException = 42;
    }
    return (
      <React.Fragment>
        <div className="container">
          <DismissibleMessages
            messages={this.state.messages}
            onDismiss={index => this.dismissMessage(index)}
          />
        </div>
        <Grid>
          <Row className="show-grid">
            <Col xs={12}>
              <div className="section-header">
                <h2 className="decor">network information</h2>
                <div className="network-select">
                  <div className="network-select__title">Network:</div>
                  <NetworkSelect
                    value={networkEntryPoint}
                    onChange={this.setNetworkEntryPoint.bind(this)}
                  />
                </div>
                <button onClick={() => this.setState({settingsModal: true})}>
                  <span>
                    <GearIcon /> <span>Settings</span>
                  </span>
                </button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Well>
                <p>Fee per Signature: {fee} lamports</p>
                <p>
                  Minimum rent exempt balance for empty account:{' '}
                  {minBalanceForRentException} lamports
                </p>
              </Well>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col xs={12}>
              <div className="section-header">
                <h2 className="decor">account information</h2>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>
              <Well>{this.renderAccountBalance()}</Well>
            </Col>
            <Col xs={12} md={8}>
              <Well>
                <FormGroup>
                  <ControlLabel>Account Public Key</ControlLabel>
                  <InputGroup className="sl-input">
                    <FormControl
                      readOnly
                      type="text"
                      size="21"
                      value={this.state.account.publicKey}
                    />
                    <InputGroup.Button>
                      <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                        <button
                          className="icon-btn"
                          onClick={() => this.copyPublicKey()}
                        >
                          <FileCopyIcon />
                        </button>
                      </OverlayTrigger>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </Well>
            </Col>
          </Row>
        </Grid>
        <div className="container">{this.renderPanels()}</div>
      </React.Fragment>
    );
  }

  renderPanels() {
    return (
      <React.Fragment>
        {this.renderSendTokensPanel()}
        {this.renderConfirmTxPanel()}
      </React.Fragment>
    );
  }

  renderAccountBalance = () => {
    const {balance} = this.state;
    return (
      <React.Fragment>
        <div className="balance-header">
          <div className="balance-title">Account Balance</div>
          <OverlayTrigger placement="top" overlay={refreshBalanceTooltip}>
            <button className="icon-btn" onClick={() => this.refreshBalance()}>
              <RefreshIcon />
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="bottom" overlay={airdropTooltip}>
            <button className="icon-btn" onClick={() => this.requestAirdrop()}>
              <SendIcon />
            </button>
          </OverlayTrigger>
        </div>
        <div className="balance">
          <div className="balance-val">{balance}</div>
          <div className="balance-ttl">lamports</div>
        </div>
      </React.Fragment>
    );
  };

  renderTokenRequestPanel() {
    const {store} = this.props;
    const {networkEntryPoint} = store;

    return (
      <div className="request-modal">
        <Grid>
          <Row>
            <Col xs={12}>
              <div className="request-modal__header">
                <h2>Token Request</h2>
                <button
                  className="request-modal__close"
                  type="button"
                  onClick={this.closeRequestModal}
                >
                  <CloseIcon width={19} height={19} fill="#fff" />
                </button>
              </div>
            </Col>
          </Row>
        </Grid>
        <div className="request-modal__alert">
          <DismissibleMessages
            messages={this.state.messages}
            onDismiss={index => this.dismissMessage(index)}
          />
        </div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div className="section-header">
                <h4>account information</h4>
                <div className="network-select">
                  <div className="network-select__title">Network:</div>
                  <NetworkSelect
                    value={networkEntryPoint}
                    onChange={this.setNetworkEntryPoint.bind(this)}
                  />
                </div>
                <button onClick={() => this.setState({settingsModal: true})}>
                  <span>
                    <GearIcon /> <span>Settings</span>
                  </span>
                </button>
              </div>
            </Col>
          </Row>
          <Row className="request-modal__row">
            <Col xs={12} md={4}>
              {this.renderAccountBalance()}
            </Col>
            <Col xs={12} md={7} mdOffset={1}>
              <FormGroup>
                <ControlLabel>Account Public Key</ControlLabel>
                <InputGroup className="sl-input">
                  <FormControl
                    readOnly
                    type="text"
                    size="21"
                    value={this.state.account.publicKey}
                  />
                  <InputGroup.Button>
                    <OverlayTrigger placement="bottom" overlay={copyTooltip}>
                      <button
                        className="icon-btn"
                        onClick={() => this.copyPublicKey()}
                      >
                        <FileCopyIcon />
                      </button>
                    </OverlayTrigger>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="section-header">
                <h4>Send Tokens</h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={5}>
              <TokenInput
                key={this.state.requestedAmount}
                maxValue={this.state.balance}
                defaultValue={this.state.requestedAmount}
                onAmount={amount => this.setRecipientAmount(amount)}
              />
            </Col>
            <Col xs={12} md={7}>
              <PublicKeyInput
                key={this.state.requestedPublicKey}
                defaultValue={this.state.requestedPublicKey || ''}
                onPublicKey={publicKey => this.setRecipientPublicKey(publicKey)}
                identity={this.state.recipientIdentity}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="request-modal__btns">
                <Button
                  disabled={this.sendDisabled()}
                  onClick={() => this.sendTransaction(true)}
                >
                  Send
                </Button>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

  renderSendTokensPanel() {
    return (
      <Panel>
        <Panel.Heading>Send Tokens</Panel.Heading>
        <Panel.Body>
          <Grid fluid>
            <Row className="show-grid">
              <Col className="mb25-xs" xs={12} md={5}>
                <TokenInput
                  maxValue={this.state.balance}
                  onAmount={amount => this.setRecipientAmount(amount)}
                />
              </Col>
              <Col xs={12} md={7}>
                <PublicKeyInput
                  onPublicKey={publicKey =>
                    this.setRecipientPublicKey(publicKey)
                  }
                  identity={this.state.recipientIdentity}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={8} xsOffset={2} sm={12} smOffset={0}>
                <div className="text-center-xs mt40">
                  <Button
                    disabled={this.sendDisabled()}
                    onClick={() => this.sendTransaction(false)}
                  >
                    Send
                  </Button>
                </div>
              </Col>
            </Row>
          </Grid>
        </Panel.Body>
      </Panel>
    );
  }

  renderConfirmTxPanel() {
    const confirmDisabled = this.state.confirmationSignature === null;
    return (
      <Panel>
        <Panel.Heading>Confirm Transaction</Panel.Heading>
        <Panel.Body>
          <Grid fluid>
            <Row>
              <Col xs={12}>
                <SignatureInput
                  onSignature={signature =>
                    this.setConfirmationSignature(signature)
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col xs={8} xsOffset={2} sm={12} smOffset={0}>
                <div className="text-center-xs mt40">
                  <Button
                    disabled={confirmDisabled}
                    onClick={() => this.confirmTransaction()}
                  >
                    Confirm
                  </Button>
                  {typeof this.state.transactionConfirmed === 'boolean' ? (
                    <b className="ml20">
                      {this.state.transactionConfirmed
                        ? 'CONFIRMED'
                        : 'NOT CONFIRMED'}
                    </b>
                  ) : (
                    ''
                  )}
                </div>
              </Col>
            </Row>
          </Grid>
        </Panel.Body>
      </Panel>
    );
  }
}
Wallet.propTypes = {
  store: PropTypes.object,
};
