#!/usr/bin/env node

import { lstat, readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const REGISTRY_PATH = join(ROOT, 'registry.json');

const MAX_FILES = 100;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_SKILL_BYTES = 5 * 1024 * 1024;

const SLUG_RE = /^(?=.{3,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE =
  /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:[-+][0-9A-Za-z.-]+)?$/;

const SCRIPT_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.mjs',
  '.py',
  '.rb',
  '.sh',
  '.ts',
]);

const SCRIPT_DIRECTORIES = new Set(['scripts', 'eval-viewer']);

const DISALLOWED_EXTENSIONS = new Set([
  '.bat',
  '.bin',
  '.cmd',
  '.com',
  '.dll',
  '.dylib',
  '.exe',
  '.go',
  '.node',
  '.ps1',
  '.rs',
  '.so',
  '.wasm',
]);

const ALLOWED_EXTENSIONS = new Set([
  ...SCRIPT_EXTENSIONS,
  '.gif',
  '.jpeg',
  '.jpg',
  '.json',
  '.md',
  '.png',
  '.txt',
  '.webp',
  '.yaml',
  '.yml',
]);

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'codex',
  'official',
  'openai',
  'system',
  'xapi',
]);

const issues = [];

function addIssue(path, message) {
  issues.push({ path, message });
}

async function main() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true }).catch(
    (err) => {
      addIssue('skills', `cannot read skills directory: ${err.message}`);
      return [];
    },
  );

  const skillDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const registryBySlug = await validateRegistry(skillDirs);

  for (const entry of entries) {
    if (entry.name === '.gitkeep') continue;
    if (!entry.isDirectory()) {
      addIssue(`skills/${entry.name}`, 'skills/ may contain only skill directories');
    }
  }

  for (const slug of skillDirs) {
    await validateSkill(slug, registryBySlug.get(slug));
  }

  if (issues.length > 0) {
    console.error(`Skill market validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.error(`- ${issue.path}: ${issue.message}`);
    }
    process.exit(1);
  }

  console.log(
    `Skill market validation passed (${skillDirs.length} skill${skillDirs.length === 1 ? '' : 's'}).`,
  );
}

async function validateRegistry(skillDirs) {
  const bySlug = new Map();
  let registry;
  try {
    registry = JSON.parse(await readFile(REGISTRY_PATH, 'utf8'));
  } catch (err) {
    addIssue('registry.json', `invalid or missing registry: ${err.message}`);
    return bySlug;
  }
  if (registry.schemaVersion !== 1) {
    addIssue('registry.json', 'schemaVersion must be 1');
  }
  if (!Array.isArray(registry.skills)) {
    addIssue('registry.json', 'skills must be an array');
    return bySlug;
  }
  const seen = new Set();
  for (const [index, skill] of registry.skills.entries()) {
    const where = `registry.json#/skills/${index}`;
    if (!skill || typeof skill !== 'object') {
      addIssue(where, 'entry must be an object');
      continue;
    }
    if (!SLUG_RE.test(skill.slug || '')) {
      addIssue(where, 'slug is invalid');
    }
    if (seen.has(skill.slug)) {
      addIssue(where, `duplicate registry slug: ${skill.slug}`);
    }
    seen.add(skill.slug);
    if (typeof skill.slug === 'string') bySlug.set(skill.slug, skill);
    const expectedPath = `skills/${skill.slug}`;
    if (skill.path !== expectedPath) {
      addIssue(where, `path must be ${expectedPath}`);
    }
    if (!skill.name || typeof skill.name !== 'string') {
      addIssue(where, 'name is required');
    }
    if (!SEMVER_RE.test(skill.version || '')) {
      addIssue(where, 'version must be semver');
    }
  }
  for (const slug of skillDirs) {
    if (!seen.has(slug)) {
      addIssue('registry.json', `missing registry entry for skills/${slug}`);
    }
  }
  for (const slug of seen) {
    if (!skillDirs.includes(slug)) {
      addIssue('registry.json', `entry points to missing directory: skills/${slug}`);
    }
  }
  return bySlug;
}

async function validateSkill(slug, registryEntry) {
  const skillRoot = join(SKILLS_DIR, slug);
  if (!SLUG_RE.test(slug)) {
    addIssue(`skills/${slug}`, 'directory name is not a valid slug');
  }
  if (RESERVED_SLUGS.has(slug)) {
    addIssue(`skills/${slug}`, 'reserved slug requires manual marketplace approval');
  }

  const files = await listFiles(skillRoot);
  if (files.length > MAX_FILES) {
    addIssue(`skills/${slug}`, `contains more than ${MAX_FILES} files`);
  }

  let totalBytes = 0;
  const seen = new Set();
  for (const file of files) {
    const rel = relative(skillRoot, file).replaceAll('\\', '/');
    const repoPath = `skills/${slug}/${rel}`;
    if (seen.has(rel)) {
      addIssue(repoPath, 'duplicate file path');
    }
    seen.add(rel);

    if (rel.split('/').some((segment) => segment.startsWith('.'))) {
      addIssue(repoPath, 'hidden files are not allowed inside skill packages');
    }

    const stat = await lstat(file);
    if (stat.isSymbolicLink()) {
      addIssue(repoPath, 'symlinks are not allowed');
      continue;
    }
    if (!stat.isFile()) continue;
    totalBytes += stat.size;
    if (stat.size > MAX_FILE_BYTES) {
      addIssue(repoPath, `file is larger than ${MAX_FILE_BYTES} bytes`);
    }

    const ext = extensionOf(rel);
    if (DISALLOWED_EXTENSIONS.has(ext)) {
      addIssue(repoPath, `disallowed executable extension: ${ext}`);
    } else if (!ALLOWED_EXTENSIONS.has(ext)) {
      addIssue(repoPath, `unsupported file extension: ${ext || '(none)'}`);
    }

    if (SCRIPT_EXTENSIONS.has(ext) && !SCRIPT_DIRECTORIES.has(rel.split('/')[0])) {
      addIssue(repoPath, 'script files must live under scripts/ or eval-viewer/');
    }

    if (isTextFile(rel) || SCRIPT_EXTENSIONS.has(ext)) {
      scanSecrets(repoPath, await readFile(file, 'utf8'));
    }
  }
  if (totalBytes > MAX_SKILL_BYTES) {
    addIssue(`skills/${slug}`, `skill package is larger than ${MAX_SKILL_BYTES} bytes`);
  }

  await validateSkillMarkdown(slug, skillRoot, registryEntry);
  await validateXapiManifest(slug, skillRoot);
}

async function validateSkillMarkdown(slug, skillRoot, registryEntry) {
  const repoPath = `skills/${slug}/SKILL.md`;
  let markdown;
  try {
    markdown = await readFile(join(skillRoot, 'SKILL.md'), 'utf8');
  } catch {
    addIssue(repoPath, 'SKILL.md is required');
    return;
  }
  const frontmatter = extractFrontmatter(markdown);
  if (!frontmatter) {
    addIssue(repoPath, 'SKILL.md must start with YAML frontmatter');
    return;
  }
  const name = frontmatterString(frontmatter, 'name');
  const description = frontmatterString(frontmatter, 'description');
  const frontmatterSlug = frontmatterString(frontmatter, 'slug');
  const version = frontmatterString(frontmatter, 'version');
  if (!name) addIssue(repoPath, 'frontmatter must include name');
  if (name && name !== slug) {
    addIssue(repoPath, `frontmatter name must match directory slug "${slug}"`);
  }
  if (!description) addIssue(repoPath, 'frontmatter must include description');
  if (frontmatterSlug && frontmatterSlug !== slug) {
    addIssue(repoPath, `frontmatter slug must match directory slug "${slug}"`);
  }
  if (version && !SEMVER_RE.test(version)) {
    addIssue(repoPath, 'frontmatter version must be semver');
  }
  if (registryEntry) {
    const expectedVersion = version || '0.1.0';
    if (registryEntry.description !== description) {
      addIssue('registry.json', `description for "${slug}" must match SKILL.md`);
    }
    if (registryEntry.version !== expectedVersion) {
      addIssue(
        'registry.json',
        `version for "${slug}" must match SKILL.md (${expectedVersion})`,
      );
    }
  }
}

async function validateXapiManifest(slug, skillRoot) {
  const manifestPath = join(skillRoot, 'xapi.skill.json');
  const repoPath = `skills/${slug}/xapi.skill.json`;
  let raw;
  try {
    raw = await readFile(manifestPath, 'utf8');
  } catch {
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (err) {
    addIssue(repoPath, `invalid JSON: ${err.message}`);
    return;
  }
  if (!manifest.schemaVersion) addIssue(repoPath, 'schemaVersion is required');
  if (manifest.slug !== slug) addIssue(repoPath, `slug must be "${slug}"`);
  if (!SEMVER_RE.test(manifest.version || '')) {
    addIssue(repoPath, 'version must be semver');
  }
  if (
    manifest.riskLevel != null &&
    !['low', 'medium', 'high'].includes(manifest.riskLevel)
  ) {
    addIssue(repoPath, 'riskLevel must be low, medium, or high');
  }
  if (
    manifest.xapiDependencies != null &&
    !Array.isArray(manifest.xapiDependencies)
  ) {
    addIssue(repoPath, 'xapiDependencies must be an array');
  }
}

async function listFiles(root) {
  const result = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else {
        result.push(path);
      }
    }
  }
  await walk(root);
  return result;
}

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  return match?.[1] ?? null;
}

function frontmatterString(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}\\s*:\\s*(.*)$`, 'm'));
  if (!match) return '';
  return stripYamlQuotes(match[1].trim());
}

function stripYamlQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function extensionOf(path) {
  const leaf = path.split('/').pop() ?? path;
  const dot = leaf.lastIndexOf('.');
  return dot >= 0 ? leaf.slice(dot).toLowerCase() : '';
}

function isTextFile(path) {
  return ['.json', '.md', '.txt', '.yaml', '.yml'].includes(extensionOf(path));
}

function scanSecrets(path, text) {
  const patterns = [
    ['PRIVATE_KEY', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ['JWT', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
    ['BEARER_TOKEN', /bearer\s+[A-Za-z0-9._~+/=-]{24,}/i],
    [
      'API_KEY_ASSIGNMENT',
      /(api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{16,}/i,
    ],
    ['XAPI_KEY', /sk-[A-Za-z0-9]{24,}/],
  ];
  for (const [code, pattern] of patterns) {
    if (pattern.test(text)) {
      addIssue(path, `possible secret detected: ${code}`);
    }
  }
}

await main();
