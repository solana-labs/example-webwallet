import React from 'react';
import {
  DropdownButton,
  HelpBlock,
  MenuItem,
  FormControl,
  FormGroup,
  InputGroup,
  ControlLabel,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@solana/web3.js';

import Button from './components/Button';

export class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      validationState: null,
      validationHelpBlock: null,
      checkNetworkCount: 0,
      networkEntryPoint: '',
    };

    this.onStoreChange = this.onStoreChange.bind(this);
  }

  componentDidMount() {
    this.props.store.onChange(this.onStoreChange);
    this.onStoreChange();
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this.onStoreChange);
  }

  onStoreChange() {
    this.setState(
      {
        networkEntryPoint: this.props.store.networkEntryPoint,
      },
      this.checkNetwork,
    );
  }

  setNetworkEntryPoint(url) {
    this.setState({networkEntryPoint: url}, this.checkNetwork);
  }

  async checkNetwork() {
    if (!this.state.networkEntryPoint) return;
    console.log('Checking network:', this.state.networkEntryPoint);
    const connection = new web3.Connection(this.state.networkEntryPoint);
    const checkNetworkCount = this.state.checkNetworkCount + 1;
    this.setState({
      validationState: 'warning',
      validationHelpBlock: 'Connecting to network...',
      checkNetworkCount,
    });

    try {
      const {feeCalculator} = await connection.getRecentBlockhash();
      const minBalanceForRentException = await connection.getMinimumBalanceForRentExemption(
        0,
      );
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.props.store.setFeeCalculator(feeCalculator);
        this.props.store.setMinBalanceForRentExemption(
          minBalanceForRentException,
        );
        this.props.store.setNetworkEntryPoint(this.state.networkEntryPoint);
        this.setState({
          validationState: 'success',
          validationHelpBlock: 'Connected',
        });
      }
    } catch (err) {
      console.log('checkNetwork error:', err);
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.setState({
          validationState: 'error',
          validationHelpBlock: 'Connection failed',
        });
      }
    }
  }

  async resetAccount() {
    await this.props.store.resetAccount();
    this.props.onHide();
  }

  render() {
    return (
      <div>
        <FormGroup validationState={this.state.validationState}>
          <ControlLabel>Network Settings</ControlLabel>
          <InputGroup className="sl-input">
            <DropdownButton
              id="network-dropdown"
              componentClass={InputGroup.Button}
              title="Network"
              onSelect={::this.setNetworkEntryPoint}
            >
              {[
                web3.clusterApiUrl('mainnet-beta'),
                web3.clusterApiUrl('testnet'),
                web3.clusterApiUrl('devnet'),
                'http://localhost:8899',
              ].map((url, index) => (
                <MenuItem
                  key={index}
                  eventKey={url}
                  active={url === this.state.networkEntryPoint}
                >
                  {url}
                </MenuItem>
              ))}
            </DropdownButton>
            <FormControl
              type="text"
              value={this.state.networkEntryPoint}
              placeholder="Enter the URI of the network"
              onChange={e => this.setNetworkEntryPoint(e.target.value)}
            />
            <FormControl.Feedback />
          </InputGroup>
          <HelpBlock>{this.state.validationHelpBlock}</HelpBlock>
        </FormGroup>
        <div className="mt40">
          <h5>Account Settings</h5>
          <p className="text">
            <span className="green">WARNING:</span>
            &nbsp;Any tokens associated with the current account will be lost
          </p>
          <div className="text-center-xs">
            <Button onClick={() => this.resetAccount()}>Reset Account</Button>
          </div>
        </div>
      </div>
    );
  }
}
Settings.propTypes = {
  store: PropTypes.object,
  onHide: PropTypes.func,
};
