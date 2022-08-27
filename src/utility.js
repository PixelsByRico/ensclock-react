import Web3 from "web3";
import ensPublicResolverAbi from "./abi/EnsPublicResolver.json";

const moralisEthNode =
  "https://speedy-nodes-nyc.moralis.io/bb898aa02165ac02e978282e/eth/mainnet"; // TODO: add to a config file
const ensPublicResolverAddress = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

export class EnsContract {
  constructor() {
    this.web3 = new Web3(moralisEthNode);
    this.publicResolverContract = new this.web3.eth.Contract(
      ensPublicResolverAbi,
      ensPublicResolverAddress
    );
  }

  async getTextRecord(textRecord, labelHash) {
    return this.publicResolverContract.methods
      .text(labelHash, textRecord)
      .call();
  }
}

export const hexToDec = (hexString) => {
  let s = hexString;
  var i,
    j,
    digits = [0],
    carry;
  for (i = 0; i < s.length; i += 1) {
    carry = parseInt(s.charAt(i), 16);
    for (j = 0; j < digits.length; j += 1) {
      digits[j] = digits[j] * 16 + carry;
      carry = (digits[j] / 10) | 0;
      digits[j] %= 10;
    }
    while (carry > 0) {
      digits.push(carry % 10);
      carry = (carry / 10) | 0;
    }
  }
  return digits.reverse().join("");
};

export const textRecordToUrl = (textRecord, type) => {
  if (type === "uri") {
    if (textRecord.startsWith("http")) {
      return textRecord;
    } else {
      return `http://${textRecord}`;
    }
  }

  if (type === "twitter") {
    if (textRecord.includes("twitter.com")) {
      return textRecord;
    }

    if (textRecord.includes("@")) {
      return `https://twitter.com/${textRecord.replace("@", "")}`;
    } else {
      return `https://twitter.com/${textRecord}`;
    }
  }

  if (type === "github") {
    if (textRecord.includes("github.com")) {
      return textRecord;
    }

    if (textRecord.includes("@")) {
      return `https://github.com/${textRecord.replace("@", "")}`;
    } else {
      return `https://github.com/${textRecord}`;
    }
  }
};
