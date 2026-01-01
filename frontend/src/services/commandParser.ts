/**
 * Command Parser
 * Parses voice command text into structured command objects
 */

export interface ParsedCommand {
  action: string;
  params?: {
    unitNumber?: number;
  };
}

/**
 * English command vocabulary
 */
const ENGLISH_COMMANDS = {
  play: ['play', 'start', 'resume'],
  pause: ['pause', 'stop'],
  next: ['next', 'next unit', 'next chapter', 'forward'],
  previous: ['previous', 'prev', 'back', 'backward', 'last'],
  bookmark: ['bookmark', 'save', 'mark'],
  removeBookmark: ['remove bookmark', 'unbookmark', 'delete bookmark'],
  home: ['home', 'back to books', 'books', 'library'],
  goToUnit: ['go to unit', 'unit', 'chapter'], // Followed by number
};

/**
 * Bengali command vocabulary
 */
const BENGALI_COMMANDS = {
  play: ['চালাও', 'চালান', 'শুরু কর', 'প্লে', 'play'],
  pause: ['থামাও', 'থামান', 'বন্ধ কর', 'pause'],
  next: ['পরবর্তী', 'আগামী', 'সামনে', 'next'],
  previous: ['পূর্ববর্তী', 'পিছনে', 'গত', 'previous'],
  bookmark: ['বুকমার্ক', 'সংরক্ষণ', 'মার্ক', 'bookmark'],
  removeBookmark: ['বুকমার্ক সরাও', 'অসংরক্ষণ', 'remove bookmark'],
  home: ['বাড়ি', 'হোম', 'বই', 'home'],
  goToUnit: ['ইউনিটে যাও', 'অধ্যায়', 'unit'], // Followed by number
};

/**
 * Extract numbers from text (supports both English and Bengali numerals)
 */
function extractNumber(text: string): number | null {
  // Extract English numbers
  const englishMatch = text.match(/\d+/);
  if (englishMatch) {
    return parseInt(englishMatch[0], 10);
  }

  // Extract Bengali numerals (০-৯)
  const bengaliNumerals: { [key: string]: number } = {
    '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4,
    '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
  };

  const bengaliMatch = text.match(/[০-৯]+/);
  if (bengaliMatch) {
    const bengaliNumber = bengaliMatch[0];
    let result = 0;
    for (const char of bengaliNumber) {
      if (bengaliNumerals[char] !== undefined) {
        result = result * 10 + bengaliNumerals[char];
      }
    }
    return result > 0 ? result : null;
  }

  return null;
}

/**
 * Normalize text for matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if text contains any of the command phrases
 */
function matchesCommand(
  normalizedText: string,
  commandPhrases: string[]
): boolean {
  return commandPhrases.some((phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    // Check for exact match or contains match
    return (
      normalizedText === normalizedPhrase ||
      normalizedText.includes(normalizedPhrase) ||
      normalizedPhrase.includes(normalizedText)
    );
  });
}

/**
 * Parse voice command text into a structured command object
 */
export function parseCommand(text: string): ParsedCommand | null {
  const normalized = normalizeText(text);

  // Combine all commands for matching
  const allCommands = {
    ...ENGLISH_COMMANDS,
    ...BENGALI_COMMANDS,
  };

  // Check each command type
  for (const [action, phrases] of Object.entries(allCommands)) {
    if (matchesCommand(normalized, phrases as string[])) {
      // Special handling for goToUnit - extract number
      if (action === 'goToUnit') {
        const number = extractNumber(text);
        if (number !== null && number > 0) {
          return {
            action,
            params: { unitNumber: number },
          };
        }
        // If no number found, treat as regular "go to unit" (could default to next)
        return { action: 'next' };
      }

      return { action };
    }
  }

  // Check for removeBookmark (longer phrases first)
  if (
    matchesCommand(normalized, [
      ...ENGLISH_COMMANDS.removeBookmark,
      ...BENGALI_COMMANDS.removeBookmark,
    ])
  ) {
    return { action: 'removeBookmark' };
  }

  // Check for goToUnit with number patterns
  const unitNumberPatterns = [
    /(?:go to|unit|chapter|ইউনিটে যাও|অধ্যায়)\s*(\d+|[০-৯]+)/i,
    /(\d+|[০-৯]+)\s*(?:unit|chapter|ইউনিট|অধ্যায়)/i,
  ];

  for (const pattern of unitNumberPatterns) {
    const match = text.match(pattern);
    if (match) {
      const number = extractNumber(match[1] || text);
      if (number !== null && number > 0) {
        return {
          action: 'goToUnit',
          params: { unitNumber: number },
        };
      }
    }
  }

  return null;
}

