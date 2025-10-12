'use server';

import { notFound } from "next/navigation";

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'BCusack';
const REPO_NAME = 'Seon';
const REPO_BRANCH = 'main';

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

const headers: Record<string, string> = GITHUB_TOKEN
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
      if (response.status === 403) {
        // Rate limit hit - return empty array instead of crashing
        console.warn(`GitHub API rate limit exceeded for path: ${path}. Using empty fallback.`);
        return [];
      }
      if (response.status === 401) {
        // Bad credentials - return empty array and warn
        console.warn(`GitHub API authentication failed for path: ${path}. Check your GITHUB_ACCESS_TOKEN. Using fallback.`);
        return [];
      }
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('GitHub API error:', errorData.message);
      console.warn(`GitHub API failed for path: ${path}. Using fallback data.`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in fetchRepoContents for path ${path}:`, error);
    return [];
  }
}

export async function getRepoFiles(): Promise<string[]> {
  // In development, provide a fallback list when GitHub API is unavailable
  const fallbackFiles = [
    'README.md',
    'Whitepaper.md',
    'Project/Discovery.md',
    'Project/Planning.md',
    'Project/Market Research.md',
    'Project/Letta/prototyping.md',
    'Extended/beyond_the_smartphone.md',
    'Extended/communication_interfacing.md',
    'Wiki/Home.md',
    'CODE_OF_CONDUCT.md',
    'LICENCE.md'
  ];

  const allFiles: string[] = [];
  const directoriesToProcess: string[] = ['']; // Start at the root

  let rateLimitHit = false;
  while (directoriesToProcess.length > 0) {
    const currentPath = directoriesToProcess.pop()!;
    const contents = await fetchRepoContents(currentPath);

    // If we got empty array due to rate limit, use fallback
    if (contents.length === 0 && currentPath === '') {
      console.warn('Using fallback file list due to GitHub API issues');
      return fallbackFiles;
    }

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
      if (response.status === 403) {
        console.warn(`GitHub API rate limit exceeded for file: ${path}`);
      }
      if (response.status === 401) {
        console.warn(`GitHub API authentication failed for file: ${path}. Check your GITHUB_ACCESS_TOKEN.`);
      }
      notFound();
    }
    return await response.text();
  } catch (error) {
    console.error(`Error in getFileContent for ${path}:`, error);
    notFound();
  }
}
