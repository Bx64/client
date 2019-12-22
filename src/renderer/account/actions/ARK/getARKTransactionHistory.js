import fetch from 'node-fetch';
import uuid from 'uuid/v4';
import { omit } from 'lodash';

import getArkNetwork from 'shared/util/ARK/getNetwork';

import { ARK, ASSETS } from 'shared/values/assets';

const TX_TYPES = {
  SEND: 'Send',
  RECEIVE: 'Receive',
  CLAIM: 'Claim',
  INVOCATION: 'Invocation'
};

function parseAbstractData(data, currentUserAddress) {
  const parsedTxType = (abstract) => {
    if (abstract.recipient === currentUserAddress) {
      return TX_TYPES.RECEIVE;
    }
    return TX_TYPES.SEND;
  };

  return data.map((abstract) => {
    const asset = { ...ASSETS[ARK], scriptHash: ARK };
    const type = parsedTxType(abstract);
    const summary = {
      to: abstract.recipient,
      isNetworkFee: abstract.recipient === 'fees',
      from: abstract.sender,
      txId: abstract.id,
      time: abstract.timestamp.unix,
      amount: Number((parseFloat(abstract.amount, 10) / 1e8).toFixed(8)).toString(),
      asset,
      label: abstract.recipient === currentUserAddress ? 'IN' : 'OUT',
      type,
      id: uuid()
    };
    return summary;
  });
}

export default async function getARKTransactionHistory({
  net,
  coinType,
  address,
  previousCall = {}
}) {
  const { page_number: pageNumber = 0, total_pages: totalPages = 1, entries = [] } = previousCall;
  const pageCount = pageNumber + 1;
  if (pageCount > totalPages) return previousCall;

  const api = getArkNetwork({ coinType, net });

  const data = await fetch(`${api}/wallets/${address}/transactions`);
  const response = await data.json();

  if (response.statusCode === 404) {
    return { entries: [] };
  }

  const object = {
    ...omit(response, 'data'),
    entries: [...entries, ...parseAbstractData(response.data, address)]
  };
  return object;
}
