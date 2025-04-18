#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import repoConfig from './repo-config.js';

// Initialize dotenv
dotenv.config();

// ES Module polyfills for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get configuration from .env file with fallback to repo-config.js
const OUTPUT_FILE = process.env.OUTPUT_FILE || repoConfig.outputPath || 'public/data/combined-markdown.md';

// Create necessary directories for output file
const ensureOutputDirectory = async (filePath) => {
  const directory = path.dirname(filePath);
  await fs.ensureDir(directory);
};

// Function to find markdown files recursively
async function findMarkdownFiles(dir) {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        return findMarkdownFiles(res);
      } else if (dirent.name.endsWith('.md')) {
        return res;
      } else {
        return [];
      }
    }));
    
    // Flatten the array of arrays and filter out empty arrays
    return files.flat().filter(Boolean);
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

// Function to clone or update a repository
async function getRepository(repo) {
  if (repo.isLocal) {
    console.log(`Using local repository at ${repo.repoUrl}`);
    return path.resolve(repo.repoUrl);
  }
  
  // For external repos, clone or update them
  try {
    const reposDir = path.resolve('external-repos');
    await fs.ensureDir(reposDir);
    
    const repoDir = path.join(reposDir, repo.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase());
    
    if (await fs.pathExists(repoDir)) {
      // Update existing repository
      console.log(`Updating repository ${repo.name} in ${repoDir}`);
      execSync('git pull', { cwd: repoDir, stdio: 'inherit' });
    } else {
      // Clone new repository
      console.log(`Cloning repository ${repo.name} from ${repo.repoUrl} to ${repoDir}`);
      execSync(`git clone ${repo.repoUrl} ${repoDir}`, { stdio: 'inherit' });
    }
    
    return repoDir;
  } catch (error) {
    console.error(`Error with Git repository ${repo.name}:`, error.message);
    return null;
  }
}

// Main function
async function combineMarkdownFiles() {
  console.log('Starting markdown combination process...');
  
  // Ensure output directory exists
  await ensureOutputDirectory(OUTPUT_FILE);
  
  // Create or truncate the output file
  await fs.ensureFile(OUTPUT_FILE);
  await fs.writeFile(OUTPUT_FILE, '');
  
  // Process each repository
  let totalProcessedFiles = 0;
  
  for (const repo of repoConfig.repositories) {
    console.log(`\nProcessing repository: ${repo.name}`);
    
    // Get the repository (clone or use local)
    const repoPath = await getRepository(repo);
    if (!repoPath) {
      console.log(`Skipping repository ${repo.name}`);
      continue;
    }
    
    // Determine the entry point within the repository
    const entryPoint = repo.entryPoint ? path.join(repoPath, repo.entryPoint) : repoPath;
    console.log(`Searching for markdown files in: ${entryPoint}`);
    
    // Validate entry point exists
    try {
      const stats = await fs.stat(entryPoint);
      if (!stats.isDirectory()) {
        console.error(`Error: '${entryPoint}' is not a directory`);
        continue;
      }
    } catch (error) {
      console.error(`Error: Directory '${entryPoint}' does not exist`);
      continue;
    }
    
    // Find all markdown files and sort them
    const mdFiles = await findMarkdownFiles(entryPoint);
    mdFiles.sort();
    
    const fileCount = mdFiles.length;
    if (fileCount === 0) {
      console.log(`No markdown files found in repository ${repo.name}`);
      continue;
    }
    
    console.log(`Found ${fileCount} markdown files in ${repo.name}`);
    
    // Add repository header
    await fs.appendFile(OUTPUT_FILE, `\n\n# Repository: ${repo.name}\n\n`);
    
    // Process each markdown file
    for (let i = 0; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      const counter = i + 1;
      totalProcessedFiles++;
      
      console.log(`Processing [${counter}/${fileCount}]: ${file}`);
      
      // Add a separator between files
      if (i > 0) {
        await fs.appendFile(OUTPUT_FILE, '\n\n---\n\n');
      }
      
      // Add file path as a header
      const relativePath = path.relative(repoPath, file);
      await fs.appendFile(OUTPUT_FILE, `## File: ${relativePath}\n\n`);
      
      // Append file content
      const content = await fs.readFile(file, 'utf8');
      await fs.appendFile(OUTPUT_FILE, content);
    }
  }
  
  if (totalProcessedFiles === 0) {
    console.log('No markdown files were processed from any repository');
  } else {
    console.log(`\nSuccessfully combined ${totalProcessedFiles} markdown files into '${OUTPUT_FILE}'`);
  }
}

// Run the script
combineMarkdownFiles().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
