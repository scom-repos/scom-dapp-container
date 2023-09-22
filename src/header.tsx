import {
  customElements,
  Module,
  Control,
  ControlElement,
  Styles,
  Button,
  Modal,
  observable,
  Label,
  Panel,
  application,
  IEventBus,
  HStack,
  GridLayout,
  Container,
  Switch,
  FormatUtils,
} from '@ijstech/components';
import { Constants, IEventBusRegistry, Wallet } from '@ijstech/eth-wallet';
import { formatNumber, darkTheme, lightTheme } from './utils/index';
import styleClass from './header.css';
import {
  isClientWalletConnected,
  connectWallet,
  logoutWallet,
  switchNetwork,
  getWalletProvider,
  viewOnExplorerByAddress,
  WalletPlugin,
  State
} from './store/index';
import { IExtendedNetwork } from './interface';

const Theme = Styles.Theme.ThemeVars;

@customElements('dapp-container-header')
export class DappContainerHeader extends Module {
  private state: State;
  private btnNetwork: Button;
  private hsBalance: HStack;
  private lblBalance: Label;
  private pnlWalletDetail: Panel;
  private btnWalletDetail: Button;
  private mdWalletDetail: Modal;
  private btnConnectWallet: Button;
  private mdNetwork: Modal;
  private mdConnect: Modal;
  private mdAccount: Modal;
  private lblNetworkDesc: Label;
  private lblWalletAddress: Label;
  private hsViewAccount: HStack;
  private gridWalletList: GridLayout;
  private gridNetworkGroup: GridLayout;
  private switchTheme: Switch;
  private pnlWallet: HStack;

  private $eventBus: IEventBus;
  private selectedNetwork: IExtendedNetwork | undefined;
  private networkMapper: Map<number, HStack>;
  private walletMapper: Map<string, HStack>;
  private currActiveNetworkId: number;
  private currActiveWallet: string;
  private supportedNetworks: IExtendedNetwork[] = [];
  isInited: boolean = false;
  @observable()
  private walletInfo = {
    address: '',
    balance: '',
    networkId: 0
  }
  private _showWalletNetwork: boolean = true;
  private walletEvents: IEventBusRegistry[] = [];

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  };

  get symbol() {
    let symbol = '';
    if (this.selectedNetwork?.chainId && this.selectedNetwork?.symbol) {
      symbol = this.selectedNetwork?.symbol;
    }
    return symbol;
  }

  get shortlyAddress() {
    const address = this.walletInfo.address;
    if (!address) return 'No address selected';
    return FormatUtils.truncateWalletAddress(address);
  }

  get showWalletNetwork() {
    return this._showWalletNetwork ?? true;
  }
  set showWalletNetwork(value: boolean) {
    this._showWalletNetwork = value;
    this.pnlWallet.visible = this.showWalletNetwork;
  }

  onHide() {
    let clientWallet = Wallet.getClientInstance();
    for (let event of this.walletEvents) {
      clientWallet.unregisterWalletEvent(event);
    }
    this.walletEvents = [];
  }

  registerEvent() {
    let clientWallet = Wallet.getClientInstance();
    this.walletEvents.push(clientWallet.registerWalletEvent(this, Constants.ClientWalletEvent.AccountsChanged, async (payload: Record<string, any>) => {
      const { userTriggeredConnect, account } = payload;
      let connected = !!account;
      if (connected) {
          this.walletInfo.address = clientWallet.address;
          // this.walletInfo.balance = formatNumber((await wallet.balance).toFixed(), 2);
          const rpcWallet = this.state.getRpcWallet();
          const balance = await rpcWallet.balanceOf(clientWallet.address);
          this.walletInfo.balance = formatNumber(balance.toFixed(), 2);
        }
        this.updateConnectedStatus(connected);
        this.updateList(connected);
    }));
  }

  async init() {
    if (this.isInited) return;
    super.init();
    this.$eventBus = application.EventBus;
    this.registerEvent();
    this.isInited = true;
    this.classList.add(styleClass);
    this.initTheme();
  }

  setState(state: State) {
    this.state = state;
  }

  async reloadWalletsAndNetworks() {
    const chainId = this.state.getChainId();
    this.selectedNetwork = this.selectedNetwork || this.state.getNetworkInfo(chainId);
    await this.renderWalletList();
    this.renderNetworks();
    const rpcWallet = this.state.getRpcWallet();
    let clientWallet = Wallet.getClientInstance();
    const isConnected = isClientWalletConnected();
    if (!isConnected) {
      let selectedProvider = localStorage.getItem('walletProvider');
      if (!selectedProvider && this.state.hasMetaMask()) {
        selectedProvider = WalletPlugin.MetaMask;
      }
      await connectWallet(this.state, selectedProvider);
      if (rpcWallet) rpcWallet.address = clientWallet.address;
    }
    if (isConnected) {
      this.walletInfo.address = clientWallet.address;
      const walletChainId = chainId;
      this.walletInfo.networkId = walletChainId;
      if (rpcWallet) {
        const balance = await rpcWallet.balanceOf(clientWallet.address);
        this.walletInfo.balance = formatNumber(balance.toFixed(), 2);
      }
      else {
        this.walletInfo.balance = formatNumber((await clientWallet.balance).toFixed(), 2); //To be removed
      }
    }
    this.updateConnectedStatus(isConnected);
  }

  onChainChanged = async (chainId: number) => {
    this.walletInfo.networkId = chainId;
    this.selectedNetwork = this.state.getNetworkInfo(chainId);
    let clientWallet = Wallet.getClientInstance();
    const isConnected = clientWallet.isConnected;
    const rpcWallet = this.state.getRpcWallet();
    const balance = await rpcWallet.balanceOf(clientWallet.address);
    this.walletInfo.balance = formatNumber(balance.toFixed(), 2);
    this.updateConnectedStatus(isConnected);
    this.updateList(isConnected);
  };

  updateConnectedStatus = async (isConnected: boolean) => {
    if (isConnected) {
      if (!this.lblBalance.isConnected) await this.lblBalance.ready();
      this.lblBalance.caption = `${this.walletInfo.balance} ${this.symbol}`;
      if (!this.btnWalletDetail.isConnected) await this.btnWalletDetail.ready();
      this.btnWalletDetail.caption = this.shortlyAddress;
      if (!this.lblWalletAddress.isConnected) await this.lblWalletAddress.ready();
      this.lblWalletAddress.caption = this.shortlyAddress;
      const walletChainId = this.state.getChainId();
      const networkInfo = this.state.getNetworkInfo(walletChainId);
      this.hsViewAccount.visible = !!networkInfo?.explorerAddressUrl;
    } else {
      this.hsViewAccount.visible = false;
    }
    if (!this.btnNetwork.isConnected) await this.btnNetwork.ready();
    const isSupportedNetwork = this.selectedNetwork && this.supportedNetworks.findIndex(network => network.chainId === this.selectedNetwork.chainId) !== -1;
    if (isSupportedNetwork) {
      const img = this.selectedNetwork?.image ? this.selectedNetwork.image : '';
      this.btnNetwork.icon = img ? <i-icon width={26} height={26} image={{ url: img }} ></i-icon> : undefined;
      this.btnNetwork.caption = this.selectedNetwork?.chainName ?? "";
    } else {
      this.btnNetwork.icon = undefined;
      this.btnNetwork.caption = "Unsupported Network";
    }
    this.btnConnectWallet.visible = !isConnected;
    this.hsBalance.visible = isConnected;
    this.pnlWalletDetail.visible = isConnected;
  }

  updateDot(connected: boolean, type: 'network' | 'wallet') {
    if (type === 'network') {
      const walletChainId = this.state.getChainId();
      if (this.currActiveNetworkId !== undefined && this.currActiveNetworkId !== null && this.networkMapper.has(this.currActiveNetworkId)) {
        this.networkMapper.get(this.currActiveNetworkId).classList.remove('is-actived');
      }
      if (connected && this.networkMapper.has(walletChainId)) {
        this.networkMapper.get(walletChainId).classList.add('is-actived');
      }
      this.currActiveNetworkId = walletChainId;
    } else {
      const wallet = Wallet.getClientInstance();
      if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
        this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
      }
      if (connected && this.walletMapper.has(wallet.clientSideProvider?.name)) {
        this.walletMapper.get(wallet.clientSideProvider?.name).classList.add('is-actived');
      }
      this.currActiveWallet = wallet.clientSideProvider?.name;
    }
  }

  updateList(isConnected: boolean) {
    if (isConnected && getWalletProvider() !== WalletPlugin.MetaMask) {
      this.lblNetworkDesc.caption = "We support the following networks, please switch network in the connected wallet.";
    } else {
      this.lblNetworkDesc.caption = "We support the following networks, please click to connect.";
    }
    this.updateDot(isConnected, 'wallet');
    this.updateDot(isConnected, 'network');
  }

  openConnectModal = () => {
    this.mdConnect.title = "Connect wallet"
    this.mdConnect.visible = true;
  }

  openNetworkModal = () => {
    this.mdNetwork.visible = true;
  }

  openWalletDetailModal = () => {
    this.mdWalletDetail.visible = true;
  }

  openAccountModal = (target: Control, event: Event) => {
    event.stopPropagation();
    this.mdWalletDetail.visible = false;
    this.mdAccount.visible = true;
  }

  openSwitchModal = (target: Control, event: Event) => {
    event.stopPropagation();
    this.mdWalletDetail.visible = false;
    this.mdConnect.title = "Switch wallet";
    this.mdConnect.visible = true;
  }

  logout = async (target: Control, event: Event) => {
    event.stopPropagation();
    this.mdWalletDetail.visible = false;
    await logoutWallet();
    this.updateConnectedStatus(false);
    this.updateList(false);
    this.mdAccount.visible = false;
  }

  viewOnExplorerByAddress() {
    const walletChainId = this.state.getChainId();
    viewOnExplorerByAddress(this.state, walletChainId, this.walletInfo.address)
  }

  async switchNetwork(chainId: number) {
    if (!chainId) return;
    await switchNetwork(this.state, chainId);
    this.mdNetwork.visible = false;
  }

  openLink(link: any) {
    return window.open(link, '_blank');
  };

  connectToProviderFunc = async (walletPlugin: string) => {
    const provider = this.state.getWalletPluginProvider(walletPlugin);
    if (provider?.installed()) {
      await connectWallet(this.state, walletPlugin, true);
    }
    else {
      let homepage = provider.homepage;
      this.openLink(homepage);
    }
    this.mdConnect.visible = false;
  }

  copyWalletAddress = () => {
    application.copyToClipboard(this.walletInfo.address || "");
  }

  isWalletActive(walletPlugin) {
    const provider = this.state.getWalletPluginProvider(walletPlugin);
    return provider ? provider.installed() && Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
  }

  isNetworkActive(chainId: number) {
    const walletChainId = this.state.getChainId();
    return walletChainId === chainId;
  }

  renderWalletList = async () => {
    await this.state.initWalletPlugins();
    this.gridWalletList.clearInnerHTML();
    this.walletMapper = new Map();
    const walletList = this.state.getSupportedWalletProviders();
    walletList.forEach((wallet) => {
      const isActive = this.isWalletActive(wallet.name);
      if (isActive) this.currActiveWallet = wallet.name;
      const hsWallet = (
        <i-hstack
          class={isActive ? 'is-actived list-item' : 'list-item'}
          verticalAlignment='center'
          gap={12}
          background={{ color: Theme.colors.secondary.light }}
          border={{ radius: 10 }} position="relative"
          padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
          horizontalAlignment="space-between"
          onClick={() => this.connectToProviderFunc(wallet.name)}
        >
          <i-label
            caption={wallet.displayName}
            margin={{ left: '1rem' }}
            wordBreak="break-word"
            font={{ size: '.875rem', bold: true, color: Theme.colors.secondary.contrastText }}
          />
          <i-image width={34} height="auto" url={wallet.image || ''} />
        </i-hstack>
      );
      this.walletMapper.set(wallet.name, hsWallet);
      this.gridWalletList.append(hsWallet);
    })
  }

  renderNetworks() {
    this.gridNetworkGroup.clearInnerHTML();
    this.networkMapper = new Map();
    this.supportedNetworks = this.state.getSiteSupportedNetworks();
    this.gridNetworkGroup.append(...this.supportedNetworks.map((network) => {
      const img = network.image ? <i-image url={network.image || ''} width={34} height={34} /> : [];
      const isActive = this.isNetworkActive(network.chainId);
      if (isActive) this.currActiveNetworkId = network.chainId;
      const hsNetwork = (
        <i-hstack
          onClick={() => this.switchNetwork(network.chainId)}
          background={{ color: Theme.colors.secondary.light }}
          border={{ radius: 10 }}
          position="relative"
          class={isActive ? 'is-actived list-item' : 'list-item'}
          padding={{ top: '0.65rem', bottom: '0.65rem', left: '0.5rem', right: '0.5rem' }}
        >
          <i-hstack margin={{ left: '1rem' }} verticalAlignment="center" gap={12}>
            {img}
            <i-label caption={network.chainName} wordBreak="break-word" font={{ size: '.875rem', bold: true, color: Theme.colors.secondary.contrastText }} />
          </i-hstack>
        </i-hstack>
      );
      this.networkMapper.set(network.chainId, hsNetwork);
      return hsNetwork;
    }));
  }

  private onThemeChanged() {
    const parent = this.closest('i-scom-dapp-container') as any;
    if (parent) {
      parent.theme = this.switchTheme.checked ? 'light' : 'dark';
    }
  }

  private initTheme() {
    const getThemeVars = (theme: 'light' | 'dark') => {
      const themeVars = theme === 'light' ? lightTheme : darkTheme;
      return {
        fontColor: themeVars.text.primary,
        backgroundColor: themeVars.background.main,
        inputFontColor: themeVars.input.fontColor,
        inputBackgroundColor: themeVars.input.background,
        buttonBackgroundColor: themeVars.colors.primary.main,
        buttonFontColor: themeVars.colors.primary.contrastText,
        modalColor: themeVars.background.modal,
        secondaryColor: themeVars.colors.secondary.main,
        secondaryFontColor: themeVars.colors.secondary.contrastText,
        textSecondary: themeVars.text.secondary,
        primaryButtonBackground: themeVars.buttons.primary.background,
        primaryButtonHoverBackground: themeVars.buttons.primary.hoverBackground,
        primaryButtonDisabledBackground: themeVars.buttons.primary.disabledBackground,
        maxButtonBackground: themeVars.buttons.secondary.background,
        maxButtonHoverBackground: themeVars.buttons.secondary.hoverBackground
      }
    }
    const parent = this.closest('i-scom-dapp-container') as any;
    if (parent) {
      parent.theme = this.switchTheme.checked ? 'light' : 'dark';
      parent.initTag({
        light: getThemeVars('light'),
        dark: getThemeVars('dark') 
      })
    }
  }

  render() {
    return (
      <i-panel
        padding={{ top: '0.5rem', bottom: '0.5rem', left: '1.75rem', right: '1.75rem' }}
        background={{color: Theme.background.modal}}
      >
        <i-hstack verticalAlignment='center' horizontalAlignment='space-between' gap="0.5rem">
          <i-panel>
            <i-switch
              id="switchTheme"
              checkedText='☼'
              uncheckedText='☾'
              checkedThumbColor={"transparent"}
              uncheckedThumbColor={"transparent"}
              class="custom-switch"
              onChanged={this.onThemeChanged.bind(this)}
            ></i-switch>
          </i-panel>
          <i-hstack id="pnlWallet" verticalAlignment='center' horizontalAlignment='end'>
            <i-button
              id="btnNetwork"
              margin={{ right: '0.5rem' }}
              padding={{ top: '0.45rem', bottom: '0.45rem', left: '0.75rem', right: '0.75rem' }}
              border={{ radius: 12 }}
              font={{ color: Theme.colors.secondary.contrastText }}
              background={{color: Theme.colors.secondary.main}}
              onClick={this.openNetworkModal}
              caption={"Unsupported Network"}
            ></i-button>
            <i-hstack
              id="hsBalance"
              visible={false}
              horizontalAlignment="center"
              verticalAlignment="center"
              background={{ color: Theme.colors.primary.main }}
              border={{ radius: 12 }}
              padding={{ top: '0.45rem', bottom: '0.45rem', left: '0.75rem', right: '0.75rem' }}
            >
              <i-label id="lblBalance" font={{ color: Theme.colors.primary.contrastText }}></i-label>
            </i-hstack>
            <i-panel id="pnlWalletDetail" visible={false}>
              <i-button
                id="btnWalletDetail"
                padding={{ top: '0.45rem', bottom: '0.45rem', left: '0.75rem', right: '0.75rem' }}
                margin={{ left: '0.5rem' }}
                border={{ radius: 12 }}
                font={{ color: Theme.colors.error.contrastText }}
                background={{ color: Theme.background.gradient }}
                onClick={this.openWalletDetailModal}
              ></i-button>
              <i-modal
                id="mdWalletDetail"
                class="wallet-modal"
                height="auto"
                maxWidth={200}
                showBackdrop={false}
                popupPlacement="bottomRight"
              >
                <i-vstack gap={15} padding={{ top: 10, left: 10, right: 10, bottom: 10 }}>
                  <i-button
                    caption="Account"
                    width="100%"
                    height="auto"
                    border={{ radius: 12 }}
                    font={{ color: Theme.colors.error.contrastText }}
                    background={{ color: Theme.colors.error.light }}
                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                    onClick={this.openAccountModal}
                  ></i-button>
                  <i-button
                    caption="Switch wallet"
                    width="100%"
                    height="auto"
                    border={{ radius: 12 }}
                    font={{ color: Theme.colors.error.contrastText }}
                    background={{ color: Theme.colors.error.light }}
                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                    onClick={this.openSwitchModal}
                  ></i-button>
                  <i-button
                    caption="Logout"
                    width="100%"
                    height="auto"
                    border={{ radius: 12 }}
                    font={{ color: Theme.colors.error.contrastText }}
                    background={{ color: Theme.colors.error.light }}
                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                    onClick={this.logout}
                  ></i-button>
                </i-vstack>
              </i-modal>
            </i-panel>
            <i-button
              id="btnConnectWallet"
              height={38}
              caption="Connect Wallet"
              border={{ radius: 12 }}
              font={{ color: Theme.colors.error.contrastText }}
              background={{ color: Theme.background.gradient }}
              padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
              onClick={this.openConnectModal}
            ></i-button>
          </i-hstack>
        </i-hstack>
        <i-modal
          id='mdNetwork'
          title='Supported Network'
          class='os-modal'
          width={440}
          closeIcon={{ name: 'times' }}
          border={{ radius: 10 }}
        >
          <i-vstack
            height='100%' lineHeight={1.5}
            padding={{ left: '1rem', right: '1rem', bottom: '2rem' }}
          >
            <i-label
              id='lblNetworkDesc'
              margin={{ top: '1rem' }}
              font={{ size: '.875rem' }}
              wordBreak="break-word"
              caption='We support the following networks, please click to connect.'
            ></i-label>
            <i-hstack
              margin={{ left: '-1.25rem', right: '-1.25rem' }}
              height='100%'
            >
              <i-grid-layout
                id='gridNetworkGroup'
                font={{ color: '#f05e61' }}
                height="calc(100% - 160px)"
                width="100%"
                overflow={{ y: 'auto' }}
                margin={{ top: '1.5rem' }}
                padding={{ left: '1.25rem', right: '1.25rem' }}
                columnsPerRow={1}
                templateRows={['max-content']}
                class='list-view'
                gap={{ row: '0.5rem' }}
              ></i-grid-layout>
            </i-hstack>
          </i-vstack>
        </i-modal>
        <i-modal
          id='mdConnect'
          title='Connect Wallet'
          class='os-modal'
          width={440}
          closeIcon={{ name: 'times' }}
          border={{ radius: 10 }}
        >
          <i-vstack padding={{ left: '1rem', right: '1rem', bottom: '2rem' }} lineHeight={1.5}>
            <i-label
              font={{ size: '.875rem' }}
              caption='Recommended wallet for Chrome'
              margin={{ top: '1rem' }}
              wordBreak="break-word"
            ></i-label>
            <i-panel>
              <i-grid-layout
                id='gridWalletList'
                class='list-view'
                margin={{ top: '0.5rem' }}
                columnsPerRow={1}
                templateRows={['max-content']}
                gap={{ row: 8 }}
              >
              </i-grid-layout>
            </i-panel>
          </i-vstack>
        </i-modal>
        <i-modal
          id='mdAccount'
          title='Account'
          class='os-modal'
          width={440}
          height={200}
          closeIcon={{ name: 'times' }}
          border={{ radius: 10 }}
        >
          <i-vstack width="100%" padding={{ top: "1.75rem", bottom: "1rem", left: "2.75rem", right: "2.75rem" }} gap={5}>
            <i-hstack horizontalAlignment="space-between" verticalAlignment='center'>
              <i-label font={{ size: '0.875rem' }} caption='Connected with' />
              <i-button
                caption='Logout'
                font={{ color: Theme.colors.error.contrastText }}
                background={{ color: Theme.colors.error.light }}
                padding={{ top: 6, bottom: 6, left: 10, right: 10 }}
                border={{ radius: 5 }}
                onClick={this.logout}
              />
            </i-hstack>
            <i-label id="lblWalletAddress" font={{ size: '1.25rem', bold: true, color: Theme.colors.primary.main }} lineHeight={1.5} />
            <i-hstack verticalAlignment="center" gap="2.5rem">
              <i-hstack
                class="pointer"
                verticalAlignment="center"
                tooltip={{ content: `The address has been copied`, trigger: 'click' }}
                gap="0.5rem"
                onClick={this.copyWalletAddress}
              >
                <i-icon
                  name="copy"
                  width="16px"
                  height="16px"
                  fill={Theme.text.secondary}
                ></i-icon>
                <i-label caption="Copy Address" font={{ size: "0.875rem", bold: true }} />
              </i-hstack>
              <i-hstack id="hsViewAccount" class="pointer" verticalAlignment="center" onClick={this.viewOnExplorerByAddress.bind(this)}>
                <i-icon name="external-link-alt" width="16" height="16" fill={Theme.text.secondary} display="inline-block" />
                <i-label caption="View on Explorer" margin={{ left: "0.5rem" }} font={{ size: "0.875rem", bold: true }} />
              </i-hstack>
            </i-hstack>
          </i-vstack>
        </i-modal>
      </i-panel>
    )
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['dapp-container-header']: ControlElement;
    }
  }
}
