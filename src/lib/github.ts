'use server';

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'BCusack';
const REPO_NAME = 'Seon';
const REPO_PATH = ''; // Fetch from the root
const REPO_BRANCH = 'main';

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

const headers = GITHUB_TOKEN
  ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
  : {};

type GitHubFile = {
  name: string;
  path: string;
  type: 'file' | 'dir';
};

export async function getRepoFiles(): Promise<string[]> {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${REPO_PATH}?ref=${REPO_BRANCH}`;
  
  try {
    const response = await fetch(url, { headers, next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData.message);
      throw new Error(`Failed to fetch repo files: ${response.statusText}`);
    }
    const data: GitHubFile[] = await response.json();
    return data
      .filter(item => item.type === 'file' && item.name.endsWith('.md'))
      .map(item => item.path); // Return the path, which is just the filename at the root
  } catch (error) {
    console.error('Error in getRepoFiles:', error);
    return [];
  }
}

export async function getFileContent(path: string): Promise<string> {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`;

  try {
    const response = await fetch(url, { 
      headers: { ...headers, Accept: 'application/vnd.github.raw' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API error for getFileContent:', errorData);
      throw new Error(`Failed to fetch file content for ${path}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error in getFileContent for ${path}:`, error);
    return `Error loading content for ${path}.`;
  }
}
