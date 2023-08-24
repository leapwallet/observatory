/** List of all nodes used for a given chain */
export type chainNodeList = {
  chainName: string;
  nodeList: string[];
  isEcostakeChain: boolean;
  chainId: string;
};

export type chainNodeList2 = {
  chainId: string;
  nodeList: string[];
};

export type chainNodeList2 = {
  chainId: string;
  nodeList: string[];
};

export type chainNodeListJSON = {
  chainNodeList: chainNodeList[];
};

export enum CosmosBlockchain {
  Terra2 = 'terra2',
  CosmosHub = 'cosmosHub',
  Osmosis = 'osmosis',
  Sei = 'sei',
  Mars = 'mars',
  Juno = 'juno',
  Akash = 'akash',
  Axelar = 'axelar',
  EMoney = 'eMoney',
  Persistence = 'persistence',
  Stargaze = 'stargaze',
  Sifchain = 'sifchain',
  Sommelier = 'sommelier',
  Umee = 'umee',
  AssetMantle = 'assetMantle',
  Kujira = 'kujira',
  Injective = 'injective',
  Stride = 'stride',
  Cheqd = 'cheqd',
  LikeCoin = 'likeCoin',
  Chihuahua = 'chihuahua',
  GravityBridge = 'gravityBridge',
  IrisNet = 'irisNet',
  Starname = 'starname',
  Fetch = 'fetchhub',
  Desmos = 'desmos',
  Teritori = 'teritori',
  Agoric = 'agoric',
  Secret = 'secretnetwork',
  Evmos = 'evmos',
  Canto = 'canto',
  Kava = 'kava',
  Crescent = 'crescent',
  OmniFlix = 'omniflixhub',
  BitCanna = 'bitCanna',
  Carbon = 'carbon',
  Cudos = 'cudos',
  Decentr = 'decentr',
  Comdex = 'comdex',
  BitSong = 'bitSong',
  Coreum = 'coreum',
  Kyve = 'kyve',
  Migaloo = 'migaloo',
  Neutron = 'neutron',
  Onomy = 'onomy',
  Quasar = 'quasar',
  Quicksilver = 'quicksilver',
  SeiAtlantic2TestNet = 'seiAtlantic2TestNet',
  Gitopia = 'gitopia',
  Ixo = 'impacthub',
  Jackal = 'jackal',
  Noble = 'noble',
  Nolus = 'nolus',
  Planq = 'planq',
  Chain4Energy = 'chain4energy',
}
