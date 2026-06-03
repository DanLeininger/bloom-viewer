import { promises as fs } from 'fs';
import path from 'path';
import type { ConfigIndex, TranscriptIndexEntry, SuiteIndex, AggregatedIndex } from './index-types';
import { extractModelName } from '$lib/shared/utils/transcript-utils';

// Server-side check
if (typeof window !== 'undefined') {
  throw new Error('index-builder can only be used on the server side');
}

const INDEX_VERSION = '1.0';
const INDEX_FILENAME = '_index.json';

/**
 * Build index for a single config directory
 */
export async function buildConfigIndex(
  transcriptDir: string,
  configPath: string
): Promise<ConfigIndex | null> {
  try {
    const fullConfigPath = path.resolve(transcriptDir, configPath);
    console.log(`📊 [INDEX-BUILDER] Building index for: ${configPath}`);

    // Read judgment.json for summary statistics and metajudge data
    let summaryStatistics: any = undefined;
    let metajudge: any = undefined;

    try {
      const judgmentPath = path.join(fullConfigPath, 'judgment.json');
      const judgmentContent = await fs.readFile(judgmentPath, 'utf-8');
      const judgmentData = JSON.parse(judgmentContent);

      summaryStatistics = judgmentData.summary_statistics;
      metajudge = {
        response: judgmentData.metajudgment_response,
        justification: judgmentData.metajudgment_justification
      };
    } catch (error) {
      console.warn(`⚠️ [INDEX-BUILDER] No judgment.json found for ${configPath}`);
    }

    // Read evaluation.json for metadata tags
    let evaluationMetadata: any = undefined;

    try {
      const evaluationPath = path.join(fullConfigPath, 'evaluation.json');
      const evaluationContent = await fs.readFile(evaluationPath, 'utf-8');
      const evaluationData = JSON.parse(evaluationContent);

      evaluationMetadata = evaluationData.metadata || {};
    } catch (error) {
      console.warn(`⚠️ [INDEX-BUILDER] No evaluation.json found for ${configPath}`);
    }

    // Scan for transcript files
    const entries = await fs.readdir(fullConfigPath, { withFileTypes: true });
    const transcriptFiles = entries
      .filter(entry => entry.isFile() && entry.name.startsWith('transcript_') && entry.name.endsWith('.json'))
      .map(entry => entry.name);

    console.log(`📁 [INDEX-BUILDER] Found ${transcriptFiles.length} transcript files in ${configPath}`);

    // Extract metadata from each transcript
    const transcripts: TranscriptIndexEntry[] = [];
    let auditorModel: string | undefined;
    let targetModel: string | undefined;

    for (const filename of transcriptFiles) {
      try {
        const transcriptPath = path.join(fullConfigPath, filename);

        // Read only the beginning of the file to get metadata
        const fileHandle = await fs.open(transcriptPath, 'r');
        const buffer = Buffer.alloc(10240); // Read first 10KB
        await fileHandle.read(buffer, 0, 10240, 0);
        await fileHandle.close();

        const content = buffer.toString('utf-8');

        // Try to parse the metadata section
        // Look for the metadata object which should be near the start
        const metadataMatch = content.match(/"metadata"\s*:\s*\{[^}]*?"transcript_id"\s*:\s*"([^"]+)"[^}]*?"judge_output"\s*:\s*\{/);

        if (!metadataMatch) {
          // Fallback: parse the entire partial content
          try {
            const partialData = JSON.parse(content + '}}}}'); // Add closing braces in case truncated
          } catch {
            // If that fails, read the full file
            const fullContent = await fs.readFile(transcriptPath, 'utf-8');
            const fullData = JSON.parse(fullContent);

            if (!auditorModel) auditorModel = fullData.metadata?.auditor_model;
            if (!targetModel) targetModel = fullData.metadata?.target_model;

            const transcriptId = fullData.metadata?.transcript_id || filename.replace('.json', '');
            const summary = fullData.metadata?.judge_output?.summary || fullData.metadata?.description || 'No summary available';
            const scores = fullData.metadata?.judge_output?.scores || {};
            const scoreDescriptions = fullData.metadata?.judge_output?.score_descriptions;

            const relativePath = path.relative(transcriptDir, transcriptPath).replace(/\\/g, '/');

            transcripts.push({
              id: filename.replace('.json', ''),
              transcript_id: transcriptId,
              _filePath: relativePath,
              summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
              scores,
              scoreDescriptions
            });

            continue;
          }
        }

        // If we found metadata in the first 10KB, try to parse it more carefully
        const fullContent = await fs.readFile(transcriptPath, 'utf-8');
        const data = JSON.parse(fullContent);

        if (!auditorModel) auditorModel = data.metadata?.auditor_model;
        if (!targetModel) targetModel = data.metadata?.target_model;

        const transcriptId = data.metadata?.transcript_id || filename.replace('.json', '');
        const summary = data.metadata?.judge_output?.summary || data.metadata?.description || 'No summary available';
        const scores = data.metadata?.judge_output?.scores || {};
        const scoreDescriptions = data.metadata?.judge_output?.score_descriptions;

        const relativePath = path.relative(transcriptDir, transcriptPath).replace(/\\/g, '/');

        transcripts.push({
          id: filename.replace('.json', ''),
          transcript_id: transcriptId,
          _filePath: relativePath,
          summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
          scores,
          scoreDescriptions
        });
      } catch (error) {
        console.error(`❌ [INDEX-BUILDER] Failed to process ${filename}:`, error);
      }
    }

    // Extract config name from path
    const pathParts = configPath.split('/');
    const configName = pathParts[pathParts.length - 1];

    const index: ConfigIndex = {
      version: INDEX_VERSION,
      generated_at: new Date().toISOString(),
      config: {
        name: configName,
        path: configPath,
        auditor_model: auditorModel,
        target_model: targetModel,
        transcript_count: transcripts.length
      },
      summary_statistics: summaryStatistics,
      metajudge,
      evaluation_metadata: evaluationMetadata,
      transcripts
    };

    console.log(`✅ [INDEX-BUILDER] Built index for ${configPath} with ${transcripts.length} transcripts`);
    return index;

  } catch (error) {
    console.error(`❌ [INDEX-BUILDER] Failed to build index for ${configPath}:`, error);
    return null;
  }
}

/**
 * Store a config index in the config directory
 */
export async function storeConfigIndex(transcriptDir: string, configPath: string, index: ConfigIndex): Promise<void> {
  const configDirPath = path.join(transcriptDir, configPath);
  const indexFilePath = path.join(configDirPath, INDEX_FILENAME);

  await fs.writeFile(indexFilePath, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`💾 [INDEX-BUILDER] Stored index: ${configPath}/${INDEX_FILENAME}`);
}

/**
 * Load a config index from the config directory
 */
export async function loadConfigIndex(transcriptDir: string, configPath: string): Promise<ConfigIndex | null> {
  try {
    const configDirPath = path.join(transcriptDir, configPath);
    const indexFilePath = path.join(configDirPath, INDEX_FILENAME);

    const content = await fs.readFile(indexFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Determine whether a cached _index.json is stale relative to its source files.
 *
 * The index aggregates data from judgment.json (summary statistics + metajudge),
 * evaluation.json (metadata tags) and the transcript_*.json files. Bloom often
 * writes _index.json mid-run (e.g. after rollout, before the metajudgment step
 * finishes), so a cached index can be missing summary_statistics/metajudge that
 * the now-complete judgment.json contains. Treat the index as stale whenever any
 * of those sources has a newer mtime than the index itself, forcing a rebuild.
 */
async function isIndexStale(transcriptDir: string, configPath: string): Promise<boolean> {
  const configDirPath = path.join(transcriptDir, configPath);
  const indexFilePath = path.join(configDirPath, INDEX_FILENAME);

  let indexMtime: number;
  try {
    indexMtime = (await fs.stat(indexFilePath)).mtimeMs;
  } catch {
    return true; // No index on disk -> needs building.
  }

  try {
    const entries = await fs.readdir(configDirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const isSource =
        entry.name === 'judgment.json' ||
        entry.name === 'evaluation.json' ||
        (entry.name.startsWith('transcript_') && entry.name.endsWith('.json'));
      if (!isSource) continue;

      const sourceMtime = (await fs.stat(path.join(configDirPath, entry.name))).mtimeMs;
      if (sourceMtime > indexMtime) return true;
    }
  } catch {
    // If we can't scan the directory, don't force a rebuild loop.
    return false;
  }

  return false;
}

/**
 * Scan a directory for all config folders (folders containing judgment.json or transcript files)
 */
async function findConfigFolders(transcriptDir: string, basePath: string = ''): Promise<string[]> {
  const configs: string[] = [];
  const currentPath = path.join(transcriptDir, basePath);

  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    // Check if this directory itself is a config (has judgment.json or transcript files)
    const hasJudgment = entries.some(e => e.isFile() && e.name === 'judgment.json');
    const hasTranscripts = entries.some(e => e.isFile() && e.name.startsWith('transcript_') && e.name.endsWith('.json'));

    if (hasJudgment || hasTranscripts) {
      configs.push(basePath);
      return configs; // Don't recurse into config folders
    }

    // Otherwise, recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subPath = basePath ? path.join(basePath, entry.name) : entry.name;
        const subConfigs = await findConfigFolders(transcriptDir, subPath);
        configs.push(...subConfigs);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${currentPath}:`, error);
  }

  return configs;
}

/**
 * Build indexes for all configs in the transcript directory
 */
export async function buildAllIndexes(transcriptDir: string): Promise<void> {
  console.log(`🔍 [INDEX-BUILDER] Scanning for config folders in: ${transcriptDir}`);

  const configPaths = await findConfigFolders(transcriptDir);
  console.log(`📊 [INDEX-BUILDER] Found ${configPaths.length} config folders`);

  let successCount = 0;
  let failCount = 0;

  for (const configPath of configPaths) {
    try {
      const index = await buildConfigIndex(transcriptDir, configPath);
      if (index) {
        await storeConfigIndex(transcriptDir, configPath, index);
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.error(`Failed to build/store index for ${configPath}:`, error);
      failCount++;
    }
  }

  console.log(`✅ [INDEX-BUILDER] Completed: ${successCount} successful, ${failCount} failed`);
}

/**
 * Load all indexes by dynamically scanning the directory structure
 */
export async function loadAggregatedIndexes(transcriptDir: string): Promise<AggregatedIndex> {
  console.log(`📊 [INDEX-BUILDER] Loading indexes by scanning: ${transcriptDir}`);

  // Find all config folders
  const configPaths = await findConfigFolders(transcriptDir);
  console.log(`📁 [INDEX-BUILDER] Found ${configPaths.length} config folders`);

  // Load index for each config
  const configIndexes: ConfigIndex[] = [];

  for (const configPath of configPaths) {
    try {
      const index = await loadConfigIndex(transcriptDir, configPath);
      const stale = await isIndexStale(transcriptDir, configPath);

      // Reuse the cached index only if it exists, its path matches (folder might
      // have been moved), and it isn't stale relative to its source files.
      if (index && index.config.path === configPath && !stale) {
        configIndexes.push(index);
      } else {
        if (index && stale) {
          console.warn(`⚠️ [INDEX-BUILDER] Index for ${configPath} is stale (source files newer), rebuilding`);
        } else if (index) {
          console.warn(`⚠️ [INDEX-BUILDER] Index path mismatch for ${configPath} (stored: ${index.config.path}), rebuilding`);
        } else {
          console.warn(`⚠️ [INDEX-BUILDER] No index found for ${configPath}, building fresh`);
        }

        // Rebuild index if it doesn't exist, path doesn't match, or it's stale.
        const newIndex = await buildConfigIndex(transcriptDir, configPath);
        if (newIndex) {
          await storeConfigIndex(transcriptDir, configPath, newIndex);
          configIndexes.push(newIndex);
        }
      }
    } catch (error) {
      console.error(`Failed to load index for ${configPath}:`, error);
    }
  }

  // Group configs by suite (first path component)
  const suiteMap = new Map<string, ConfigIndex[]>();

  for (const config of configIndexes) {
    const pathParts = config.config.path.split('/');
    const suiteName = pathParts[0];

    if (!suiteMap.has(suiteName)) {
      suiteMap.set(suiteName, []);
    }
    suiteMap.get(suiteName)!.push(config);
  }

  // Build suite array
  const suites: SuiteIndex[] = Array.from(suiteMap.entries()).map(([name, configs]) => ({
    name,
    path: name,
    configs
  }));

  console.log(`✅ [INDEX-BUILDER] Loaded ${configIndexes.length} config indexes in ${suites.length} suites`);

  return {
    version: INDEX_VERSION,
    generated_at: new Date().toISOString(),
    suites
  };
}

/**
 * Clear all cached indexes by deleting _index.json files in config directories
 */
export async function clearIndexCache(transcriptDir: string): Promise<void> {
  try {
    const configPaths = await findConfigFolders(transcriptDir);
    let deletedCount = 0;

    for (const configPath of configPaths) {
      try {
        const indexPath = path.join(transcriptDir, configPath, INDEX_FILENAME);
        await fs.unlink(indexPath);
        deletedCount++;
      } catch (error) {
        // Index file might not exist, that's okay
      }
    }

    console.log(`🗑️ [INDEX-BUILDER] Cleared ${deletedCount} cached indexes`);
  } catch (error) {
    console.error('Failed to clear index cache:', error);
  }
}
