import { IClientSideProvider, INetwork } from "@ijstech/eth-wallet";

interface IWalletPlugin {
  name: string;
  packageName?: string;
  provider?: IClientSideProvider;
}

// interface IDappContainerContent {
//   module: IPageBlockData;
//   properties: any;
//   tag?: any;
// }

interface IDappContainerData {
  defaultChainId?: number;
  networks?: INetworkConfig[];
  wallets?: IWalletPlugin[];
  showHeader?: boolean;
  showFooter?: boolean;
  showWalletNetwork?: boolean;
  rpcWalletId?: string;
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

interface INetworkConfig {
  chainName?: string;
  chainId: number;
}

export {
  IWalletPlugin,
  IPageBlockData,
  IDappContainerData,
  ICodeInfoFileContent,
  EVENT,
  IExtendedNetwork,
  INetworkConfig
}