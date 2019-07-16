import localforage from 'localforage';
import EventEmitter from 'event-emitter';
import * as web3 from '@solana/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';

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
    ]) {
      this[key] = await this._lf.getItem(key);
    }

    if (typeof this.networkEntryPoint !== 'string') {
      this.networkEntryPoint = web3.testnetChannelEndpoint(process.env.CHANNEL);
    }

    this._ee.emit('change');
  }

  async resetAccount() {
    this.accountSecretKey = null;
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', this.accountSecretKey);
  }

  async createAccountFromSeed(seedPhrase) {
    const seed = Buffer.from(bip39.mnemonicToEntropy(seedPhrase));
    const keyPair = nacl.sign.keyPair.fromSeed(seed);
    this.accountSecretKey = keyPair.secretKey;
    this._ee.emit('change');
    await this._lf.setItem('accountSecretKey', keyPair.secretKey);
  }

  async setNetworkEntryPoint(value) {
    if (value !== this.networkEntryPoint) {
      this.networkEntryPoint = value;
      this._ee.emit('change');
      await this._lf.setItem('networkEntryPoint', value);
    }
  }

  onChange(fn) {
    this._ee.on('change', fn);
  }

  removeChangeListener(fn) {
    this._ee.off('change', fn);
  }
}
