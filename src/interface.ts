import { IClientSideProvider, INetwork } from "@ijstech/eth-wallet";

interface IWalletPlugin {
  name: string;
  packageName?: string;
  provider?: IClientSideProvider;
}

interface IDappContainerContent {
  module: IPageBlockData;
  properties: any;
  tag?: any;
}

interface IDappContainerData {
  defaultChainId?: number;
  networks: IExtendedNetwork[];
  wallets: IWalletPlugin[];
  showHeader?: boolean;
  content?: IDappContainerContent;
  tag?: any;
}

interface IPageBlockData {
  name: string;
  description: string;
  ipfscid: string;
  imgUrl: string;
  localPath?: string;
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

enum EVENT {
  'UPDATE_TAG' = 'UPDATE_TAG'
}

interface IExtendedNetwork extends INetwork {
	symbol?: string;
	env?: string;
	explorerName?: string;
	explorerTxUrl?: string;
	explorerAddressUrl?: string;
	isDisabled?: boolean;
};

export {
  IWalletPlugin,
  IPageBlockData,
  IDappContainerContent,
  IDappContainerData,
  ICodeInfoFileContent,
  EVENT,
  IExtendedNetwork
}