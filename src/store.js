import localforage from 'localforage';
import EventEmitter from 'event-emitter';
import * as web3 from '@solana/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import gte from 'semver/functions/gte';

export class Store {
  constructor() {
    this._ee = new EventEmitter();
    this._lf = localforage.createInstance({
      name: 'configuration',
    });
  }

  async init() {
    for (let key of [
      'networkEntryPoint',
      'accountSecretKey', // TODO: THIS KEY IS NOT STORED SECURELY!!
      'feeCalculator',
      'minBalanceForRentException',
    ]) {
      this[key] = await this._lf.getItem(key);
    }

    if (typeof this.networkEntryPoint !== 'string') {
      await this.setNetworkEntryPoint(web3.clusterApiUrl(process.env.CLUSTER));
    } else {
      await this.resetConnection();
    }
  }

  async resetAccount() {
    this.accountSecretKey = null;
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', this.accountSecretKey);
  }

  async createAccountFromMnemonic(mnemonic) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    this.accountSecretKey = keyPair.secretKey;
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', keyPair.secretKey);
  }

  async resetConnection() {
    const url = this.networkEntryPoint;
    let connection = new web3.Connection(url);
    let feeCalculator;
    let minBalanceForRentException;
    try {
      feeCalculator = (await connection.getRecentBlockhash()).feeCalculator;
      minBalanceForRentException = await connection.getMinimumBalanceForRentExemption(
        0,
      );
      // commitment params are only supported >= 0.21.0
      const version = await connection.getVersion();
      const solanaCoreVersion = version['solana-core'].split(' ')[0];
      if (gte(solanaCoreVersion, '0.21.0')) {
        connection = new web3.Connection(url, 'recent');
      }
    } catch (err) {
      console.error('Failed to reset connection', err);
      connection = null;
    }

    if (url === this.networkEntryPoint) {
      this.setFeeCalculator(feeCalculator);
      this.setMinBalanceForRentExemption(minBalanceForRentException);
      this.connection = connection;
      this._ee.emit('change');
    }
  }

  async setNetworkEntryPoint(value) {
    if (value !== this.networkEntryPoint) {
      this.networkEntryPoint = value;
      await this.resetConnection();
      await this._lf.setItem('networkEntryPoint', value);
    }
  }

  async setMinBalanceForRentExemption(minBalanceForRentException) {
    this.minBalanceForRentException = minBalanceForRentException;
    await this._lf.setItem(
      'minBalanceForRentException',
      minBalanceForRentException,
    );
  }

  async setFeeCalculator(feeCalculator) {
    this.feeCalculator = feeCalculator;
    await this._lf.setItem('feeCalculator', feeCalculator);
  }

  onChange(fn) {
    this._ee.on('change', fn);
  }

  removeChangeListener(fn) {
    this._ee.off('change', fn);
  }
}
