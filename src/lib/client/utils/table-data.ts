import type { TranscriptDisplay, TableRow } from '$lib/shared/types';

/**
 * Convert transcript data to unified table row format
 */
export function transcriptToTableRow(transcript: TranscriptDisplay): TableRow {
  return {
    id: transcript.id,
    name: transcript.summary.substring(0, 50) + (transcript.summary.length > 50 ? '...' : ''),
    // Use the unique relative file path as the row identity. Transcript `id`s
    // (e.g. "transcript_v1r1") are only unique within a folder, so different
    // folders' transcripts collide and TanStack collapses them into one row.
    path: transcript._filePath || transcript.id,
    type: 'transcript', // Use consistent 'transcript' type
    model: transcript.model,
    split: transcript.split,
    summary: transcript.summary,
    scores: transcript.scores,
    concerningScore: transcript.concerningScore,
    judgeSummary: transcript.judgeSummary,
    justification: transcript.justification,
    tags: transcript.tags,
    originalTranscript: transcript,
  };
}

/**
 * Since we now use unified TableRow type, no conversion needed!
 * The folder tree data is already in the correct TanStack Table format.
 * This function now just ensures proper logging for debugging.
 */
export function folderTreeToTableRows(folderTree: TableRow[]): TableRow[] {
  // return folderTree.map(node => {
  //   // if (node.type === 'folder') {
  //   //   console.log('🏗️ [DEBUG] Processing folder node:', { 
  //   //     name: node.name, 
  //   //     path: node.path,
  //   //     subRowsCount: node.subRows?.length || 0,
  //   //     subRowsTypes: node.subRows?.map(child => ({ type: child.type, name: child.name })) || []
  //   //   });
  //   // }
  //   return node; // No conversion needed - already in correct format!
  // });
  return folderTree;
}

/**
 * Convert flat transcript list to table row format
 */
export function transcriptsToTableRows(transcripts: TranscriptDisplay[]): TableRow[] {
  return transcripts.map(transcriptToTableRow);
}