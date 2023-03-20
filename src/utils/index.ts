import { application, Module } from '@ijstech/components';
import { BigNumber } from '@ijstech/eth-wallet';
import { ICodeInfoFileContent } from '../interface';
import { match, MatchFunction } from './pathToRegexp';

const IPFS_SCOM_URL = "https://ipfs.scom.dev/ipfs";

interface IGetModuleOptions {
  ipfscid?: string;
  localPath?: string;
}

async function fetchFileContentByCid(ipfsCid: string): Promise<Response | undefined> {
  let response;
  try {
    response = await fetch(`${IPFS_SCOM_URL}/${ipfsCid}`);
  } catch (err) {
    const IPFS_Gateway = 'https://ipfs.io/ipfs/{CID}';
    response = await fetch(IPFS_Gateway.replace('{CID}', ipfsCid));
  }
  return response;
};

async function getSCConfigByCodeCid(codeCid: string) {
  let scConfig;
  try {
    let scConfigRes = await fetchFileContentByCid(`${codeCid}/dist/scconfig.json`);
    if (scConfigRes) scConfig = await scConfigRes.json();
  } catch (err) { }
  return scConfig;
}

const formatNumber = (value: any, decimals?: number) => {
  let val = value;
  const minValue = '0.0000001';
  if (typeof value === 'string') {
    val = new BigNumber(value).toNumber();
  } else if (typeof value === 'object') {
    val = value.toNumber();
  }
  if (val != 0 && new BigNumber(val).lt(minValue)) {
    return `<${minValue}`;
  }
  return formatNumberWithSeparators(val, decimals || 4);
};


const formatNumberWithSeparators = (value: number, precision?: number) => {
  if (!value) value = 0;
  if (precision) {
    let outputStr = '';
    if (value >= 1) {
      outputStr = value.toLocaleString('en-US', { maximumFractionDigits: precision });
    }
    else {
      outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
    }

    if (outputStr.length > 18) {
      outputStr = outputStr.substr(0, 18) + '...'
    }
    return outputStr;
  }
  else {
    return value.toLocaleString('en-US');
  }
}

const getModule = async (rootDir: string, options: IGetModuleOptions) => {
  let module: Module;
  if (options.localPath) {
      const localRootPath = rootDir ? `${rootDir}/${options.localPath}` : options.localPath;
      const scconfigRes = await fetch(`${localRootPath}/scconfig.json`);
      const scconfig = await scconfigRes.json();
      scconfig.rootDir = localRootPath;
      module = await application.newModule(scconfig.main, scconfig);
  }
  else {
    const response = await fetchFileContentByCid(options.ipfscid);
    const result: ICodeInfoFileContent = await response.json();
    const codeCID = result.codeCID;
    const scConfig = await getSCConfigByCodeCid(codeCID);
    if (!scConfig) return;
    const main: string = scConfig.main;
    if (main.startsWith("@")) {
      scConfig.rootDir = `${IPFS_SCOM_URL}/${codeCID}/dist`;
      module = await application.newModule(main, scConfig);
    } else {
      const root = `${IPFS_SCOM_URL}/${codeCID}/dist`;
      const mainScriptPath = main.replace('{root}', root);
      const dependencies = scConfig.dependencies;
      for (let key in dependencies) {
        dependencies[key] = dependencies[key].replace('{root}', root);
      }
      module = await application.newModule(mainScriptPath, { dependencies });
    }
  }
  return module;
}


export {
  IPFS_SCOM_URL,
  fetchFileContentByCid,
  getSCConfigByCodeCid,
  formatNumber,
  formatNumberWithSeparators,
  match,
  MatchFunction,
  IGetModuleOptions,
  getModule
}