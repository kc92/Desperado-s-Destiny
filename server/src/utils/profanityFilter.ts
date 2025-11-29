/**
 * Profanity Filter Utility
 *
 * Filters profanity and offensive language from chat messages
 */

/**
 * Comprehensive list of profanity and offensive terms
 * This list covers common profanity in multiple variations
 */
const PROFANITY_LIST: string[] = [
  // Common profanity (asterisked for safety)
  'ass', 'asshole', 'bastard', 'bitch', 'bullshit', 'crap', 'damn', 'fuck',
  'fucking', 'fucked', 'fucker', 'hell', 'shit', 'shit', 'piss', 'cunt',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'motherfucker', 'fag', 'faggot',
  'nigger', 'nigga', 'retard', 'retarded', 'gay', 'homo', 'dyke', 'tranny',

  // Variations and misspellings
  'arse', 'arsehole', 'azz', 'biatch', 'b1tch', 'biotch', 'bollock', 'bollocks',
  'bugger', 'bullcrap', 'cocksucker', 'coochie', 'cooter', 'coon', 'cracker',
  'cumming', 'dickhead', 'dildo', 'douche', 'douchebag', 'feck', 'fellatio',
  'frick', 'fricking', 'frigger', 'friggin', 'fuk', 'fvck', 'goddamn', 'goddam',
  'jackass', 'jerkoff', 'kike', 'knobhead', 'minge', 'mofo', 'pecker',
  'pissed', 'pissoff', 'prick', 'schlong', 'screwed', 'shag', 'shagged',
  'shite', 'skank', 'slapper', 'slag', 'spic', 'spick', 'tit', 'tits',
  'tosser', 'twat', 'wank', 'wanker', 'wetback',

  // L33t speak variations
  'a55', 'a55hole', 'b1tch', 'f4g', 'f4gg0t', 'fuk', 'fuq', 'sh1t', 'sh!t',
  'n1gga', 'n1gger', 'pu55y', 'd1ck', 'c0ck', 'c0cksucker',

  // Slurs and hate speech
  'chink', 'gook', 'sandnigger', 'towelhead', 'beaner', 'muzzie', 'raghead',

  // Sexual content
  'anal', 'anus', 'blowjob', 'boob', 'boobs', 'clitoris', 'cum', 'cumshot',
  'ejaculate', 'fap', 'fellate', 'handjob', 'jizz', 'masturbate', 'orgasm',
  'penetrate', 'penis', 'phuck', 'porn', 'porno', 'pornography', 'semen',
  'sex', 'sexy', 'testicle', 'vagina', 'vulva',

  // Additional offensive terms
  'kkk', 'nazi', 'hitler', 'genocide', 'rape', 'raping', 'rapist',

  // Compound variations
  'asshat', 'asswipe', 'buttface', 'butthead', 'clusterfuck', 'dipshit',
  'dumbass', 'dumbfuck', 'fuckboy', 'fuckface', 'fucktard', 'horseshit',
  'jackoff', 'numbnuts', 'shithead', 'shitface', 'shitstain'
];

/**
 * L33t speak character mappings
 */
const LEET_MAPPINGS: Record<string, string[]> = {
  'a': ['a', '4', '@', '^'],
  'e': ['e', '3'],
  'i': ['i', '1', '!', '|'],
  'o': ['o', '0'],
  's': ['s', '5', '$'],
  't': ['t', '7', '+'],
  'l': ['l', '1', '|'],
  'g': ['g', '9'],
  'z': ['z', '2']
};

/**
 * Build regex pattern for a word with l33t variations
 */
function buildLeetPattern(word: string): RegExp {
  let pattern = '';

  for (const char of word.toLowerCase()) {
    if (LEET_MAPPINGS[char]) {
      pattern += `[${LEET_MAPPINGS[char].join('')}]`;
    } else {
      pattern += char;
    }
  }

  // Word boundary with optional special characters
  return new RegExp(`\\b${pattern}\\b`, 'gi');
}

/**
 * Build all profanity patterns (done once at module load)
 */
const PROFANITY_PATTERNS: RegExp[] = PROFANITY_LIST.map(word => {
  return buildLeetPattern(word);
});

/**
 * Simple word-boundary patterns for exact matches
 */
const SIMPLE_PATTERNS: RegExp[] = PROFANITY_LIST.map(word => {
  return new RegExp(`\\b${word}\\b`, 'gi');
});

/**
 * Filter profanity from content
 * Replaces profane words with asterisks
 *
 * @param content - The message content to filter
 * @returns Filtered content with profanity replaced by asterisks
 */
export function filterProfanity(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let filtered = content;

  // First pass: simple exact matches (faster)
  for (const pattern of SIMPLE_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => {
      return '*'.repeat(match.length);
    });
  }

  // Second pass: l33t speak variations (more thorough)
  for (const pattern of PROFANITY_PATTERNS) {
    filtered = filtered.replace(pattern, (match) => {
      return '*'.repeat(match.length);
    });
  }

  return filtered;
}

/**
 * Check if content contains profanity
 *
 * @param content - The message content to check
 * @returns True if profanity detected, false otherwise
 */
export function containsProfanity(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Check simple patterns first (faster)
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }

  // Check l33t speak variations
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }

  return false;
}

/**
 * Get list of profane words detected in content
 * Useful for admin logging
 *
 * @param content - The message content to analyze
 * @returns Array of detected profane words
 */
export function detectProfanity(content: string): string[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const detected: Set<string> = new Set();

  for (let i = 0; i < PROFANITY_LIST.length; i++) {
    const word = PROFANITY_LIST[i];
    const pattern = SIMPLE_PATTERNS[i];

    if (pattern && pattern.test(content)) {
      detected.add(word);
    }
  }

  return Array.from(detected);
}

/**
 * Calculate profanity severity score
 * Higher score = more severe
 *
 * @param content - The message content to score
 * @returns Severity score (0 = clean, higher = more profane)
 */
export function calculateProfanitySeverity(content: string): number {
  const detectedWords = detectProfanity(content);

  if (detectedWords.length === 0) {
    return 0;
  }

  // Base score: number of unique profane words
  let score = detectedWords.length * 10;

  // Bonus for particularly severe terms
  const severeTerms = ['nigger', 'nigga', 'fag', 'faggot', 'cunt', 'rape'];
  const severeCount = detectedWords.filter(word =>
    severeTerms.includes(word)
  ).length;

  score += severeCount * 50;

  return score;
}

export default {
  filterProfanity,
  containsProfanity,
  detectProfanity,
  calculateProfanitySeverity
};
