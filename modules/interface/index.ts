import { WalletPlugin } from "@ijstech/eth-wallet";

interface IDappContainerData {
  networks: number[];
  wallets: WalletPlugin[];
  module: IPageBlockData;
  content: any;
  tag?: any;
}

interface IPageBlockData {
  name: string;
  description: string;
  ipfscid: string;
  imgUrl: string;
}

interface ICodeInfoFileContent {
  version: ISemanticVersion;
  codeCID: string;
  source: string;
}

interface ISemanticVersion {
  major: number;
  minor: number;
  patch: number;
}

export {
  IPageBlockData,
  IDappContainerData,
  ICodeInfoFileContent
}