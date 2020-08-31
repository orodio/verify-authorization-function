import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import FlowApp from "@zondax/ledger-flow";

const scheme = 0x301;
const EXAMPLE_PATH = `m/44'/1'/${scheme}/0/0`;

const getTransport = async () => {
    let transport = null;
    log(`Trying to connect via WebUSB...`);
    try {
      transport = await TransportWebUSB.create();
    } catch (e) {
      log(e);
    }
    return transport;
};

export const getVersion = async () => {
    const transport = await getTransport();

    try {
      const app = new FlowApp(transport);

      // now it is possible to access all commands in the app
      log("Sending Request..");
      const response = await app.getVersion();
      if (response.returnCode !== FlowApp.ErrorCode.NoError) {
        log(`Error [${response.returnCode}] ${response.errorMessage}`);
        return;
      }

      log("Response received!");
      log(`App Version ${response.major}.${response.minor}.${response.patch}`);
      log(`Device Locked: ${response.deviceLocked}`);
      log(`Test mode: ${response.testMode}`);
      log("Full response:");
      log(response);
    } finally {
      transport.close();
    }
}

const log = (l) => console.log(l)

export const appInfo = async () => {
    const transport = await getTransport();
    try {
      const app = new FlowApp(transport);

      // now it is possible to access all commands in the app
      log("Sending Request..");
      const response = await app.appInfo();
      if (response.returnCode !== FlowApp.ErrorCode.NoError) {
        log(`Error [${response.returnCode}] ${response.errorMessage}`);
        return;
      }

      log("Response received!");
      log(response);
    } finally {
      transport.close();
    }
}

export const getAddressAndPublicKey = async () => {
    const transport = await getTransport();
    try {
      const app = new FlowApp(transport);

      let response = await app.getVersion();
      log(`App Version ${response.major}.${response.minor}.${response.patch}`);
      log(`Device Locked: ${response.deviceLocked}`);
      log(`Test mode: ${response.testMode}`);

      log("Sending Request..");
      response = await app.getAddressAndPubKey(EXAMPLE_PATH);
      if (response.returnCode !== FlowApp.ErrorCode.NoError) {
        log(`Error [${response.returnCode}] ${response.errorMessage}`);
        return;
      }
      return response;
    } finally {
      transport.close();
    }
}

export const showAddress = async () => {
    const transport = await getTransport();
    try {
      const app = new FlowApp(transport);

      let response = await app.getVersion();
      log(`App Version ${response.major}.${response.minor}.${response.patch}`);
      log(`Device Locked: ${response.deviceLocked}`);
      log(`Test mode: ${response.testMode}`);

      // now it is possible to access all commands in the app
      log("Sending Request..");
      log("Please click in the device");
      response = await app.showAddressAndPubKey(EXAMPLE_PATH);
      if (response.returnCode !== FlowApp.ErrorCode.NoError) {
        log(`Error [${response.returnCode}] ${response.errorMessage}`);
        return;
      }

      log("Response received!");
      log("Full response:");
      log(response);
    } finally {
      transport.close();
    }
}

export const signTransaction = async (tx) => {
    const transport = await getTransport();
    try {
      const app = new FlowApp(transport);

      let response = await app.getVersion();
      log(`App Version ${response.major}.${response.minor}.${response.patch}`);
      log(`Device Locked: ${response.deviceLocked}`);
      log(`Test mode: ${response.testMode}`);

      const message = Buffer.from(tx, "hex");
      log("Sending Request..");
      response = await app.sign(EXAMPLE_PATH, message);

      log("Response received!");
      log("Full response:");
      log(response);
    } finally {
      transport.close();
    }
}
