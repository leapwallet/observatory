import axios from 'axios';

const githubApiBaseUrl = 'https://api.github.com';
const repoOwner = 'cosmos';
const repoName = 'chain-registry';
const githubRawBaseUrl = 'https://raw.githubusercontent.com';
const branch = 'master';

async function fetchDirectories(): Promise<string[]> {
  const url = `${githubApiBaseUrl}/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
  const response = await axios.get(url);
  const directories = response.data.tree
    .filter(
      (item: any) =>
        item.type === 'tree' &&
        /^[a-z]/.test(item.path) &&
        !item.path.endsWith('/images') &&
        !item.path.includes('testnets'),
    )
    .map((dir: any) => dir.path);
  return directories;
}

async function fetchChainJson(chainDir: string) {
  const url = `${githubRawBaseUrl}/${repoOwner}/${repoName}/${branch}/${chainDir}/chain.json`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chain.json for ${chainDir}: ${error}`);
    return null;
  }
}

export async function generateSingularChainNodeList() {
  let directories = await fetchDirectories();

  directories = directories.filter(
    (dir) => !dir.endsWith('/images') && !dir.includes('/testnets') && !dir.includes('/xion'),
  );

  const chainNodeList = [];

  for (const dir of directories) {
    const chainData = await fetchChainJson(dir);
    if (chainData && chainData.apis && chainData.apis.rest) {
      const nodeListEntry = {
        chainName: chainData.chain_name,
        chainId: chainData.chain_id,
        nodeList: chainData.apis.rest.map((api: any) => api.address),
      };
      chainNodeList.push(nodeListEntry);
    }
  }

  // Return the aggregated data directly
  return { chainNodeList };
}
