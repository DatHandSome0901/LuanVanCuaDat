import re
from typing import List, Dict, Any
from chatbot.utils.llm import LLM

class TranslationAgent:
    def __init__(self, llm_model=None):
        if llm_model is None:
            self.llm = LLM().get_llm()
        else:
            self.llm = llm_model

    def detect_language(self, text: str) -> str:
        """
        Detects if the text is in English or Vietnamese.
        Returns 'en' or 'vi'.
        """
        text_clean = text.strip()
        if not text_clean:
            return "vi"
        
        # Simple heuristic first: if there are Vietnamese diacritics, it's definitely Vietnamese.
        vietnamese_diacritics = re.compile(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]')
        if vietnamese_diacritics.search(text_clean):
            return "vi"

        # Otherwise, ask the LLM for high accuracy (especially for text without diacritics).
        prompt = f"""You are a language detection agent.
Analyze the following text and determine if it is written in English or Vietnamese.
If it is in English, return 'en'.
If it is in Vietnamese (even if it has no accents/diacritics, like "ngo quyen la ai" or "tran hung dao danh bai quan nguyen"), return 'vi'.
Return ONLY 'en' or 'vi'. Do not include any other words, explanation, or punctuation.

Text: {text_clean}"""
        try:
            res = self.llm.invoke(prompt)
            res_text = res.content if hasattr(res, "content") else str(res)
            res_text = re.sub(r"<think>.*?</think>", "", res_text, flags=re.DOTALL).strip().lower()
            if "en" in res_text:
                return "en"
            return "vi"
        except Exception as e:
            print(f"⚠️ Language detection failed, defaulting to 'vi'. Error: {e}")
            return "vi"

    def translate_query_to_vi(self, question: str, chat_history: List[Dict[str, str]] = None, is_english: bool = None) -> str:
        """
        Translates an English query to Vietnamese. Resolves pronouns using chat history if available.
        """
        # Guard clause: if the query is already Vietnamese, do not call translation LLM
        if is_english is False or (is_english is None and self.detect_language(question) == "vi"):
            return question

        history_str = ""
        if chat_history:
            history_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in chat_history[-4:]])

        prompt = f"""You are an expert translator specializing in Vietnamese history.
Translate the following English question about Vietnamese history into natural, contextually accurate Vietnamese.

If the question contains contextual pronouns (such as "he", "she", "it", "they", "this", "that time", "his", "her") and you are provided with Chat History below, resolve these pronouns to the correct historical figures or events based on the Chat History before translating.

Chat History:
{history_str}

English Question: "{question}"

Ensure that historical names, titles, and events are translated to their standard Vietnamese historical terms (e.g. "Ngo Quyen" -> "Ngô Quyền", "Battle of Bach Dang" -> "Trận Bạch Đằng", "Le dynasty" -> "Nhà Lê").
Return ONLY the translated Vietnamese question. Do not include any explanation, markdown formatting, or notes."""

        try:
            res = self.llm.invoke(prompt)
            res_text = res.content if hasattr(res, "content") else str(res)
            res_text = re.sub(r"<think>.*?</think>", "", res_text, flags=re.DOTALL).strip()
            print(f"DEBUG: Translated query to VI: '{question}' -> '{res_text}'")
            return res_text
        except Exception as e:
            print(f"⚠️ Query translation failed, returning original. Error: {e}")
            return question

    def translate_answer_to_en(self, answer: str) -> str:
        """
        Translates a Vietnamese answer to English.
        """
        if not answer.strip():
            return answer

        prompt = f"""You are an expert translator specializing in Vietnamese history.
Translate the following Vietnamese response about Vietnamese history into natural, high-quality, and grammatically correct English.
Keep any source references, structure, and formatting (like markdown list items) intact.
Ensure historical accuracy in terms and translation of historical names (e.g. translate "nhà Lý" to "Ly dynasty", "vua" to "king" or "emperor").
Return ONLY the translated English response. Do not include any introductory phrases, explanations, or notes.

Vietnamese Response:
{answer}"""

        try:
            res = self.llm.invoke(prompt)
            res_text = res.content if hasattr(res, "content") else str(res)
            res_text = re.sub(r"<think>.*?</think>", "", res_text, flags=re.DOTALL).strip()
            return res_text
        except Exception as e:
            print(f"⚠️ Answer translation failed, returning original. Error: {e}")
            return answer

    def translate_related_questions_to_en(self, questions: List[str]) -> List[str]:
        """
        Translates a list of Vietnamese related questions into English.
        """
        if not questions:
            return []
        
        questions_str = "\n".join(questions)
        prompt = f"""You are an expert translator specializing in Vietnamese history.
Translate the following list of Vietnamese follow-up questions into natural, contextually accurate English.
Each question should be translated to standard English while maintaining historical terms accurately.
Return ONLY the translated questions, one per line. Do not include numbers, bullets, or any explanation.

Questions:
{questions_str}"""
        try:
            res = self.llm.invoke(prompt)
            res_text = res.content if hasattr(res, "content") else str(res)
            res_text = re.sub(r"<think>.*?</think>", "", res_text, flags=re.DOTALL).strip()
            translated = [q.strip() for q in res_text.split("\n") if q.strip()]
            return translated[:len(questions)]
        except Exception as e:
            print(f"⚠️ Failed to translate related questions: {e}")
            return questions

    def translate_sources_to_en(self, sources: List[Any]) -> List[Any]:
        """
        Translates source filenames and contents to English in parallel.
        """
        if not sources:
            return []
        
        from app.routers.chatbot import SourceInfo
        from concurrent.futures import ThreadPoolExecutor

        def translate_filename(filename: str) -> str:
            if not filename.strip():
                return filename
            prompt_fn = f"""You are a translator specializing in historical documents.
Translate the following source filename/title into natural, contextually accurate English.
If it is a file name like 'Lich-su-Viet-Nam-tap-1.txt', translate the name part to English while preserving its filename extension and structure (e.g. 'History of Vietnam Volume 1.txt').
Return ONLY the translated name/title. Do not include quotes, explanations, or notes.

Title to translate: "{filename}" """
            try:
                res_fn = self.llm.invoke(prompt_fn)
                fn_text = res_fn.content if hasattr(res_fn, "content") else str(res_fn)
                fn_text = re.sub(r"<think>.*?</think>", "", fn_text, flags=re.DOTALL).strip().strip('"')
                return fn_text
            except Exception as e:
                print(f"⚠️ Failed to translate source filename: {e}")
                return filename

        def translate_content(content: str) -> str:
            if not content.strip():
                return content
            prompt_content = f"""You are a translator specializing in Vietnamese history.
Translate the following source document excerpt into natural, grammatically correct English.
Keep formatting intact (such as markdown headers like '### Document:', and bold tags like '**[Excerpt]**').
Return ONLY the translated content. Do not include any notes or explanations.

Source Excerpt to translate:
{content}"""
            try:
                res_content = self.llm.invoke(prompt_content)
                content_text = res_content.content if hasattr(res_content, "content") else str(res_content)
                content_text = re.sub(r"<think>.*?</think>", "", content_text, flags=re.DOTALL).strip()
                return content_text
            except Exception as e:
                print(f"⚠️ Failed to translate source content: {e}")
                return content

        # We have N sources, each needs two translation calls (filename and content).
        # We submit them all to a ThreadPoolExecutor to run in parallel.
        with ThreadPoolExecutor(max_workers=min(10, len(sources) * 2)) as executor:
            fn_futures = [executor.submit(translate_filename, src.filename) for src in sources]
            content_futures = [executor.submit(translate_content, src.content) for src in sources]
            
            fn_texts = [fut.result() for fut in fn_futures]
            content_texts = [fut.result() for fut in content_futures]
            
        translated_sources = []
        for i, src in enumerate(sources):
            translated_sources.append(SourceInfo(
                filename=fn_texts[i],
                content=content_texts[i],
                page=src.page,
                is_web=src.is_web,
                url=src.url
            ))
        return translated_sources
