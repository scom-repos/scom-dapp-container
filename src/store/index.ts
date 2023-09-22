import {
  application
} from '@ijstech/components';
import {
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

export async function connectWallet(state: State, walletPlugin: string, triggeredByUser: boolean = false):Promise<IWallet> {
  let wallet = Wallet.getClientInstance();
  if (triggeredByUser || state.isFirstLoad) {
    let provider = state.getWalletPluginProvider(walletPlugin);
    if (provider?.installed()) {
      await wallet.connect(provider, {
        userTriggeredConnect: triggeredByUser
      });
    }
    state.isFirstLoad = false;
  }
  return wallet;
}

export async function switchNetwork(state: State, chainId: number) {
  const rpcWallet = state.getRpcWallet();
  if (!rpcWallet) return;
  await rpcWallet.switchNetwork(chainId);
}

export async function logoutWallet() {
  const wallet = Wallet.getClientInstance();
  await wallet.disconnect();
  localStorage.setItem('walletProvider', '');
  application.EventBus.dispatch(EventId.IsWalletDisconnected, false);
}

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
export function getWallet() {
  return Wallet.getInstance();
};
export function getWalletProvider() {
  return localStorage.getItem('walletProvider') || '';
};

export class State {
  networkMap: { [key: number]: IExtendedNetwork } = {};
  defaultChainId: number = 0;
  infuraId: string = "";
  wallets: IWalletPlugin[] = [];
  walletPluginMap: Record<string, IWalletPlugin> = {};
  rpcWalletId: string = "";
  isFirstLoad: boolean = true;

  constructor() {
  }

  update(data: IDappContainerData) {
    if (data.defaultChainId) this.defaultChainId = data.defaultChainId;
    if (data.networks) this.setNetworkList(data.networks);
    if (data.wallets) this.wallets = data.wallets;
    if (data.rpcWalletId) {
      this.rpcWalletId = data.rpcWalletId;
    }
    if (!Wallet.getClientInstance().chainId && data.defaultChainId) { //FIXME: make sure there's data
      const clientWalletConfig: IClientWalletConfig = {
        defaultChainId: this.defaultChainId,
        networks: Object.values(this.networkMap),
        infuraId: this.infuraId,
        multicalls: getMulticallInfoList()
      }
      Wallet.getClientInstance().initClientWallet(clientWalletConfig);
    }
  }

  async initWalletPlugins() {
    let wallet: any = Wallet.getClientInstance();
    let networkList = this.getSiteSupportedNetworks();
    const rpcs: { [chainId: number]: string } = {}
    for (const network of networkList) {
      let rpc = network.rpcUrls[0];
      if (rpc) rpcs[network.chainId] = rpc;
    }
  
    for (let walletPlugin of this.wallets) {
      let pluginName = walletPlugin.name;
      let providerOptions;
      if (pluginName == WalletPlugin.WalletConnect) {
        providerOptions = {
          name: pluginName,
          infuraId: this.infuraId,
          bridge: "https://bridge.walletconnect.org",
          rpc: rpcs,
          useDefaultProvider: true
        }
      }
      else {
        providerOptions = {
          name: pluginName,
          infuraId: this.infuraId,
          rpc: rpcs,
          useDefaultProvider: true
        }
      }
      let clientSideProvider = this.getWalletPluginProvider(pluginName);
      if (!clientSideProvider) {
        let provider = await createWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, {}, providerOptions);
        this.walletPluginMap[pluginName] = {
          name: pluginName,
          packageName: walletPlugin.packageName,
          provider
        };
      }
    }
  }

  private setNetworkList(networkList: INetworkConfig[], infuraId?: string) {
    const wallet = Wallet.getClientInstance();
    this.networkMap = {};
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
      this.networkMap[network.chainId] = {
        ...networkInfo,
        ...network
      };
      wallet.setNetworkInfo(this.networkMap[network.chainId]);
    }
  }

  getSupportedWalletProviders(): IClientSideProvider[] {
    const providers = this.wallets.map(v => this.walletPluginMap[v.name]?.provider);
    return providers.filter(provider => provider);
  }

  getSiteSupportedNetworks() {
    let networkFullList = Object.values(this.networkMap);
    let list = networkFullList.filter(network =>
      !network.isDisabled
    );
    return list
  }

  getNetworkInfo = (chainId: number): IExtendedNetwork | undefined => {
    return this.networkMap[chainId];
  }

  getWalletPluginProvider(name: string) {
    return this.walletPluginMap[name]?.provider;
  }
  
  getRpcWallet() {
    return Wallet.getRpcWalletInstance(this.rpcWalletId);
  }

  getChainId() {
    const rpcWallet = this.getRpcWallet();
    return rpcWallet?.chainId;
  };

  hasMetaMask() {
    const provider = this.getWalletPluginProvider(WalletPlugin.MetaMask);
    return provider?.installed() || false
  }  
}

export const viewOnExplorerByTxHash = (state: State, chainId: number, txHash: string) => {
  let network = state.getNetworkInfo(chainId);
  if (network && network.explorerTxUrl) {
    let url = `${network.explorerTxUrl}${txHash}`;
    window.open(url);
  }
}

export const viewOnExplorerByAddress = (state: State, chainId: number, address: string) => {
  let network = state.getNetworkInfo(chainId);
  if (network && network.explorerAddressUrl) {
    let url = `${network.explorerAddressUrl}${address}`;
    window.open(url);
  }
}