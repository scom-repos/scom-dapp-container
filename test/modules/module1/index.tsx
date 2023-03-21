import { Module, customModule, Container, VStack, application } from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';

@customModule
export default class Module1 extends Module {
    private dapp: ScomDappContainer;
    private mainStack: VStack;
    private _content: any;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        this._content = {
            "module": {
                "chainId": 43113,
                "projectId": 3,
                "packageId": 16,
                "name": "@scom/scom-nft-minter",
                "description": "Donation / NFT Minter Micro-DApp",
                "ipfscid": "bafkreigfrhybx24tzcu3ke6iutzoroyygb6lcvgygritz63urfbw3ydpzm",
                "localPath": "libs/@scom/scom-nft-minter",
                "local": true,
                "imgUrl": "ipfs://bafkreid4yhtwe3qz7lzvafzzt3q4ssdowzg2rpbrd6xqjanivyd7bkcsiy",
                "category": [
                    {
                        "idx": "5",
                        "name": "Others",
                        "icon": "bolt"
                    }
                ]
            },
            "properties": {
                "name": "Donation Dapp",
                "chainId": 43113,
                "productType": "DonateToEveryone",
                "description": "#### If you'd like to support my work and help me create more exciting content, you can now make a donation using OSWAP. Your donation will help me continue creating high-quality videos and projects, and it's much appreciated. Thank you for your support, and please feel free to contact me if you have any questions or feedback.",
                "link": "",
                "hideDescription": true,
                "logo": "ipfs://bafkreid4rgdbomv7lbboqo7kvmyruwulotrvqslej4jbwmd2ruzkmn4xte",
                "maxOrderQty": 1,
                "maxPrice": "0",
                "price": "0",
                "qty": 999999999,
                "tokenAddress": "0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C",
                "token": {
                    "name": "OpenSwap",
                    "address": "0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C",
                    "symbol": "OSWAP",
                    "decimals": 18,
                    "isCommon": true
                },
                "productId": 1,
                "donateTo": "0xb15E094957c31D6b0d08714015fF85Bec7842635"
            }
        }
    }
    async getEmbedElement(path: string) {
        application.currentModuleDir = path;
        await application.loadScript(`${path}/index.js`);
        application.currentModuleDir = '';
        const elementName = `i-${path.split('/').pop()}`;
        const element = document.createElement(elementName);
        return element;
    }
    
    async init() {
        super.init();
        // const gemContent = {
        //     "module": {
        //         "chainId": 43113,
        //         "projectId": 3,
        //         "packageId": 16,
        //         "name": "@PageBlock/Gem Token",
        //         "description": "pageblock-gem-token",
        //         "ipfscid": "bafkreibuoupfmvq4x7cg7qufzxsbzqmnlzoq5shdbqipyxm4jhklblp55q",
        //         "imgUrl": "data:image/png;base64,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",
        //         "category": [
        //             {
        //                 "idx": "5",
        //                 "name": "Others",
        //                 "icon": "bolt"
        //             }
        //         ]
        //     },
        //     "properties": {
        //         "name": "ELON",
        //         "dappType": "buy",
        //         "description": "Welcome fellow gamers! Are you looking to enhance your gaming experience and get an edge over your competition? Look no further than Gem Tokens!  Gem Tokens are a new form of in-game currency that can be used to unlock special items, boost your character's abilities, and access exclusive features. With Gem Tokens, you can upgrade your gaming experience and get ahead in the game.",
        //         "symbol": "ELON",
        //         "cap": "999999999999",
        //         "redemptionFee": "0.05",
        //         "price": "1",
        //         "mintingFee": "0.025",
        //         "token": {
        //             "name": "OpenSwap",
        //             "address": "0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C",
        //             "symbol": "OSWAP",
        //             "decimals": 18,
        //             "isCommon": true
        //         },
        //         "contract": "0xCfF0d71140E9f4201b9151978BA1097732BbC36A"
        //     },
        //     "tag": {
        //         "backgroundColor": "#000000"
        //     }
        // }
        this.dapp = await ScomDappContainer.create({
            showHeader: false,
            // height: 391,
            // width: 1180,
            "networks": [
                43113
            ],
            "wallets": [
                "metamask"
            ],
            "content": this._content
        });
        this.mainStack.appendChild(this.dapp);
    }

    render() {
        return <i-panel>
            <i-hstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-scom-dapp-container
                    networks={[43113]}
                    wallets={["metamask"]}
                    content={this._content}
                    width={1176}
                ></i-scom-dapp-container>
            </i-hstack>
        </i-panel>
    }
}