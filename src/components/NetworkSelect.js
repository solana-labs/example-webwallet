import * as web3 from '@solana/web3.js';
import React from 'react';
import PropTypes from 'prop-types';
import {DropdownButton, FormGroup, InputGroup, MenuItem} from 'react-bootstrap';

const NetworkSelect = ({value, onChange}) => {
  return (
    <FormGroup>
      <InputGroup className="sl-input">
        <DropdownButton
          id="network-dropdown"
          componentClass={InputGroup.Button}
          title={value}
          onSelect={onChange}
        >
          {[
            web3.clusterApiUrl('mainnet-beta'),
            web3.clusterApiUrl('testnet'),
            web3.clusterApiUrl('devnet'),
            'http://localhost:8899',
          ].map((url, index) => (
            <MenuItem key={index} eventKey={url} active={url === value}>
              {url}
            </MenuItem>
          ))}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  );
};

NetworkSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default NetworkSelect;
