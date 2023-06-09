import { CosmosBlockchain } from '../types';
import { HealthyNodes } from './healthyNodes';
import { Container, Token } from 'typedi';

export namespace BlockchainNodeUrlGetter {
  export class DefaultApi {
    private urlIndices: Record<CosmosBlockchain, number> = {
      [CosmosBlockchain.CosmosHub]: 0,
      [CosmosBlockchain.Osmosis]: 0,
      [CosmosBlockchain.Sei]: 0,
      [CosmosBlockchain.Mars]: 0,
      [CosmosBlockchain.Juno]: 0,
      [CosmosBlockchain.Akash]: 0,
      [CosmosBlockchain.Axelar]: 0,
      [CosmosBlockchain.EMoney]: 0,
      [CosmosBlockchain.Persistence]: 0,
      [CosmosBlockchain.Stargaze]: 0,
      [CosmosBlockchain.Sifchain]: 0,
      [CosmosBlockchain.Sommelier]: 0,
      [CosmosBlockchain.Umee]: 0,
      [CosmosBlockchain.AssetMantle]: 0,
      [CosmosBlockchain.Kujira]: 0,
      [CosmosBlockchain.Injective]: 0,
      [CosmosBlockchain.Stride]: 0,
      [CosmosBlockchain.Cheqd]: 0,
      [CosmosBlockchain.LikeCoin]: 0,
      [CosmosBlockchain.Chihuahua]: 0,
      [CosmosBlockchain.GravityBridge]: 0,
      [CosmosBlockchain.IrisNet]: 0,
      [CosmosBlockchain.Starname]: 0,
      [CosmosBlockchain.Fetch]: 0,
      [CosmosBlockchain.Desmos]: 0,
      [CosmosBlockchain.Teritori]: 0,
      [CosmosBlockchain.Agoric]: 0,
      [CosmosBlockchain.Terra2]: 0,
      [CosmosBlockchain.Secret]: 0,
      [CosmosBlockchain.Evmos]: 0,
      [CosmosBlockchain.Canto]: 0,
      [CosmosBlockchain.Kava]: 0,
      [CosmosBlockchain.Crescent]: 0,
      [CosmosBlockchain.OmniFlix]: 0,
      [CosmosBlockchain.BitCanna]: 0,
      [CosmosBlockchain.Cudos]: 0,
      [CosmosBlockchain.Decentr]: 0,
      [CosmosBlockchain.Carbon]: 0,
      [CosmosBlockchain.Comdex]: 0,
      [CosmosBlockchain.BitSong]: 0,
      [CosmosBlockchain.Coreum]: 0,
      [CosmosBlockchain.Kyve]: 0,
      [CosmosBlockchain.Migaloo]: 0,
      [CosmosBlockchain.Neutron]: 0,
      [CosmosBlockchain.Onomy]: 0,
      [CosmosBlockchain.Quasar]: 0,
      [CosmosBlockchain.Quicksilver]: 0,
      [CosmosBlockchain.SeiAtlantic2TestNet]: 0,
    };

    getCosmosUrl(blockchain: CosmosBlockchain): string {
      // let urlList = this.getUrls(blockchain);
      const healthyNodesFetcher = Container.get(HealthyNodes.token);
      const urlList = healthyNodesFetcher.getNodes(blockchain);

      const url = urlList[this.urlIndices[blockchain]]!;
      // const logger = getLogger(__filename);
      // logger.informational(`${blockchain} url index ${this.urlIndices[blockchain]}.`);
      this.urlIndices[blockchain]++;
      this.urlIndices[blockchain] = this.urlIndices[blockchain] % urlList.length;
      return url;
    }

    public getUrls(blockchain: CosmosBlockchain): string[] {
      switch (blockchain) {
        case CosmosBlockchain.CosmosHub:
          return this.getCosmosHubUrls();
        case CosmosBlockchain.Osmosis:
          return this.getOsmosisUrls();
        case CosmosBlockchain.Sei:
          return this.getSeiUrls();
        case CosmosBlockchain.Mars:
          return this.getMarsUrls();
        case CosmosBlockchain.Juno:
          return this.getJunoUrls();
        case CosmosBlockchain.Akash:
          return this.getAkashUrls();
        case CosmosBlockchain.Axelar:
          return this.getAxelarUrls();
        case CosmosBlockchain.EMoney:
          return this.getEMoneyUrls();
        case CosmosBlockchain.Persistence:
          return this.getPersistenceUrls();
        case CosmosBlockchain.Stargaze:
          return this.getStargazeUrls();
        case CosmosBlockchain.Sifchain:
          return this.getSifchainUrls();
        case CosmosBlockchain.Sommelier:
          return this.getSommelierUrls();
        case CosmosBlockchain.Umee:
          return this.getUmeeUrls();
        case CosmosBlockchain.AssetMantle:
          return this.getAssetMantleUrls();
        case CosmosBlockchain.Kujira:
          return this.getKujiraUrls();
        case CosmosBlockchain.Injective:
          return this.getInjectiveUrls();
        case CosmosBlockchain.Stride:
          return this.getStrideUrls();
        case CosmosBlockchain.Cheqd:
          return this.getCheqdUrls();
        case CosmosBlockchain.LikeCoin:
          return this.getLikeCoinUrls();
        case CosmosBlockchain.Chihuahua:
          return this.getChihuahuaUrls();
        case CosmosBlockchain.GravityBridge:
          return this.getGravityBridgeUrls();
        case CosmosBlockchain.IrisNet:
          return this.getIrisNetUrls();
        case CosmosBlockchain.Starname:
          return this.getStarnameUrls();
        case CosmosBlockchain.Fetch:
          return this.getFetchUrls();
        case CosmosBlockchain.Desmos:
          return this.getDesmosUrls();
        case CosmosBlockchain.Teritori:
          return this.getTeritoriUrls();
        case CosmosBlockchain.Agoric:
          return this.getAgoricUrls();
        case CosmosBlockchain.Terra2:
          return this.getTerra2Urls();
        case CosmosBlockchain.Secret:
          return this.getSecretUrls();
        case CosmosBlockchain.Evmos:
          return this.getEvmosUrls();
        case CosmosBlockchain.Canto:
          return this.getCantoUrls();
        case CosmosBlockchain.Kava:
          return this.getKavaUrls();
        case CosmosBlockchain.Crescent:
          return this.getCrescentUrls();
        case CosmosBlockchain.OmniFlix:
          return this.getOmniFlixUrls();
        case CosmosBlockchain.Carbon:
          return this.getCarbonUrls();
        case CosmosBlockchain.BitCanna:
          return this.getBitCannaUrls();
        case CosmosBlockchain.Cudos:
          return this.getCudosUrls();
        case CosmosBlockchain.Decentr:
          return this.getDecentrUrls();
        case CosmosBlockchain.Comdex:
          return this.getComdexUrls();
        case CosmosBlockchain.BitSong:
          return this.getBitSongUrls();
        case CosmosBlockchain.Coreum:
          return this.getCoreumUrls();
        case CosmosBlockchain.Kyve:
          return this.getKyveUrls();
        case CosmosBlockchain.Migaloo:
          return this.getMigalooUrls();
        case CosmosBlockchain.Neutron:
          return this.getNeutronUrls();
        case CosmosBlockchain.Onomy:
          return this.getOnomyUrls();
        case CosmosBlockchain.Quasar:
          return this.getQuasarUrls();
        case CosmosBlockchain.Quicksilver:
          return this.getQuicksilverUrls();
        case CosmosBlockchain.SeiAtlantic2TestNet:
          return this.getSeiAtlantic2TestNetUrls();
      }
    }

    getCosmosHubUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/cosmoshub',
        'https://cosmoshub-api.lavenderfive.com:443',
        'https://cosmos-lcd.quickapi.com:443',
        'https://lcd.cosmos.dragonstake.io',
        'https://api.cosmos.interbloc.org',
        'https://api-cosmoshub.pupmos.network',
        'https://cosmoshub.rest.stakin-nodes.com',
        'https://api-cosmoshub-ia.cosmosia.notional.ventures/',
        'https://lcd-cosmoshub.blockapsis.com',
      ];
      return urls;
    }

    getOsmosisUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/osmosis',
        'https://lcd.osmosis.zone/',
        'https://osmosis-lcd.quickapi.com/',
        'https://api.osmosis.interbloc.org/',
        'https://osmosis-api.lavenderfive.com/',
        'https://osmosis-api.polkachu.com/',
        'https://lcd-osmosis.blockapsis.com/',
        'https://api.osmosis.silknodes.io/',
        'https://osmosis.rest.stakin-nodes.com/',
        'https://api.osl.zone/',
        'https://osmosis-api.lavenderfive.com:443/',
        'https://osmosis-lcd.quickapi.com:443/',
        'https://osmosis-mainnet-lcd.autostake.com:443/',
      ];
      return urls;
    }

    getSeiUrls(): string[] {
      const urls = ['https://rest-sei-test.ecostake.com/'];
      return urls;
    }

    getMarsUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/mars',
        'https://rest.marsprotocol.io/',
        'https://mars-api.lavenderfive.com/',
      ];
      return urls;
    }

    getJunoUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/juno',
        'https://api-juno-ia.cosmosia.notional.ventures/',
        'https://lcd-juno.itastakers.com/',
        'https://lcd.junomint.com/',
        'https://api.juno.pupmos.network/',
        'https://juno-api.kleomed.es/',
        'https://juno-api.polkachu.com/',
        'https://lcd-juno.whispernode.com/',
        'https://api.juno.silknodes.io/',
        'https://juno-api.lavenderfive.com/',
        'https://api.juno.interbloc.org/',
      ];
      return urls;
    }

    getAkashUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/akash',
        'https://akash.c29r3.xyz/api',
        'https://api-akash-ia.cosmosia.notional.ventures/',
        'https://api.akash.forbole.com/',
        'https://akash-api.lavenderfive.com/',
        'https://akash-api.polkachu.com/',
      ];
      return urls;
    }

    getAxelarUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/axelar',
        'https://axelar-lcd.quickapi.com/',
        'https://lcd-axelar.imperator.co/',
        'https://api-1.axelar.nodes.guru/',
        'https://axelar-rest.chainode.tech/',
        'https://axelar-lcd.qubelabs.io/',
        'https://axelar-api.polkachu.com/',
        'https://api-axelar-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getEMoneyUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/emoney',
        'https://emoney.validator.network/api/',
        'https://api-emoney-ia.cosmosia.notional.ventures/',
        'https://api.emoney.freak12techno.io/',
        'https://e-money-api.ibs.team/',
        'https://lcd.emoney.ezstaking.io/',
        'https://lcd-emoney.keplr.app/',
      ];
      return urls;
    }

    getPersistenceUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/persistence',
        'https://api-persistence.starsquid.io/',
        'https://rest.core.persistence.one/',
        'https://api-persistent-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getStargazeUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/stargaze',
        'https://api.stargaze.pupmos.network/',
        'https://rest.stargaze-apis.com/',
        'https://api.stargaze.silentvalidator.com/',
        'https://api-stargaze-ia.cosmosia.notional.ventures/',
        'https://api-stargaze.d-stake.xyz/',
        'https://api.stargaze.nodestake.top/',
        'https://stargaze-api.ibs.team/',
        'https://api.stargaze.ezstaking.io/',
        'https://stargaze-rapipc.polkachu.com/',
        'https://api.stars.kingnodes.com/',
      ];
      return urls;
    }

    getSifchainUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/sifchain',
        'https://sifchain-api.polkachu.com/',
        'https://api-sifchain-ia.cosmosia.notional.ventures/',
        'https://lcd.sifchain.posthuman.digital/',
        'https://sif-api.kleomed.es/',
        'https://api.sifchain.chaintools.tech/',
        'https://sifchain-api.ibs.team/',
        'https://sifchain.api.consensus.one/',
      ];
      return urls;
    }

    getSommelierUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/sommelier',
        'https://api.sommelier.pupmos.network/',
        'https://sommelier-api.lavenderfive.com/',
        'https://sommelier-api.polkachu.com/',
        'https://lcd-sommelier.keplr.app/',
      ];
      return urls;
    }

    getUmeeUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/umee',
        'https://api.barnacle.mainnet.network.umee.cc/',
        'https://api-umee-ia.cosmosia.notional.ventures/',
        'https://umee-api.polkachu.com/',
      ];
      return urls;
    }

    getAssetMantleUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/assetmantle',
        'https://rest.assetmantle.one/',
        'https://api-assetmantle-ia.cosmosia.notional.ventures/',
        'https://assetmantle-api.polkachu.com/',
        'https://api.assetmantle.nodestake.top/',
        'https://api-assetmanle.d-stake.xyz/',
        'https://lcd.asset-mantle.ezstaking.io/',
      ];
      return urls;
    }

    getKujiraUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/kujira',
        'https://kujira-lcd.wildsage.io/',
        'https://api-kujira.nodeist.net/',
        'https://api-kujira-ia.cosmosia.notional.ventures/',
        'https://lcd.kaiyo.kujira.setten.io/',
        'https://kujira-api.polkachu.com/',
        'https://kujira-api.lavenderfive.com/',
        'https://lcd-kujira.whispernode.com/',
        'https://kujira-api.ibs.team/',
        'https://api-bitsong.starsquid.io/',
        'https://api.kujira.chaintools.tech/',
      ];
      return urls;
    }

    getInjectiveUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/injective',
        'https://injective-lcd.quickapi.com/',
        'https://injective-api.polkachu.com/',
        'https://public.lcd.injective.network/',
        'https://api-injective-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getStrideUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/stride',
        'https://stride-api.lavenderfive.com/',
        'https://stride-api.polkachu.com/',
        'https://api.stride.silentvalidator.com/',
        'http://api-stride.nodeist.net/',
        'https://api.stride.bh.rocks/',
        'https://api-stride.d-stake.xyz/',
        'https://stride.api.chandrastation.com/',
        'https://api.stride.nodestake.top/',
      ];
      return urls;
    }

    getCheqdUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/cheqd',
        'https://cheqd-api.lavenderfive.com/',
        'https://api.cheqd.nodestake.top/',
        'https://api.cheqd.net/',
        'https://lcd.cheqd.ezstaking.io/',
        'https://api-cheqd-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getLikeCoinUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/likecoin',
        'https://mainnet-node.like.co/',
        'https://api-likecoin-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getChihuahuaUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/chihuahua',
        'https://api.chihuahua.wtf/',
        'https://chihuahua-api.polkachu.com/',
        'https://chihuahua-api.lavenderfive.com/',
        'https://api-chihuahua-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getGravityBridgeUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/gravitybridge',
        'https://gravity-api.polkachu.com/',
        'https://gravitybridge-api.lavenderfive.com/',
        'https://api.gravity-bridge.nodestake.top/',
        'https://gravitychain.io:1317/',
        'https://lcd.gravity-bridge.ezstaking.io/',
        'https://api-gravitybridge-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getIrisNetUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/irisnet',
        'https://api-irisnet-ia.cosmosia.notional.ventures/',
        'https://lcd-iris.keplr.app/',
      ];
      return urls;
    }

    getStarnameUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/starname',
        'https://starname.nodejumper.io:1317/',
        'https://api-starname-ia.cosmosia.notional.ventures/',
        'https://lcd-iov.keplr.app/',
      ];
      return urls;
    }

    getFetchUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/fetchhub',
        'https://api-fetchhub-ia.cosmosia.notional.ventures/',
        'https://fetch-api.polkachu.com/',
        'https://rest-fetchhub.fetch.ai/',
      ];
      return urls;
    }

    getDesmosUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/desmos',
        'https://desmos.nodejumper.io:1317/',
        'https://desmos-api.ibs.team/',
        'https://desmos-api.panthea.eu/',
        'https://desmos-api.lavenderfive.com/',
        'https://api.mainnet.desmos.network/',
      ];
      return urls;
    }

    getTeritoriUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/teritori',
        'https://teritori-api.lavenderfive.com/',
        'https://teritori.nodejumper.io:1317/',
        'https://api-teritori.nodeist.net/',
        'https://api.teritori.silentvalidator.com/',
        'https://teritori-api.ibs.team/',
        'https://teritori-api.polkachu.com/',
        'https://teritori-rest.brocha.in/',
        'https://api.teritori.nodestake.top/',
      ];
      return urls;
    }

    getAgoricUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/agoric',
        'https://main.api.agoric.net/',
        'https://agoric-api.polkachu.com/',
        'https://api.agoric.nodestake.top/',
      ];
      return urls;
    }

    getTerra2Urls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/terra2',
        'https://fcd.terrav2.ccvalidators.com/',
        'https://terra.mainnet.lcd.autostake.net/',
        'https://lcd-terra.wildsage.io/',
        'https://terra-api.lavenderfive.com/',
        'https://terra-api.polkachu.com/',
      ];
      return urls;
    }

    getSecretUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/secretnetwork',
        'https://secret-api.lavenderfive.com/',
        'https://secret-4.api.trivium.network:1317/',
        'https://api.scrt.network/',
        'https://secret.api.consensus.one/',
        'https://secretnetwork-lcd.stakely.io/',
        'https://scrt-lcd.blockpane.com/',
        'https://api.secret.forbole.com/',
      ];
      return urls;
    }

    getEvmosUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/evmos',
        'https://api.evmos.interbloc.org/',
        'https://rest.evmos.tcnetwork.io/',
        'https://evmos.rest.stakin.com/',
        'https://lcd.evmos.bh.rocks/',
        'https://lcd.evmos.posthuman.digital/',
        'https://api.evmos.nodestake.top/',
        'https://api.evmos.testnet.run/',
        'https://evmos-api.polkachu.com/',
        'https://evmos-rest.agoranodes.com/',
        'https://evmos-api.lavenderfive.com/',
        'https://rest.bd.evmos.org:1317/',
        'https://rest-evmos.architectnodes.com/',
        'https://evmos.rest.interchain.ivaldilabs.xyz/',
        'https://lcd-evmos.whispernode.com/',
        'https://rpc.evmos.chaintools.tech/',
        'https://api-evmos-ia.cosmosia.notional.ventures/',
        'https://api.evmos.silknodes.io/',
        'https://api.evmos.silentvalidator.com/',
      ];
      return urls;
    }

    getBitCannaUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/bitcanna',
        'https://bitcanna.nodejumper.io:1317/',
        'https://api-bitcanna-ia.cosmosia.notional.ventures/',
        'https://bitcanna-api.polkachu.com/',
        'https://lcd.bitcanna.io/',
        'https://bitcanna-api.panthea.eu/',
        'https://bcna-api.ibs.team/',
        'https://bitcanna-api.lavenderfive.com/',
        'https://api-bcna.kjinc.io/',
      ];
      return urls;
    }

    getCantoUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/canto',
        'https://api.canto.silentvalidator.com/',
        'https://canto-api.polkachu.com/',
        'http://164.90.154.41:1317/',
        'https://api.canto.nodestake.top/',
        'https://canto-api.lavenderfive.com/',
      ];
      return urls;
    }

    getKavaUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/kava',
        'https://kava-api.polkachu.com/',
        'https://kava.mainnet.lcd.autostake.net/',
        'https://api-kava-ia.cosmosia.notional.ventures/',
        'https://api.data.kava.io/',
      ];
      return urls;
    }

    getCrescentUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/crescent',
        'https://mainnet.crescent.network:1317/',
        'https://crescent-api.polkachu.com/',
        'https://api-crescent.pupmos.network/',
        'https://crescent.rest.stakin-nodes.com/',
      ];
      return urls;
    }

    getOmniFlixUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/omniflixhub',
        'https://omniflix.nodejumper.io:1317/',
        'https://api-omniflixhub-ia.cosmosia.notional.ventures/',
        'https://omniflix-api.lavenderfive.com/',
        'https://api.omniflix.silentvalidator.com/',
        'https://api.omniflix.nodestake.top/',
        'https://api.omniflix.kingnodes.com/',
        'https://api.omniflix.chaintools.tech/',
        'https://omniflixhub-api.skynetvalidators.com/',
        'https://api.omniflix.huginn.tech/',
      ];
      return urls;
    }

    getCarbonUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/carbon',
        'https://rest.carbon.bh.rocks/',
        'https://api.carbon.network/',
      ];
      return urls;
    }

    getCudosUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/cudos',
        'http://mainnet-full-node-01.hosts.cudos.org:1317/',
        'https://mainnet-full-node-02.hosts.cudos.org:31317/',
      ];
      return urls;
    }

    getDecentrUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/decentr',
        'https://rest.mainnet.decentr.xyz/',
        'https://decentr-api.ibs.team/',
        'https://api.decentr.chaintools.tech/',
        'https://api.decentr.nodestake.top/',
      ];
      return urls;
    }

    getComdexUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/comdex',
        'https://api-comdex.zenchainlabs.io/',
        'https://comdex-api.polkachu.com/',
        'https://api.comdex.chaintools.tech/',
        'https://rest.comdex.one/',
        'https://comdex-api.lavenderfive.com/',
        'https://api-comdex-ia.cosmosia.notional.ventures/',
        'https://api.comdex.audit.one/rest',
        'http://comdex.node.vitwit.com:1317/',
      ];
      return urls;
    }

    getBitSongUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/bitsong',
        'https://bitsong-api.panthea.eu/',
        'https://bitsong-api.lavenderfive.com/',
        'https://lcd-bitsong.itastakers.com/',
        'https://lcd.explorebitsong.com/',
        'https://api-bitsong.starsquid.io/',
        'https://api.bitsong.chaintools.tech/',
        'https://bitsong-api.validatrium.club/',
        'https://api.bitsong.freak12techno.io/',
        'https://rest-bitsong.architectnodes.com/',
        'https://api.bitsong.interbloc.org/',
        'https://api-bitsong-ia.cosmosia.notional.ventures/',
      ];
      return urls;
    }

    getNearUrls(): string[] {
      const urls = [
        'https://rpc.mainnet.near.org',
        'https://rpc.ankr.com/near',
        'https://public-rpc.blockpi.io/http/near',
        'https://near-mainnet-rpc.allthatnode.com:3030',
      ];
      return urls;
    }

    getCoreumUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/coreum',
        'https://full-node.mainnet-1.coreum.dev:1317',
        'https://full-node-californium.mainnet-1.coreum.dev:1317',
        'https://full-node-curium.mainnet-1.coreum.dev:1317',
        'https://full-node-uranium.mainnet-1.coreum.dev:1317',
      ];
      return urls;
    }

    getKyveUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/kyve',
        'https://lcd-kyve.imperator.co/',
        'https://api-eu-1.kyve.network/',
        'https://kyve-api.lavenderfive.com:443/',
        'https://api.kyve.nodestake.top/',
        'https://www.kyve-lcd.enigma-validator.com/',
        'https://kyve-api.ibs.team/',
      ];
      return urls;
    }

    getMigalooUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/migaloo',
        'https://whitewhale-api.lavenderfive.com/',
        'https://rest-whitewhale.carbonzero.zone:443/',
        'https://migaloo.api.kjnodes.com/',
        'https://migaloo-api.kleomedes.network:443/',
        'https://whitewhale-mainnet-lcd.autostake.com:443/',
        'https://lcd-whitewhale.whispernode.com:443/',
        'https://api.whitewhale.nodestake.top/',
      ];
      return urls;
    }

    getNeutronUrls(): string[] {
      const urls = ['https://rest.cosmos.directory/neutron', 'https://rest.baryon.ntrn.info/'];
      return urls;
    }

    getOnomyUrls(): string[] {
      const urls = ['https://rest.cosmos.directory/onomy', 'https://rest-mainnet.onomy.io'];
      return urls;
    }

    getQuasarUrls(): string[] {
      const urls = ['https://rest.cosmos.directory/quasar', 'https://quasar-api.polkachu.com'];
      return urls;
    }

    getQuicksilverUrls(): string[] {
      const urls = [
        'https://rest.cosmos.directory/quicksilver',
        'https://m-quicksilver.api.utsa.tech/',
        'https://quicksilver.api.kjnodes.com/',
        'https://quicksilver-mainnet-lcd.autostake.com:443/',
        'https://api-quicksilver-ia.cosmosia.notional.ventures:443/',
        'https://quicksilver-api.lavenderfive.com:443/',
      ];
      return urls;
    }

    getSeiAtlantic2TestNetUrls(): string[] {
      const urls = ['https://rest.atlantic-2.seinetwork.io'];
      return urls;
    }
  }

  export const token = new Token<DefaultApi>('BlockchainNodeUrlGetter');
}
