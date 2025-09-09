'use server';

import { notFound } from "next/navigation";

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'BCusack';
const REPO_NAME = 'Seon';
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

async function fetchRepoContents(path: string): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`;
  try {
    const response = await fetch(url, { headers, next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData.message);
      throw new Error(`Failed to fetch repo contents for path ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in fetchRepoContents for path ${path}:`, error);
    return [];
  }
}

export async function getRepoFiles(): Promise<string[]> {
  const allFiles: string[] = [];
  const directoriesToProcess: string[] = ['']; // Start at the root

  while (directoriesToProcess.length > 0) {
    const currentPath = directoriesToProcess.pop()!;
    const contents = await fetchRepoContents(currentPath);

    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        allFiles.push(item.path);
      } else if (item.type === 'dir') {
        directoriesToProcess.push(item.path);
      }
    }
  }
  
  return allFiles.sort();
}

export async function getFileContent(path: string): Promise<string> {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`;

  try {
    const response = await fetch(url, { 
      headers: { ...headers, Accept: 'application/vnd.github.raw' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) {
        notFound();
    }
    return await response.text();
  } catch (error) {
    console.error(`Error in getFileContent for ${path}:`, error);
    notFound();
  }
}
