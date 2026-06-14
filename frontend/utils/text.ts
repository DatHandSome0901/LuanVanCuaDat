/**
 * Utility functions for text processing.
 */

export const cleanVietnameseSelection = (text: string): string => {
  if (!text) return "";
  
  const vowels = "aeiouyăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ" + 
                 "aeiouyăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ".toUpperCase();
                 
  const accentMap: { [key: string]: string } = {
    '`': '\u0300',
    '\u02CB': '\u0300',
    '´': '\u0301',
    '\u02CA': '\u0301',
    "'": '\u0301',
    '\u02c9': '\u0309',
    '\u0309': '\u0309',
    '~': '\u0303',
    '\u02DC': '\u0303'
  };
  
  const accentsChars = Object.keys(accentMap).join("");
  const finalPattern = "(?:[uoyitmpcn]|ng|ch|nh)";
  
  // 1. Replace spacing accent followed by space and final syllable letters.
  // We use negative lookahead (?!...) to ensure the final consonant is not followed by a letter/vowel,
  // which prevents incorrectly matching the first letter of the next word.
  const patternInner = new RegExp(
    `([${vowels}])\\s*([${accentsChars}])\\s+(${finalPattern})(?![a-zA-Z${vowels}])`,
    'g'
  );
  let result = text.replace(patternInner, (match, v, acc, fin) => {
    const comb = accentMap[acc] || "";
    return v + comb + fin;
  });
  
  // 2. Replace remaining spacing accents (without space or at the end of word)
  const patternEnd = new RegExp(`([${vowels}])\\s*([${accentsChars}])`, 'g');
  result = result.replace(patternEnd, (match, v, acc) => {
    const comb = accentMap[acc] || "";
    return v + comb;
  });
  
  // 3. Normalize to NFD to separate combining diacritics
  result = result.normalize("NFD");
  
  // 4. Deduplicate combining tone marks (e.g. double acute, double grave from custom font rendering)
  result = result.replace(/\u0301+/g, '\u0301'); // acute
  result = result.replace(/\u0300+/g, '\u0300'); // grave
  result = result.replace(/\u0309+/g, '\u0309'); // hook above
  result = result.replace(/\u0303+/g, '\u0303'); // tilde
  result = result.replace(/\u0323+/g, '\u0323'); // dot below
  
  return result.normalize("NFC");
};
