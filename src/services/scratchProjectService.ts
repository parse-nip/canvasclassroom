/**
 * Scratch Project Service
 * Fetches and analyzes Scratch projects from scratch.mit.edu URLs
 */

import { ScratchProjectAnalysis, ScratchSprite, ScratchBlock } from '../types';

// Scratch block categories mapping
const BLOCK_CATEGORIES: Record<string, string> = {
  // Motion
  'motion_movesteps': 'motion',
  'motion_turnright': 'motion',
  'motion_turnleft': 'motion',
  'motion_goto': 'motion',
  'motion_gotoxy': 'motion',
  'motion_glideto': 'motion',
  'motion_glidesecstoxy': 'motion',
  'motion_pointindirection': 'motion',
  'motion_pointtowards': 'motion',
  'motion_changexby': 'motion',
  'motion_setx': 'motion',
  'motion_changeyby': 'motion',
  'motion_sety': 'motion',
  'motion_ifonedgebounce': 'motion',
  'motion_setrotationstyle': 'motion',
  'motion_xposition': 'motion',
  'motion_yposition': 'motion',
  'motion_direction': 'motion',
  
  // Looks
  'looks_sayforsecs': 'looks',
  'looks_say': 'looks',
  'looks_thinkforsecs': 'looks',
  'looks_think': 'looks',
  'looks_switchcostumeto': 'looks',
  'looks_nextcostume': 'looks',
  'looks_switchbackdropto': 'looks',
  'looks_nextbackdrop': 'looks',
  'looks_changesizeby': 'looks',
  'looks_setsizeto': 'looks',
  'looks_changeeffectby': 'looks',
  'looks_seteffectto': 'looks',
  'looks_cleargraphiceffects': 'looks',
  'looks_show': 'looks',
  'looks_hide': 'looks',
  'looks_gotofrontback': 'looks',
  'looks_goforwardbackwardlayers': 'looks',
  'looks_costumenumbername': 'looks',
  'looks_backdropnumbername': 'looks',
  'looks_size': 'looks',
  
  // Sound
  'sound_playuntildone': 'sound',
  'sound_play': 'sound',
  'sound_stopallsounds': 'sound',
  'sound_changeeffectby': 'sound',
  'sound_seteffectto': 'sound',
  'sound_cleareffects': 'sound',
  'sound_changevolumeby': 'sound',
  'sound_setvolumeto': 'sound',
  'sound_volume': 'sound',
  
  // Events
  'event_whenflagclicked': 'events',
  'event_whenkeypressed': 'events',
  'event_whenthisspriteclicked': 'events',
  'event_whenbackdropswitchesto': 'events',
  'event_whengreaterthan': 'events',
  'event_whenbroadcastreceived': 'events',
  'event_broadcast': 'events',
  'event_broadcastandwait': 'events',
  
  // Control
  'control_wait': 'control',
  'control_repeat': 'control',
  'control_forever': 'control',
  'control_if': 'control',
  'control_if_else': 'control',
  'control_wait_until': 'control',
  'control_repeat_until': 'control',
  'control_stop': 'control',
  'control_start_as_clone': 'control',
  'control_create_clone_of': 'control',
  'control_delete_this_clone': 'control',
  
  // Sensing
  'sensing_touchingobject': 'sensing',
  'sensing_touchingcolor': 'sensing',
  'sensing_coloristouchingcolor': 'sensing',
  'sensing_distanceto': 'sensing',
  'sensing_askandwait': 'sensing',
  'sensing_answer': 'sensing',
  'sensing_keypressed': 'sensing',
  'sensing_mousedown': 'sensing',
  'sensing_mousex': 'sensing',
  'sensing_mousey': 'sensing',
  'sensing_setdragmode': 'sensing',
  'sensing_loudness': 'sensing',
  'sensing_timer': 'sensing',
  'sensing_resettimer': 'sensing',
  'sensing_of': 'sensing',
  'sensing_current': 'sensing',
  'sensing_dayssince2000': 'sensing',
  'sensing_username': 'sensing',
  
  // Operators
  'operator_add': 'operators',
  'operator_subtract': 'operators',
  'operator_multiply': 'operators',
  'operator_divide': 'operators',
  'operator_random': 'operators',
  'operator_gt': 'operators',
  'operator_lt': 'operators',
  'operator_equals': 'operators',
  'operator_and': 'operators',
  'operator_or': 'operators',
  'operator_not': 'operators',
  'operator_join': 'operators',
  'operator_letter_of': 'operators',
  'operator_length': 'operators',
  'operator_contains': 'operators',
  'operator_mod': 'operators',
  'operator_round': 'operators',
  'operator_mathop': 'operators',
  
  // Variables
  'data_setvariableto': 'variables',
  'data_changevariableby': 'variables',
  'data_showvariable': 'variables',
  'data_hidevariable': 'variables',
  'data_addtolist': 'variables',
  'data_deleteoflist': 'variables',
  'data_deletealloflist': 'variables',
  'data_insertatlist': 'variables',
  'data_replaceitemoflist': 'variables',
  'data_itemoflist': 'variables',
  'data_itemnumoflist': 'variables',
  'data_lengthoflist': 'variables',
  'data_listcontainsitem': 'variables',
  'data_showlist': 'variables',
  'data_hidelist': 'variables',
  
  // My Blocks (Custom)
  'procedures_definition': 'myblocks',
  'procedures_call': 'myblocks',
  'procedures_prototype': 'myblocks',
  'argument_reporter_string_number': 'myblocks',
  'argument_reporter_boolean': 'myblocks',
};

// Human-readable block names for lesson generation
const BLOCK_NAMES: Record<string, string> = {
  'motion_movesteps': 'move steps',
  'motion_turnright': 'turn right',
  'motion_turnleft': 'turn left',
  'motion_goto': 'go to',
  'motion_gotoxy': 'go to x y',
  'motion_glideto': 'glide to',
  'motion_glidesecstoxy': 'glide seconds to x y',
  'motion_pointindirection': 'point in direction',
  'motion_changexby': 'change x by',
  'motion_changeyby': 'change y by',
  'motion_setx': 'set x',
  'motion_sety': 'set y',
  'motion_ifonedgebounce': 'if on edge bounce',
  'motion_xposition': 'x position',
  'motion_yposition': 'y position',
  
  'looks_sayforsecs': 'say for seconds',
  'looks_say': 'say',
  'looks_thinkforsecs': 'think for seconds',
  'looks_think': 'think',
  'looks_switchcostumeto': 'switch costume',
  'looks_nextcostume': 'next costume',
  'looks_changesizeby': 'change size by',
  'looks_setsizeto': 'set size to',
  'looks_show': 'show',
  'looks_hide': 'hide',
  
  'sound_playuntildone': 'play sound until done',
  'sound_play': 'play sound',
  'sound_stopallsounds': 'stop all sounds',
  
  'event_whenflagclicked': 'when flag clicked',
  'event_whenkeypressed': 'when key pressed',
  'event_whenthisspriteclicked': 'when sprite clicked',
  'event_broadcast': 'broadcast',
  'event_whenbroadcastreceived': 'when I receive',
  
  'control_wait': 'wait',
  'control_repeat': 'repeat',
  'control_forever': 'forever',
  'control_if': 'if',
  'control_if_else': 'if else',
  'control_wait_until': 'wait until',
  'control_repeat_until': 'repeat until',
  'control_stop': 'stop',
  'control_create_clone_of': 'create clone',
  'control_delete_this_clone': 'delete this clone',
  'control_start_as_clone': 'when I start as clone',
  
  'sensing_touchingobject': 'touching',
  'sensing_touchingcolor': 'touching color',
  'sensing_distanceto': 'distance to',
  'sensing_askandwait': 'ask and wait',
  'sensing_answer': 'answer',
  'sensing_keypressed': 'key pressed',
  'sensing_mousedown': 'mouse down',
  'sensing_mousex': 'mouse x',
  'sensing_mousey': 'mouse y',
  'sensing_timer': 'timer',
  'sensing_resettimer': 'reset timer',
  
  'operator_add': 'add',
  'operator_subtract': 'subtract',
  'operator_multiply': 'multiply',
  'operator_divide': 'divide',
  'operator_random': 'pick random',
  'operator_gt': 'greater than',
  'operator_lt': 'less than',
  'operator_equals': 'equals',
  'operator_and': 'and',
  'operator_or': 'or',
  'operator_not': 'not',
  
  'data_setvariableto': 'set variable',
  'data_changevariableby': 'change variable by',
  'data_addtolist': 'add to list',
  'data_deleteoflist': 'delete from list',
  'data_itemoflist': 'item of list',
  'data_lengthoflist': 'length of list',
  
  'procedures_definition': 'define block',
  'procedures_call': 'call custom block',
};

/**
 * Extract project ID from various Scratch URL formats
 */
export function extractProjectId(url: string): string | null {
  // Handle various URL formats:
  // https://scratch.mit.edu/projects/123456789/
  // https://scratch.mit.edu/projects/123456789
  // https://scratch.mit.edu/projects/123456789/editor
  // https://scratch.mit.edu/projects/123456789/fullscreen
  // 123456789 (just the ID)
  
  const trimmedUrl = url.trim();
  
  // If it's just a number, return it
  if (/^\d+$/.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // Extract from URL
  const match = trimmedUrl.match(/scratch\.mit\.edu\/projects\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch project metadata from Scratch API
 */
async function fetchProjectMetadata(projectId: string): Promise<any> {
  const response = await fetch(`https://api.scratch.mit.edu/projects/${projectId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch project metadata: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch project JSON data (blocks, sprites, etc.)
 */
async function fetchProjectData(projectId: string): Promise<any> {
  // The project token endpoint gives us the project data
  const response = await fetch(`https://projects.scratch.mit.edu/${projectId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch project data: ${response.status}`);
  }
  return response.json();
}

/**
 * Extract blocks from a sprite/target
 */
function extractBlocks(target: any): ScratchBlock[] {
  const blocks: ScratchBlock[] = [];
  
  if (!target.blocks) return blocks;
  
  for (const blockId in target.blocks) {
    const block = target.blocks[blockId];
    if (block.opcode) {
      blocks.push({
        opcode: block.opcode,
        category: BLOCK_CATEGORIES[block.opcode] || 'other',
        inputs: block.inputs,
        fields: block.fields,
      });
    }
  }
  
  return blocks;
}

/**
 * Determine project complexity based on blocks used
 */
function determineComplexity(
  totalBlocks: number,
  uniqueCategories: string[],
  hasClones: boolean,
  hasCustomBlocks: boolean,
  hasVariables: boolean,
  hasBroadcasts: boolean
): 'Beginner' | 'Intermediate' | 'Advanced' {
  let score = 0;
  
  // Block count scoring
  if (totalBlocks > 100) score += 2;
  else if (totalBlocks > 50) score += 1;
  
  // Category diversity
  if (uniqueCategories.length >= 6) score += 2;
  else if (uniqueCategories.length >= 4) score += 1;
  
  // Advanced features
  if (hasClones) score += 2;
  if (hasCustomBlocks) score += 2;
  if (hasVariables) score += 1;
  if (hasBroadcasts) score += 1;
  
  if (score >= 6) return 'Advanced';
  if (score >= 3) return 'Intermediate';
  return 'Beginner';
}

/**
 * Detect the type of project based on blocks used
 */
function detectProjectType(blocks: ScratchBlock[]): string {
  const opcodes = blocks.map(b => b.opcode);
  
  // Game indicators
  const hasCollisionDetection = opcodes.some(o => o.includes('sensing_touching'));
  const hasScoring = opcodes.some(o => o.includes('data_change') || o.includes('data_set'));
  const hasKeyboardInput = opcodes.some(o => o === 'event_whenkeypressed' || o === 'sensing_keypressed');
  const hasClones = opcodes.some(o => o.includes('clone'));
  const hasTimer = opcodes.some(o => o.includes('timer'));
  
  // Animation indicators
  const hasCostumeChanges = opcodes.some(o => o.includes('looks_switch') || o.includes('looks_next'));
  const hasGlide = opcodes.some(o => o.includes('glide'));
  const hasWait = opcodes.some(o => o === 'control_wait');
  
  // Story indicators
  const hasSayBlocks = opcodes.some(o => o.includes('looks_say') || o.includes('looks_think'));
  const hasBroadcasts = opcodes.some(o => o.includes('broadcast'));
  
  // Determine type
  if (hasCollisionDetection && (hasScoring || hasKeyboardInput)) {
    if (hasClones) return 'game-with-clones';
    return 'game';
  }
  
  if (hasSayBlocks && hasBroadcasts && hasWait) {
    return 'story';
  }
  
  if (hasCostumeChanges && hasGlide && hasWait) {
    return 'animation';
  }
  
  if (opcodes.filter(o => o.includes('motion')).length > 5) {
    return 'animation';
  }
  
  return 'interactive';
}

/**
 * Extract programming concepts from blocks used
 */
function extractConcepts(blocks: ScratchBlock[]): string[] {
  const concepts: string[] = [];
  const opcodes = new Set(blocks.map(b => b.opcode));
  
  // Motion concepts
  if (opcodes.has('motion_movesteps') || opcodes.has('motion_gotoxy')) {
    concepts.push('movement');
  }
  if (opcodes.has('motion_turnright') || opcodes.has('motion_turnleft')) {
    concepts.push('rotation');
  }
  if (opcodes.has('motion_ifonedgebounce')) {
    concepts.push('edge bouncing');
  }
  
  // Events
  if (opcodes.has('event_whenflagclicked')) {
    concepts.push('event handling');
  }
  if (opcodes.has('event_whenkeypressed')) {
    concepts.push('keyboard input');
  }
  if (opcodes.has('event_broadcast') || opcodes.has('event_whenbroadcastreceived')) {
    concepts.push('broadcasting');
  }
  
  // Control
  if (opcodes.has('control_forever')) {
    concepts.push('infinite loops');
  }
  if (opcodes.has('control_repeat')) {
    concepts.push('repeat loops');
  }
  if (opcodes.has('control_if') || opcodes.has('control_if_else')) {
    concepts.push('conditionals');
  }
  if (opcodes.has('control_wait')) {
    concepts.push('timing');
  }
  if (opcodes.has('control_create_clone_of')) {
    concepts.push('cloning');
  }
  
  // Sensing
  if (opcodes.has('sensing_touchingobject') || opcodes.has('sensing_touchingcolor')) {
    concepts.push('collision detection');
  }
  if (opcodes.has('sensing_mousex') || opcodes.has('sensing_mousey')) {
    concepts.push('mouse tracking');
  }
  if (opcodes.has('sensing_keypressed')) {
    concepts.push('key detection');
  }
  if (opcodes.has('sensing_askandwait')) {
    concepts.push('user input');
  }
  
  // Operators
  if (opcodes.has('operator_random')) {
    concepts.push('randomness');
  }
  if (opcodes.has('operator_gt') || opcodes.has('operator_lt') || opcodes.has('operator_equals')) {
    concepts.push('comparisons');
  }
  if (opcodes.has('operator_and') || opcodes.has('operator_or')) {
    concepts.push('boolean logic');
  }
  
  // Variables
  if (opcodes.has('data_setvariableto') || opcodes.has('data_changevariableby')) {
    concepts.push('variables');
  }
  if (opcodes.has('data_addtolist') || opcodes.has('data_itemoflist')) {
    concepts.push('lists');
  }
  
  // Looks
  if (opcodes.has('looks_switchcostumeto') || opcodes.has('looks_nextcostume')) {
    concepts.push('costume animation');
  }
  if (opcodes.has('looks_show') || opcodes.has('looks_hide')) {
    concepts.push('visibility');
  }
  if (opcodes.has('looks_changesizeby') || opcodes.has('looks_setsizeto')) {
    concepts.push('scaling');
  }
  
  // Custom blocks
  if (opcodes.has('procedures_definition')) {
    concepts.push('custom blocks');
  }
  
  return concepts;
}

/**
 * Get human-readable block name
 */
export function getBlockName(opcode: string): string {
  return BLOCK_NAMES[opcode] || opcode.replace(/_/g, ' ').replace(/^[a-z]+_/, '');
}

/**
 * Analyze a Scratch project and extract relevant information
 */
export async function analyzeScratchProject(projectUrl: string): Promise<ScratchProjectAnalysis> {
  const projectId = extractProjectId(projectUrl);
  
  if (!projectId) {
    throw new Error('Invalid Scratch project URL. Please provide a valid scratch.mit.edu project link.');
  }
  
  // Fetch both metadata and project data
  const [metadata, projectData] = await Promise.all([
    fetchProjectMetadata(projectId),
    fetchProjectData(projectId),
  ]);
  
  // Extract sprites and blocks
  const sprites: ScratchSprite[] = [];
  let allBlocks: ScratchBlock[] = [];
  
  for (const target of projectData.targets || []) {
    const blocks = extractBlocks(target);
    allBlocks = allBlocks.concat(blocks);
    
    sprites.push({
      name: target.name,
      isStage: target.isStage || false,
      costumes: target.costumes?.length || 0,
      sounds: target.sounds?.length || 0,
      blocks,
    });
  }
  
  // Calculate statistics
  const uniqueBlockTypes = [...new Set(allBlocks.map(b => b.opcode))];
  const categories = [...new Set(allBlocks.map(b => b.category))];
  const concepts = extractConcepts(allBlocks);
  const projectType = detectProjectType(allBlocks);
  
  // Determine complexity
  const hasClones = uniqueBlockTypes.some(t => t.includes('clone'));
  const hasCustomBlocks = uniqueBlockTypes.some(t => t.includes('procedures'));
  const hasVariables = uniqueBlockTypes.some(t => t.includes('data_'));
  const hasBroadcasts = uniqueBlockTypes.some(t => t.includes('broadcast'));
  
  const complexity = determineComplexity(
    allBlocks.length,
    categories,
    hasClones,
    hasCustomBlocks,
    hasVariables,
    hasBroadcasts
  );
  
  return {
    projectId,
    title: metadata.title || 'Untitled',
    author: metadata.author?.username,
    description: metadata.description,
    sprites,
    totalBlocks: allBlocks.length,
    uniqueBlockTypes,
    categories,
    complexity,
    concepts,
    projectType,
  };
}

/**
 * Generate a summary of the project for AI prompt
 */
export function generateProjectSummary(analysis: ScratchProjectAnalysis): string {
  const spritesSummary = analysis.sprites
    .filter(s => !s.isStage)
    .map(s => `- ${s.name}: ${s.blocks.length} blocks, ${s.costumes} costumes`)
    .join('\n');
  
  const blocksSummary = analysis.uniqueBlockTypes
    .slice(0, 20)
    .map(getBlockName)
    .join(', ');
  
  return `
PROJECT ANALYSIS:
Title: ${analysis.title}
Author: ${analysis.author || 'Unknown'}
Description: ${analysis.description || 'No description'}
Project Type: ${analysis.projectType}
Complexity: ${analysis.complexity}
Total Blocks: ${analysis.totalBlocks}

SPRITES:
${spritesSummary}

CATEGORIES USED: ${analysis.categories.join(', ')}

KEY BLOCKS USED: ${blocksSummary}

PROGRAMMING CONCEPTS: ${analysis.concepts.join(', ')}
`.trim();
}

