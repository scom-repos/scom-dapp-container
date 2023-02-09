import { WalletPlugin } from "@ijstech/eth-wallet";

interface IDappContainerContent {
  module: IPageBlockData;
  properties: any;
  tag?: any;
}

interface IDappContainerData {
  networks: number[];
  wallets: WalletPlugin[];
  content: IDappContainerContent;
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
  IDappContainerContent,
  IDappContainerData,
  ICodeInfoFileContent
}