# File chứa các hàm helper chung
import unicodedata
import re

def example_helper_function():
    return "This is a helper function"

def clean_vietnamese_text(text: str) -> str:
    if not text:
        return text
        
    # Standardize all letters (vowels and capitalizations)
    vowels = "aeiouyăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ"
    vowels += vowels.upper()
    
    combining_grave = chr(0x0300)
    combining_acute = chr(0x0301)
    combining_hook = chr(0x0309)
    combining_tilde = chr(0x0303)
    
    accent_map = {
        '`': combining_grave,
        '\u02CB': combining_grave,
        '´': combining_acute,
        '\u02CA': combining_acute,
        "'": combining_acute,
        '\u02c9': combining_hook,
        '\u0309': combining_hook,
        '~': combining_tilde,
        '\u02DC': combining_tilde
    }
    
    accents_chars = "".join(accent_map.keys())
    final_pattern = r"(?:[uoyitmpcn]|ng|ch|nh)"
    
    # 1. Replace spacing accent followed by space and final syllable letters
    def sub_inner(m):
        v = m.group(1)
        acc = m.group(2)
        fin = m.group(3)
        comb = accent_map.get(acc, "")
        return f"{v}{comb}{fin}"
        
    pattern_inner = re.compile(
        fr"([{vowels}])\s*([{accents_chars}])\s+({final_pattern})(?=\b|\s|$|[^a-zA-Z{vowels}])"
    )
    result = pattern_inner.sub(sub_inner, text)
    
    # 2. Replace remaining spacing accents (without space or at the end of word)
    def sub_end(m):
        v = m.group(1)
        acc = m.group(2)
        comb = accent_map.get(acc, "")
        return f"{v}{comb}"
        
    pattern_end = re.compile(fr"([{vowels}])\s*([{accents_chars}])")
    result = pattern_end.sub(sub_end, result)
    
    # Normalize to NFD to separate combining diacritics
    result = unicodedata.normalize("NFD", result)
    
    # Deduplicate combining tone marks
    result = re.sub(r"\u0301+", "\u0301", result) # acute
    result = re.sub(r"\u0300+", "\u0300", result) # grave
    result = re.sub(r"\u0309+", "\u0309", result) # hook above
    result = re.sub(r"\u0303+", "\u0303", result) # tilde
    result = re.sub(r"\u0323+", "\u0323", result) # dot below
    
    return unicodedata.normalize("NFC", result)
