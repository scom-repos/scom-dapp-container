import {
  application
} from '@ijstech/components';
import {Erc20, IClientProviderOptions, IClientSideProvider, IClientSideProviderEvents, ISendTxEventsOptions, IWallet, MetaMaskProvider, Wallet, Web3ModalProvider } from '@ijstech/eth-wallet';
import { IDappContainerData, IWalletPlugin } from '../interface';

export interface INetwork {
  chainId: number;
  name: string;
  img?: string;
  rpc?: string;
	symbol?: string;
	env?: string;
  explorerName?: string;
  explorerTxUrl?: string;
  explorerAddressUrl?: string;
  isDisabled?: boolean;
};

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

export function isWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

async function getWalletPluginConfigProvider(
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
  const events = {
    onAccountChanged: (account: string) => {
      if (eventHandlers && eventHandlers.accountsChanged) {
        eventHandlers.accountsChanged(account);
      }
      const connected = !!account;
      if (connected) {
        localStorage.setItem('walletProvider', Wallet.getClientInstance()?.clientSideProvider?.name || '');
      }
      application.EventBus.dispatch(EventId.IsWalletConnected, connected);
    },
    onChainChanged: (chainIdHex: string) => {
      const chainId = Number(chainIdHex);

      if (eventHandlers && eventHandlers.chainChanged) {
        eventHandlers.chainChanged(chainId);
      }
      application.EventBus.dispatch(EventId.chainChanged, chainId);
    }
  }
  let networkList = getSiteSupportedNetworks();
  const rpcs: { [chainId: number]: string } = {}
  for (const network of networkList) {
    let rpc = network.rpc
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
    let provider = await getWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, events, providerOptions);
    setWalletPluginProvider(pluginName, {
      name: pluginName,
      packageName: walletPlugin.packageName,
      provider
    });
  }
}

export async function connectWallet(walletPlugin: string):Promise<IWallet> {
  let wallet = Wallet.getClientInstance();
  // if (!wallet.chainId) {
  //   wallet.chainId = getDefaultChainId();
  // }
  let provider = getWalletPluginProvider(walletPlugin);
  if (provider?.installed()) {
    await wallet.connect(provider);
  }
  return wallet;
}

export async function switchNetwork(chainId: number) {
  if (!isWalletConnected()) {
    application.EventBus.dispatch(EventId.chainChanged, chainId);
    return;
  }
  const wallet = Wallet.getClientInstance();
  if (wallet?.clientSideProvider?.name === WalletPlugin.MetaMask) {
    await wallet.switchNetwork(chainId);
  }
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
    const provider = walletPluginMap[pluginName].provider;
    if (provider.installed()) {
      hasWallet = true;
      break;
    } 
  }
  return hasWallet;
}

export const hasMetaMask = function () {
  const provider = getWalletPluginProvider(WalletPlugin.MetaMask);
  return provider.installed();
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
  return state.wallets.map(v => walletPluginMap[v.name].provider);
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
const networks: INetwork[] = [
  {
    name: "Ethereum",
    chainId: 1,
    img: "eth",
    rpc: "https://mainnet.infura.io/v3/{InfuraId}",
    symbol: "ETH",
    env: "mainnet",
    explorerName: "Etherscan",
    explorerTxUrl: "https://etherscan.io/tx/",
    explorerAddressUrl: "https://etherscan.io/address/"
  },
  {
    name: "Kovan Test Network",
    chainId: 42,
    img: "eth",
    rpc: "https://kovan.infura.io/v3/{InfuraId}",
    symbol: "ETH",
    env: "testnet",
    explorerName: "Etherscan",
    explorerTxUrl: "https://kovan.etherscan.io/tx/",
    explorerAddressUrl: "https://kovan.etherscan.io/address/"
  },
  {
    name: "Binance Smart Chain",
    chainId: 56,
    img: "bsc",
    rpc: "https://bsc-dataseed.binance.org/",
    symbol: "BNB",
    env: "mainnet",
    explorerName: "BSCScan",
    explorerTxUrl: "https://bscscan.com/tx/",
    explorerAddressUrl: "https://bscscan.com/address/"
  },
  {
    name: "Polygon",
    chainId: 137,
    img: "polygon",
    symbol: "MATIC",
    env: "mainnet",
    explorerName: "PolygonScan",
    explorerTxUrl: "https://polygonscan.com/tx/",
    explorerAddressUrl: "https://polygonscan.com/address/"
  },
  {
    name: "Fantom Opera",
    chainId: 250,
    img: "ftm",
    rpc: "https://rpc.ftm.tools/",
    symbol: "FTM",
    env: "mainnet",
    explorerName: "FTMScan",
    explorerTxUrl: "https://ftmscan.com/tx/",
    explorerAddressUrl: "https://ftmscan.com/address/"
  },
  {
    name: "BSC Testnet",
    chainId: 97,
    img: "bsc",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    symbol: "BNB",
    env: "testnet",
    explorerName: "BSCScan",
    explorerTxUrl: "https://testnet.bscscan.com/tx/",
    explorerAddressUrl: "https://testnet.bscscan.com/address/"
  },
  {
    name: "Amino Testnet",
    chainId: 31337,
    img: "amio",
    symbol: "ACT",
    env: "testnet"
  },
  {
    name: "Avalanche FUJI C-Chain",
    chainId: 43113,
    img: "avax",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    symbol: "AVAX",
    env: "testnet",
    explorerName: "SnowTrace",
    explorerTxUrl: "https://testnet.snowtrace.io/tx/",
    explorerAddressUrl: "https://testnet.snowtrace.io/address/"
  },
  {
    name: "Mumbai",
    chainId: 80001,
    img: "polygon",
    rpc: "https://matic-mumbai.chainstacklabs.com",
    symbol: "MATIC",
    env: "testnet",
    explorerName: "PolygonScan",
    explorerTxUrl: "https://mumbai.polygonscan.com/tx/",
    explorerAddressUrl: "https://mumbai.polygonscan.com/address/"
  },
  {
    name: "Fantom Testnet",
    chainId: 4002,
    img: "ftm",
    rpc: "https://rpc.testnet.fantom.network/",
    symbol: "FTM",
    env: "testnet",
    explorerName: "FTMScan",
    explorerTxUrl: "https://testnet.ftmscan.com/tx/",
    explorerAddressUrl: "https://testnet.ftmscan.com/address/"
  },
  {
    name: "AminoX Testnet",
    chainId: 13370,
    img: "amio",
    symbol: "ACT",
    env: "testnet",
    explorerName: "AminoX Explorer",
    explorerTxUrl: "https://aminoxtestnet.blockscout.alphacarbon.network/tx/",
    explorerAddressUrl: "https://aminoxtestnet.blockscout.alphacarbon.network/address/"
  }
];
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
  return Wallet.getInstance().chainId;
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
  networkMap: {} as { [key: number]: INetwork },
  defaultChainId: 0,
  infuraId: "",
  env: "",
  wallets: [] as IWalletPlugin[],
  walletPluginMap: {} as Record<string, IWalletPlugin>
}

export const updateStore = (data: IDappContainerData) => {
  setNetworkList(data.networks);
  setWalletList(data.wallets);
}
const setWalletList = (wallets: IWalletPlugin[]) => {
  state.wallets = wallets;
}
const setNetworkList = (chainIds: number[], infuraId?: string) => {
  state.networkMap = {};
  const networkList = networks.filter(v => chainIds.includes(v.chainId));
  networkList.forEach(network => {
    const rpc = infuraId && network.rpc ? network.rpc.replace(/{InfuraId}/g, infuraId) : network.rpc;
    state.networkMap[network.chainId] = { ...network, isDisabled: true, rpc };
  })
  if (Array.isArray(networkList)) {
    for (let network of networkList) {
      if (infuraId && network.rpc) {
        network.rpc = network.rpc.replace(/{InfuraId}/g, infuraId);
      }
      Object.assign(state.networkMap[network.chainId], { isDisabled: false, ...network });
    }
  }
}

export const getNetworkInfo = (chainId: number): INetwork | undefined => {
  return state.networkMap[chainId];
}

export const getNetworkList = () => {
  return Object.values(state.networkMap);
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
  return state.walletPluginMap[name].provider;
}