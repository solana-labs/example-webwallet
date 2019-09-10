[![Build status][travis-image]][travis-url]

[travis-image]: https://api.travis-ci.org/solana-labs/example-webwallet.svg?branch=master
[travis-url]: https://travis-ci.org/solana-labs/example-webwallet

# Example Web Wallet

This project demonstrates how to use the [Solana Javascript API](https://github.com/solana-labs/solana-web3.js)
to implement a simple web wallet.

**IMPORTANT: This wallet does not sufficently protect the private keys it
generates and should NOT be used in a non-test environment**

## Getting Started

```
$ npm install
$ npm run start
```

Then open your browser to http://localhost:8080/

## Development

When making changes, using the webpack-dev-server can be quite convenient as it
will rebuild and reload the app automatically

```
$ npm run dev
```

## Funding dApps

If this wallet is opened by a dApp, it will accept requests for funds. In order to
request funds from your dApp, follow these steps:

1. Attach a message event listener to the dApp window
```js
window.addEventListener('message', (e) => { /* ... */ });
```
2. Open the wallet url in a window from the dApp
```js
const walletWindow = window.open(WALLET_URL, 'wallet', 'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=500, height=600');
```
3. Wait for the wallet to load, it will post a `'ready'` message when it's ready to handle requests
```js
window.addEventListener('message', (e) => {
  if (e.data) {
    switch (e.data.method) {
      case 'ready': {
        // ...
        break;
      }
    }
  }
});
```
4. Send an `'addFunds'` or `'sendCustomTransaction'` request
```js
walletWindow.postMessage({
  method: 'addFunds',
  params: {
    pubkey: '7q4tpevKWZFSXszPfnvWDuuE19EhSnsAmt5x4MqCyyVb',
    amount: 150,
    network: 'https://api.beta.testnet.solana.com',
  },
}, WALLET_URL);

or 

walletWindow.postMessage({
  method: 'sendCustomTransaction',
  params: {
    description: "Description of transaction",
    format: 'JSON',
    transaction: `[
                      {
                          "keys": [
                              {
                                  "pubkey": "9dpzQrAWRJet26mFt2pt4PXGv9J3uUj7onSTBuJYXXdZ",
                                  "isSigner": true,
                                  "isDebitable": true
                              },
                          ],
                          "programId": "11111111111111111111111111111111",
                          "data": "000000003c00000000000000a90000000000000038ca84e115c5fec729ff33b77202760da632a30633f95c529a4c223c3ed6142a"
                      },
                      {
                          "keys": [
                              {
                                  "pubkey": "9dpzQrAWRJet26mFt2pt4PXGv9J3uUj7onSTBuJYXXdZ",
                                  "isSigner": true,
                                  "isDebitable": false
                              },
                              {
                                  "pubkey": "Sysca11Current11111111111111111111111111111",
                                  "isSigner": false,
                                  "isDebitable": false
                              }
                          ],
                          "programId": "4pgwX1zWz8NaegwTcH1YmntCdVn7qdXwZkxqgDN7P6cR",
                          "data": "010000000a00000000000000320000000000000000000000000000000000000000000000"
                      }
                  ]`,
    network: 'https://api.beta.testnet.solana.com',
  },
}, WALLET_URL);
```

The `sendCustomTransaction` request accepts a transaction in JSON format containing only the `TransactionInstruction` set. Field `data` must be in HEX, `programId` and `pubkey` must be in Base58

5. Listen for an `'addFundsResponse'` event which will include the amount transferred and the transaction signature. And listen for an `'sendCustomTransactionResponse'` event which will include the transaction signature
```js 
window.addEventListener('message', (e) => {
  // ...
  switch (e.data.method) {
    case 'ready': {
      // ...
      break;
    }
    case 'addFundsResponse': {
      const {amount, signature} = e.data.params;
      // ...
      break;
    }
    case 'sendCustomTransactionResponse': {
      const {signature} = e.data.params;
      // ...
      break;
    }
  }
});
```
