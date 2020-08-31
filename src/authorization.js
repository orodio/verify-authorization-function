import * as fcl from "@onflow/fcl";
import { getAddressAndPublicKey, signTransaction } from "./ledgerIntegration";

// current cadded AuthAccount constructor (what you use to create an account on flow)
// requires a public key to be in a certain format. That format is an rlp encoded value
// that encodes the key itself, what curve it uses, how the signed values are hashed
// and the keys weight.
const encodePublicKeyForFlow = publicKey =>
  rlp
    .encode([
      Buffer.from(publicKey, "hex"), // publicKey hex to binary
      2, // P256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
      3, // SHA3-256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
      1000, // give key full weight
    ])
    .toString("hex")

export const authorization = async (account = {}) => {

  // Retrieve address and public key from ledger device
  // const {publicKey, address, returnCode, errorMessage }

  const deviceAccountInfo = await getAddressAndPublicKey();
  console.log(deviceAccountInfo);

  if (deviceAccountInfo.returnCode !== 0x9000) {
    console.error("Failure retrieving address/public key from ledger device");
    return;
  }

  // Encode public key for Flow
  const encodedPublicKey = encodePublicKeyForFlow(deviceAccountInfo.publicKey);

  // Determine key index and sequence number from chain
  var getAccountResponse = await fcl.send(fcl.getAccount(deviceAccountInfo.address));
  var getAccountData = await fcl.decode(getAccountResponse);
  console.log(getAccountData);

  // TODO: Determine keyId and sequence number based on public key

  const keyId = 1;
  let sequenceNum = 0;

  if (account.role.proposer) {
    const response = await fcl.send([fcl.getAccount(deviceAccountInfo.address)]);
    const acct = await fcl.decode(response);
    sequenceNum = acct.keys[keyId].sequenceNumber;
  }

  const signingFunction = async (data) => {
    const signature = await signTransaction(data);
    return {
      address: deviceAccountInfo.address,
      keyId,
      signature: signature,
    };
  };

  return {
    ...account,
    address: deviceAccountInfo.address,
    keyId,
    signingFunction,
    sequenceNum
  };
};
