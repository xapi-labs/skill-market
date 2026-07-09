#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const REGISTRY_PATH = join(ROOT, 'registry.json');

const dirs = (await readdir(SKILLS_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const existing = await readRegistry();
const existingBySlug = new Map(
  (existing.skills || []).map((entry) => [entry.slug, entry]),
);
const skills = [];

for (const slug of dirs) {
  const markdown = await readFile(join(SKILLS_DIR, slug, 'SKILL.md'), 'utf8');
  const frontmatter = extractFrontmatter(markdown);
  if (!frontmatter) throw new Error(`skills/${slug}/SKILL.md has no frontmatter`);
  const previous = existingBySlug.get(slug) || {};
  skills.push({
    slug,
    name: frontmatterString(frontmatter, 'name') || slug,
    description: frontmatterString(frontmatter, 'description') || '',
    version: frontmatterString(frontmatter, 'version') || '0.1.0',
    path: `skills/${slug}`,
    publishedAt: previous.publishedAt ?? null,
    normalizedSha256: previous.normalizedSha256 ?? null,
  });
}

await writeFile(
  REGISTRY_PATH,
  `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), skills }, null, 2)}\n`,
);
console.log(`Generated registry.json with ${skills.length} skill(s).`);

async function readRegistry() {
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, 'utf8'));
  } catch {
    return { schemaVersion: 1, generatedAt: null, skills: [] };
  }
}

function extractFrontmatter(markdown) {
  return markdown.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? null;
}

function frontmatterString(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}\\s*:\\s*(.*)$`, 'm'));
  if (!match) return '';
  const value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
