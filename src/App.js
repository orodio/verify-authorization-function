import React from "react";
import * as fcl from "@onflow/fcl";

// CONFIGURE ACCESS NODE
fcl.config().put("accessNode.api", "http://localhost:8080");

// CONFIGURE WALLET
// replace with your own wallets configuration
// Below is the local environment configuration for the dev-wallet
fcl
  .config()
  .put("challenge.handshake", "http://localhost:8701/flow/authenticate");

// CONFIGURE AUTHORIZATION FUNCTION
// replace with your authorization function.
const AUTHORIZATION_FUNCTION = fcl.currentUser().authorization;

const verify = async () => {
  try {
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
  return (
    <div>
      <button onClick={verify}>Verify</button>
    </div>
  );
}

export default App;
