/**
 * SB3 File Processor
 * Handles unzipping .sb3 files and extracting project data and assets
 */

import JSZip from 'jszip';

export interface SB3ProjectData {
  project: any; // The project.json content
  assets: {
    [key: string]: string; // filename -> base64 data URL
  };
}

/**
 * Process a .sb3 file and extract project data and assets
 */
export async function processSB3File(file: File): Promise<SB3ProjectData> {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the ZIP file
    const zip = await JSZip.loadAsync(arrayBuffer);

    const assets: { [key: string]: string } = {};
    let projectData: any = null;

    // Process each file in the ZIP
    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue; // Skip directories

      if (filename === 'project.json') {
        // Extract project.json
        const content = await zipEntry.async('text');
        projectData = JSON.parse(content);
      } else if (filename.endsWith('.svg') || filename.endsWith('.png')) {
        // Extract SVG/PNG assets as base64 data URLs
        const content = await zipEntry.async('base64');
        const mimeType = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
        assets[filename] = `data:${mimeType};base64,${content}`;
      } else if (filename.endsWith('.wav') || filename.endsWith('.mp3')) {
        // Extract audio assets
        const content = await zipEntry.async('base64');
        const mimeType = filename.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
        assets[filename] = `data:${mimeType};base64,${content}`;
      }
    }

    if (!projectData) {
      throw new Error('No project.json found in the .sb3 file');
    }

    return {
      project: projectData,
      assets
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to process .sb3 file: ${error.message}`);
    }
    throw new Error('Failed to process .sb3 file: Unknown error');
  }
}

/**
 * Update project data to use local asset references
 */
export function updateProjectAssetReferences(
  projectData: any,
  assets: { [key: string]: string }
): any {
  const updatedProject = { ...projectData };

  // Update targets (sprites and stage)
  if (updatedProject.targets) {
    updatedProject.targets = updatedProject.targets.map((target: any) => {
      const updatedTarget = { ...target };

      // Update costumes
      if (updatedTarget.costumes) {
        updatedTarget.costumes = updatedTarget.costumes.map((costume: any) => {
          const assetKey = costume.md5ext || costume.assetId;
          if (assets[assetKey]) {
            return {
              ...costume,
              assetId: assetKey,
              dataFormat: assetKey.endsWith('.svg') ? 'svg' : 'png',
              data: assets[assetKey].split(',')[1] // Remove data URL prefix
            };
          }
          return costume;
        });
      }

      // Update sounds
      if (updatedTarget.sounds) {
        updatedTarget.sounds = updatedTarget.sounds.map((sound: any) => {
          const assetKey = sound.md5ext || sound.assetId;
          if (assets[assetKey]) {
            return {
              ...sound,
              assetId: assetKey,
              dataFormat: assetKey.endsWith('.wav') ? 'wav' : 'mp3',
              data: assets[assetKey].split(',')[1] // Remove data URL prefix
            };
          }
          return sound;
        });
      }

      return updatedTarget;
    });
  }

  return updatedProject;
}
