/** List of all nodes used for a given chain */
export type chainNodeList = {
  chainName: string;
  nodeList: string[];
};

export type chainNodeListJSON = {
  chainNodeList: chainNodeList[];
};
