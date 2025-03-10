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
  StackLayout,
  Image,
  Icon,
} from '@ijstech/components';
import { Constants, IEventBusRegistry, Wallet } from '@ijstech/eth-wallet';
import { formatNumber, darkTheme, lightTheme, updateTheme, getThemeVars } from './utils/index';
import styleClass, { walletModalStyle } from './header.css';
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
import { IExtendedNetwork, ITheme } from './interface';
import { ConnectWalletModule } from './connectWalletModule';
import translations from './translations.json';

const Theme = Styles.Theme.ThemeVars;

@customElements('dapp-container-header')
export class DappContainerHeader extends Module {
  private state: State;
  private pnlNetwork: StackLayout;
  private imgNetwork: Image;
  private lblNetwork: Label;
  private pnlNetworkMobile: StackLayout;
  private iconNetwork: Icon;
  private hsBalance: HStack;
  private lblBalance: Label;
  private pnlWalletDetail: Panel;
  private pnlWalletAddress: StackLayout;
  private lblWalletAddress: Label;
  private pnlWalletMobile: StackLayout;
  private mdWalletDetail: Modal;
  private btnConnectWallet: Button;
  private mdNetwork: Modal;
  private connectWalletModule: ConnectWalletModule
  private mdAccount: Modal;
  private lblNetworkDesc: Label;
  private lblWalletAddress2: Label;
  private hsViewAccount: HStack;
  private gridNetworkGroup: GridLayout;
  private switchTheme: Switch;
  private pnlWallet: HStack;

  private $eventBus: IEventBus;
  private selectedNetwork: IExtendedNetwork | undefined;
  private networkMapper: Map<number, HStack>;
  private currActiveNetworkId: number;
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
  private observer: ResizeObserver;
  private _theme: any;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  };

  get theme() {
    return this._theme;
  }

  set theme(value: any) {
    this._theme = value;
  }

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

  set enableThemeToggle(value: boolean) {
    this.switchTheme.visible = value;
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
    this.i18n.init({...translations});
    super.init();
    this.$eventBus = application.EventBus;
    this.registerEvent();
    this.isInited = true;
    this.classList.add(styleClass);
    this.initTheme();
    this.observer = new ResizeObserver((entries) => {
      if (this.getBoundingClientRect().width > 570) {
        this.btnConnectWallet.caption = "$connect_wallet";
        this.pnlNetwork.visible = true;
        this.pnlNetworkMobile.visible = false;
        this.pnlWalletAddress.visible = true;
        this.pnlWalletMobile.visible = false;
      } else {
        this.btnConnectWallet.caption = "$connect";
        this.pnlNetwork.visible = false;
        this.pnlNetworkMobile.visible = true;
        this.pnlWalletAddress.visible = false;
        this.pnlWalletMobile.visible = true;
      }
    });
    this.observer.observe(this);
  }

  setState(state: State) {
    this.state = state;
  }

  async reloadWalletsAndNetworks() {
    const chainId = this.state.getChainId();
    this.selectedNetwork = this.selectedNetwork || this.state.getNetworkInfo(chainId);
    if (this.connectWalletModule) await this.connectWalletModule.renderWalletList();
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
      if (!this.lblWalletAddress.isConnected) await this.lblWalletAddress.ready();
      this.lblWalletAddress.caption = this.shortlyAddress;
      if (!this.lblWalletAddress2.isConnected) await this.lblWalletAddress2.ready();
      this.lblWalletAddress2.caption = this.shortlyAddress;
      const walletChainId = this.state.getChainId();
      const networkInfo = this.state.getNetworkInfo(walletChainId);
      this.hsViewAccount.visible = !!networkInfo?.explorerAddressUrl;
    } else {
      this.hsViewAccount.visible = false;
    }
    if (!this.lblNetwork.isConnected) await this.lblNetwork.ready();
    if (!this.imgNetwork.isConnected) await this.imgNetwork.ready();
    const isSupportedNetwork = this.selectedNetwork && this.supportedNetworks.findIndex(network => network.chainId === this.selectedNetwork.chainId) !== -1;
    if (isSupportedNetwork) {
      const img = this.selectedNetwork?.image ? this.selectedNetwork.image : '';
      this.imgNetwork.url = img || "";
      this.imgNetwork.visible = true;
      this.iconNetwork.image = new Image(this, { width: 26, height: 26, url: img || "" });
      this.lblNetwork.caption = this.selectedNetwork?.chainName ?? "";
    } else {
      this.imgNetwork.visible = false;
      this.iconNetwork.name = "question-circle";
      this.lblNetwork.caption = "$unsupported_network";
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
      if (this.connectWalletModule) this.connectWalletModule.updateDot(connected);
    }
  }

  updateList(isConnected: boolean) {
    if (isConnected && getWalletProvider() !== WalletPlugin.MetaMask) {
      this.lblNetworkDesc.caption = "$we_support_the_following_networks_please_switch_network_in_the_connected_wallet";
    } else {
      this.lblNetworkDesc.caption = "$we_support_the_following_networks_please_click_to_connect";
    }
    this.updateDot(isConnected, 'wallet');
    this.updateDot(isConnected, 'network');
  }
  
  private async initConnectWalletModule(title: string) {
    let isFirstLoad = false;
    if (!this.connectWalletModule) {
      this.connectWalletModule = new ConnectWalletModule();
      this.connectWalletModule.onWalletConnected = () => {
        this.connectWalletModule.closeModal();
      }
      isFirstLoad = true;
    }
    this.connectWalletModule.setState(this.state);
    const modal = this.connectWalletModule.openModal({
      title: title,
      class: walletModalStyle,
      width: 440,
      border: { radius: 10 }
    });
    if (isFirstLoad) {
      if (this.theme) updateTheme(modal, this.theme);
      await this.connectWalletModule.renderWalletList();
      modal.refresh();
    }
  }

  openConnectModal = () => {
    this.initConnectWalletModule('$connect_wallet');
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
    this.initConnectWalletModule('$switch_wallet');
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
    const parent = this.closest('i-scom-dapp-container') as any;
    if (parent) {
      parent.theme = this.switchTheme.checked ? 'light' : 'dark';
      parent.initTag({
        light: getThemeVars(lightTheme),
        dark: getThemeVars(darkTheme) 
      })
    }
  }

  render() {
    return (
      <i-panel
        padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
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
            <i-panel margin={{ right: '0.5rem' }} cursor="pointer" onClick={this.openNetworkModal}>
              <i-stack
                id="pnlNetwork"
                height={32}
                direction="horizontal"
                alignItems="center"
                justifyContent="center"
                background={{color: Theme.colors.secondary.main}}
                padding={{ left: '0.75rem', right: '0.75rem' }}
                border={{ radius: 12 }}
                gap={6}
              >
                <i-image id="imgNetwork" width={26} height={26} stack={{ shrink: '0' }}></i-image>
                <i-label id="lblNetwork" caption="$unsupported_network" font={{ color: Theme.colors.secondary.contrastText }}></i-label>
              </i-stack>
              <i-stack
                id="pnlNetworkMobile"
                direction="horizontal"
                alignItems="center" 
                background={{ color: Theme.action.selectedBackground }}
                padding={{ right: 10 }}
                border={{ radius: 16 }}
                gap={6}
                visible={false}
              >
                <i-stack
                  height={32}
                  width={32}
                  direction="horizontal"
                  alignItems="center"
                  justifyContent="center"
                  background={{ color: Theme.background.paper }}
                  border={{ radius: '50%' }}
                >
                  <i-icon id="iconNetwork" width={26} height={26} stack={{ shrink: '0' }}></i-icon>
                </i-stack>
                <i-icon width={13} height={13} name="chevron-down"></i-icon>
              </i-stack>
            </i-panel>
            <i-hstack
              id="hsBalance"
              height={32}
              visible={false}
              horizontalAlignment="center"
              verticalAlignment="center"
              background={{ color: Theme.colors.primary.main }}
              border={{ radius: 12 }}
              padding={{ left: '0.75rem', right: '0.75rem' }}
            >
              <i-label id="lblBalance" font={{ color: Theme.colors.primary.contrastText }}></i-label>
            </i-hstack>
            <i-panel id="pnlWalletDetail" visible={false}>
              <i-panel margin={{ left: '0.5rem' }} cursor="pointer" onClick={this.openWalletDetailModal}>
                <i-stack
                  id="pnlWalletAddress"
                  height={32}
                  direction="horizontal"
                  alignItems="center"
                  justifyContent="center"
                  background={{ color: Theme.background.gradient }}
                  padding={{ left: '0.75rem', right: '0.75rem' }}
                  border={{ radius: 12 }}
                >
                  <i-label id="lblWalletAddress" font={{ color: Theme.colors.error.contrastText }}></i-label>
                </i-stack>
                <i-stack
                  id="pnlWalletMobile"
                  direction="horizontal"
                  alignItems="center" 
                  background={{ color: Theme.action.selectedBackground }}
                  padding={{ right: 10 }}
                  border={{ radius: 16 }}
                  gap={6}
                  visible={false}
                >
                  <i-stack
                    height={32}
                    width={32}
                    direction="horizontal"
                    alignItems="center"
                    justifyContent="center"
                    background={{ color: Theme.background.gradient }}
                    border={{ radius: '50%' }}
                  >
                    <i-icon width={18} height={18} name="wallet"></i-icon>
                  </i-stack>
                  <i-icon width={13} height={13} name="chevron-down"></i-icon>
                </i-stack>
              </i-panel>
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
                    caption="$account"
                    width="100%"
                    height="auto"
                    border={{ radius: 12 }}
                    font={{ color: Theme.colors.error.contrastText }}
                    background={{ color: Theme.colors.error.light }}
                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                    onClick={this.openAccountModal}
                  ></i-button>
                  <i-button
                    caption="$switch_wallet"
                    width="100%"
                    height="auto"
                    border={{ radius: 12 }}
                    font={{ color: Theme.colors.error.contrastText }}
                    background={{ color: Theme.colors.error.light }}
                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                    onClick={this.openSwitchModal}
                  ></i-button>
                  <i-button
                    caption="$logout"
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
              height={32}
              caption="$connect_wallet"
              border={{ radius: 12 }}
              font={{ color: Theme.colors.error.contrastText }}
              background={{ color: Theme.background.gradient }}
              padding={{ top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }}
              onClick={this.openConnectModal}
            ></i-button>
          </i-hstack>
        </i-hstack>
        <i-modal
          id='mdNetwork'
          title='$supported_networks'
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
              caption='$we_support_the_following_networks_please_click_to_connect'
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
          id='mdAccount'
          title='$account'
          class='os-modal'
          width={440}
          height={200}
          closeIcon={{ name: 'times' }}
          border={{ radius: 10 }}
        >
          <i-vstack width="100%" padding={{ top: "1.75rem", bottom: "1rem", left: "2.75rem", right: "2.75rem" }} gap={5}>
            <i-hstack horizontalAlignment="space-between" verticalAlignment='center'>
              <i-label font={{ size: '0.875rem' }} caption='$connected_with' />
              <i-button
                caption='$logout'
                font={{ color: Theme.colors.error.contrastText }}
                background={{ color: Theme.colors.error.light }}
                padding={{ top: 6, bottom: 6, left: 10, right: 10 }}
                border={{ radius: 5 }}
                onClick={this.logout}
              />
            </i-hstack>
            <i-label id="lblWalletAddress2" font={{ size: '1.25rem', bold: true, color: Theme.colors.primary.main }} lineHeight={1.5} />
            <i-hstack verticalAlignment="center" gap="2.5rem">
              <i-hstack
                class="pointer"
                verticalAlignment="center"
                tooltip={{ content: `$the_address_has_been_copied`, trigger: 'click' }}
                gap="0.5rem"
                onClick={this.copyWalletAddress}
              >
                <i-icon
                  name="copy"
                  width="16px"
                  height="16px"
                  fill={Theme.text.secondary}
                ></i-icon>
                <i-label caption="$copy_address" font={{ size: "0.875rem", bold: true }} />
              </i-hstack>
              <i-hstack id="hsViewAccount" class="pointer" verticalAlignment="center" onClick={this.viewOnExplorerByAddress.bind(this)}>
                <i-icon name="external-link-alt" width="16" height="16" fill={Theme.text.secondary} display="inline-block" />
                <i-label caption="$view_on_explorer" margin={{ left: "0.5rem" }} font={{ size: "0.875rem", bold: true }} />
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
