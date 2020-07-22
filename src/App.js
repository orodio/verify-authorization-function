import React from "react";
import * as fcl from "@onflow/fcl";
import { authorization } from "./authorization";
import {Magic} from 'magic-sdk';
import { FlowExtension } from '@magic-ext/flow';



// CONFIGURE ACCESS NODE
fcl.config().put("accessNode.api", "https://access-testnet.onflow.org");

// CONFIGURE WALLET
// replace with your own wallets configuration
// Below is the local environment configuration for the dev-wallet
fcl
  .config()
  .put("challenge.handshake", "http://access-001.devnet9.nodes.onflow.org:8000");


const magic = new Magic('YOUR TEST API KEY', {
  extensions: [
    new FlowExtension({
      rpcUrl: 'https://access-testnet.onflow.org'
    })
  ]
});

// CONFIGURE AUTHORIZATION FUNCTION
// replace with your authorization function.
// const AUTHORIZATION_FUNCTION = fcl.currentUser().authorization;
const AUTHORIZATION_FUNCTION = magic.flow.authorization;

const verify = async () => {



  try {

    const getReferenceBlock = async () => {
      const response = await fcl.send([fcl.getLatestBlock()])
      const data = await fcl.decode(response)
      return data.id
    }


    console.log("SENDING TRANSACTION");
    var response = await fcl.send([
      fcl.transaction`
      transaction {
        var acct: AuthAccount

        prepare(acct: AuthAccount) {
          self.acct = acct
        }

        execute {
          log(self.acct.address)
        }
      }
    `,
      fcl.ref(await getReferenceBlock()),
      fcl.proposer(AUTHORIZATION_FUNCTION),
      fcl.authorizations([AUTHORIZATION_FUNCTION]),
      fcl.payer(AUTHORIZATION_FUNCTION)
    ]);
    console.log("TRANSACTION SENT");
    console.log("TRANSACTION RESPONSE", response);

    console.log("WAITING FOR TRANSACTION TO BE SEALED");
    var data = await fcl.tx(response).onceSealed();
    console.log("TRANSACTION SEALED", data);

    if (data.status === 4 && data.statusCode === 0) {
      alert("Congrats!!! I Think It Works");
    } else {
      alert(`Oh No: ${data.errorMessage}`);
    }
  } catch (error) {
    console.error("FAILED TRANSACTION", error);
  }
};


function App() {

  const loginWithMagic = async () => {

    const token = await magic.auth.loginWithMagicLink({email: 'YOUR EMAIL'});
    console.log(token);
  };


  return (
    <div>
      <button onClick={verify}>Verify</button>
      <button onClick={loginWithMagic}>login</button>


    </div>
  );
}

export default App;
