import {
  application
} from '@ijstech/components';
import {
  Erc20, 
  IClientProviderOptions, 
  IClientSideProvider, 
  IClientSideProviderEvents, 
  ISendTxEventsOptions, 
  IWallet, 
  MetaMaskProvider, 
  Wallet, 
  Web3ModalProvider,
  IClientWalletConfig
} from '@ijstech/eth-wallet';
import { IDappContainerData, IExtendedNetwork, INetworkConfig, IWalletPlugin } from '../interface';
import getNetworkList from '@scom/scom-network-list';
import {getMulticallInfoList} from '@scom/scom-multicall';

export enum WalletPlugin {
  MetaMask = 'metamask',
  WalletConnect = 'walletconnect',
}

export const enum EventId {
  ConnectWallet = 'connectWallet',
  IsWalletConnected = 'isWalletConnected',
  chainChanged = 'chainChanged',
  IsWalletDisconnected = "IsWalletDisconnected"
};

export function isClientWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

async function createWalletPluginConfigProvider(
  wallet: Wallet, 
  pluginName: string, 
  packageName?: string,
  events?: IClientSideProviderEvents, 
  options?: IClientProviderOptions
) {
  switch (pluginName) {
    case WalletPlugin.MetaMask:
      return new MetaMaskProvider(wallet, events, options);
    case WalletPlugin.WalletConnect:
      return new Web3ModalProvider(wallet, events, options);
    default: {
      if (packageName) {
        const provider: any = await application.loadPackage(packageName, '*');
        return new provider(wallet, events, options);
      }
    }
  }
} 

export async function initWalletPlugins(eventHandlers?: { [key: string]: Function }) {
  let wallet: any = Wallet.getClientInstance();
  let networkList = getSiteSupportedNetworks();
  const rpcs: { [chainId: number]: string } = {}
  for (const network of networkList) {
    let rpc = network.rpcUrls[0];
    if (rpc) rpcs[network.chainId] = rpc;
  }

  for (let walletPlugin of state.wallets) {
    let pluginName = walletPlugin.name;
    let providerOptions;
    if (pluginName == WalletPlugin.WalletConnect) {
      providerOptions = {
        name: pluginName,
        infuraId: getInfuraId(),
        bridge: "https://bridge.walletconnect.org",
        rpc: rpcs,
        useDefaultProvider: true
      }
    }
    else {
      providerOptions = {
        name: pluginName,
        infuraId: getInfuraId(),
        rpc: rpcs,
        useDefaultProvider: true
      }
    }
    let clientSideProvider = getWalletPluginProvider(pluginName);
    if (!clientSideProvider) {
      let provider = await createWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, {}, providerOptions);
      setWalletPluginProvider(pluginName, {
        name: pluginName,
        packageName: walletPlugin.packageName,
        provider
      });
    }
  }
}

export async function connectWallet(walletPlugin: string, triggeredByUser: boolean = false):Promise<IWallet> {
  let wallet = Wallet.getClientInstance();
  if (triggeredByUser || state.isFirstLoad) {
    let provider = getWalletPluginProvider(walletPlugin);
    if (provider?.installed()) {
      await wallet.connect(provider);
    }
    state.isFirstLoad = false;
  }
  return wallet;
}

export async function switchNetwork(chainId: number) {
  const rpcWallet = getRpcWallet();
  await rpcWallet.switchNetwork(chainId);
  application.EventBus.dispatch(EventId.chainChanged, chainId);
}

export async function logoutWallet() {
  const wallet = Wallet.getClientInstance();
  await wallet.disconnect();
  localStorage.setItem('walletProvider', '');
  application.EventBus.dispatch(EventId.IsWalletDisconnected, false);
}

export const hasWallet = function () {
  let hasWallet = false;
  const walletPluginMap = getWalletPluginMap();
  for (let pluginName in walletPluginMap) {
    const provider = walletPluginMap[pluginName]?.provider;
    if (provider.installed()) {
      hasWallet = true;
      break;
    } 
  }
  return hasWallet;
}

export const hasMetaMask = function () {
  const provider = getWalletPluginProvider(WalletPlugin.MetaMask);
  return provider?.installed() || false
}

export const truncateAddress = (address: string) => {
  if (address === undefined || address === null) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

export const getSupportedWallets = () => {
  return state.wallets;
}

export const getSupportedWalletProviders = (): IClientSideProvider[] => {
  const walletPluginMap = getWalletPluginMap();
  const providers = state.wallets.map(v => walletPluginMap[v.name]?.provider);
  return providers.filter(provider => provider);
}

export interface ITokenObject {
  address?: string;
  name: string;
  decimals: number;
  symbol: string;
  status?: boolean | null;
  logoURI?: string;
  isCommon?: boolean | null;
  balance?: string | number;
  isNative?: boolean | null;
};

export function registerSendTxEvents(sendTxEventHandlers: ISendTxEventsOptions) {
  const wallet = Wallet.getClientInstance();
  wallet.registerSendTxEvents({
    transactionHash: (error: Error, receipt?: string) => {
      if (sendTxEventHandlers.transactionHash) {
        sendTxEventHandlers.transactionHash(error, receipt);
      }
    },
    confirmation: (receipt: any) => {
      if (sendTxEventHandlers.confirmation) {
        sendTxEventHandlers.confirmation(receipt);
      }
    },
  })
};
export function getChainId() {
  const rpcWallet = getRpcWallet();
  return rpcWallet?.chainId;
};
export function getWallet() {
  return Wallet.getInstance();
};
export function getWalletProvider() {
  return localStorage.getItem('walletProvider') || '';
};
export function getErc20(address: string) {
  const wallet = getWallet();
  return new Erc20(wallet, address);
};
const state = {
  networkMap: {} as { [key: number]: IExtendedNetwork },
  defaultChainId: 0,
  infuraId: "",
  env: "",
  wallets: [] as IWalletPlugin[],
  walletPluginMap: {} as Record<string, IWalletPlugin>,
  rpcWalletId: "",
  isFirstLoad: true
}

export const updateStore = (data: IDappContainerData) => {
  if (data.defaultChainId) setDefaultChainId(data.defaultChainId);
  if (data.networks) setNetworkList(data.networks);
  if (data.wallets) setWalletList(data.wallets);
  if (data.rpcWalletId) {
    state.rpcWalletId = data.rpcWalletId;
  }
  if (!Wallet.getClientInstance().chainId && data.defaultChainId) { //FIXME: make sure there's data
    const clientWalletConfig: IClientWalletConfig = {
      defaultChainId: state.defaultChainId,
      networks: Object.values(state.networkMap),
      infuraId: state.infuraId,
      multicalls: getMulticallInfoList()
    }
    Wallet.getClientInstance().initClientWallet(clientWalletConfig);
  }
}
const setWalletList = (wallets: IWalletPlugin[]) => {
  state.wallets = wallets;
}
const setNetworkList = (networkList: INetworkConfig[], infuraId?: string) => {
  const wallet = Wallet.getClientInstance();
  state.networkMap = {};
  const defaultNetworkList = getNetworkList();
  const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
    acc[cur.chainId] = cur;
    return acc;
  }, {});
  for (let network of networkList) {
    const networkInfo = defaultNetworkMap[network.chainId];
    if (!networkInfo) continue;
    if (infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
      for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
        networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
      }
    }
    state.networkMap[network.chainId] = {
      ...networkInfo,
      ...network
    };
    wallet.setNetworkInfo(state.networkMap[network.chainId]);
  }
}

export const getNetworkInfo = (chainId: number): IExtendedNetwork | undefined => {
  return state.networkMap[chainId];
}


export const viewOnExplorerByTxHash = (chainId: number, txHash: string) => {
  let network = getNetworkInfo(chainId);
  if (network && network.explorerTxUrl) {
    let url = `${network.explorerTxUrl}${txHash}`;
    window.open(url);
  }
}

export const viewOnExplorerByAddress = (chainId: number, address: string) => {
  let network = getNetworkInfo(chainId);
  if (network && network.explorerAddressUrl) {
    let url = `${network.explorerAddressUrl}${address}`;
    window.open(url);
  }
}

export const getNetworkType = (chainId: number) => {
  let network = getNetworkInfo(chainId);
  return network?.explorerName ?? 'Unknown';
}

const setDefaultChainId = (chainId: number) => {
  state.defaultChainId = chainId;
}

export const getDefaultChainId = () => {
  return state.defaultChainId;
}

export const getSiteSupportedNetworks = () => {
  let networkFullList = Object.values(state.networkMap);
  let list = networkFullList.filter(network =>
    !network.isDisabled && isValidEnv(network.env)
  );
  return list
}

export const isValidEnv = (env: string) => {
  const _env = state.env === 'testnet' || state.env === 'mainnet' ? state.env : "";
  return !_env || !env || env === _env;
}

const setInfuraId = (infuraId: string) => {
  state.infuraId = infuraId;
}

export const getInfuraId = () => {
  return state.infuraId;
}

const setEnv = (env: string) => {
  state.env = env;
}

export const getEnv = () => {
  return state.env;
}

export const setWalletPluginProvider = (name: string, wallet: IWalletPlugin) => {
  state.walletPluginMap[name] = wallet;
}

export const getWalletPluginMap = () => {
  return state.walletPluginMap;
}

export const getWalletPluginProvider = (name: string) => {
  return state.walletPluginMap[name]?.provider;
}

export const getRpcWallet = () => {
  return Wallet.getRpcWalletInstance(state.rpcWalletId);
}