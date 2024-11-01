import { Module, customElements, ControlElement, Styles, GridLayout, HStack } from '@ijstech/components';
import { IClientSideProvider, Wallet } from '@ijstech/eth-wallet';
import { connectWallet, State } from './store';

const Theme = Styles.Theme.ThemeVars;

interface ConnectWalletElement extends ControlElement {
    onWalletConnected?: () => void;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['dapp-container-connect-wallet-module']: ConnectWalletElement;
        }
    }
}

@customElements('dapp-container-connect-wallet-module')
export class ConnectWalletModule extends Module {
    private state: State;
    private gridWalletList: GridLayout;
    private walletMapper: Map<string, HStack>;
    private currActiveWallet: string;
    public onWalletConnected: () => void;

    setState(state: State) {
        this.state = state;
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
        if (this.onWalletConnected) this.onWalletConnected();
    }

    isWalletActive(walletPlugin) {
        const provider = this.state.getWalletPluginProvider(walletPlugin);
        return provider ? provider.installed() && Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
    }

    updateDot(connected: boolean) {
        const wallet = Wallet.getClientInstance();
        if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
          this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
        }
        if (connected && this.walletMapper.has(wallet.clientSideProvider?.name)) {
          this.walletMapper.get(wallet.clientSideProvider?.name).classList.add('is-actived');
        }
        this.currActiveWallet = wallet.clientSideProvider?.name;
    }

    async renderWalletList() {
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

    render() {
        return (
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
        )
    }
}