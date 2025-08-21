import re
import os
import tempfile
import logging
from pygments import lex
from pygments.lexers import guess_lexer
from pygments.token import Comment
from pygments.util import ClassNotFound

logger = logging.getLogger(__name__)

class SanitizationService:
    def _remove_comments(self, content: str) -> str:
        try:
            lexer = guess_lexer(content, stripall=True)
            tokens = lex(content, lexer)
            return "".join(token[1] for token in tokens if not isinstance(token[0], type(Comment.Single)))
        except ClassNotFound:
            return content
        except Exception as e:
            logger.warning(f"Comment removal failed with unexpected error: {e}")
            return content

    def _redact_secrets(self, content: str) -> str:
        try:
            from trufflehog3.core import scan, load_config, load_rules, DEFAULT_RULES_FILE
        except ImportError:
            logger.error("trufflehog3 is not installed. Secrets will not be redacted.")
            return content

        sanitized_content = content
        tmp_filepath = None
        try:
            with tempfile.NamedTemporaryFile(mode='w+', delete=False, encoding='utf-8', suffix='.tmp') as tmp_file:
                tmp_file.write(content)
                tmp_filepath = tmp_file.name

            dummy_config_path = os.path.join(tempfile.gettempdir(), ".trufflehog3.yml")
            config = load_config(dummy_config_path)
            rules = load_rules(DEFAULT_RULES_FILE)
            
            found_issues = scan(target=tmp_filepath, config=config, rules=rules, processes=1)

            for issue in found_issues:
                for secret_string in issue.get("stringsFound", []):
                    if secret_string:
                        sanitized_content = sanitized_content.replace(secret_string.strip(), "[REDACTED_SECRET]")
        except Exception as e:
            logger.warning(f"Secret scanning with trufflehog3 failed: {e}")
        finally:
            if tmp_filepath and os.path.exists(tmp_filepath):
                os.unlink(tmp_filepath)
        return sanitized_content

    def _redact_pii(self, content: str) -> str:
        try:
            import scrubadub
            sanitized_content = scrubadub.clean(content, replace_with='placeholder')
            sanitized_content = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '[REDACTED_IP]', sanitized_content)
            return sanitized_content
        except ImportError:
            logger.error("scrubadub is not installed. PII will not be redacted.")
            return content

    def sanitize_code(self, content: str) -> str:
        if not content or not isinstance(content, str):
            return ""

        logger.info("Sanitization Step 1: Removing comments...")
        uncommented_code = self._remove_comments(content)
        
        logger.info("Sanitization Step 2: Redacting secrets...")
        unsecreted_code = self._redact_secrets(uncommented_code)
        
        logger.info("Sanitization Step 3: Redacting PII...")
        sanitized_code = self._redact_pii(unsecreted_code)

        final_code = re.sub(r'\n\s*\n', '\n\n', sanitized_code).strip()
        logger.info("Sanitization complete.")
        return final_code

sanitization_service = SanitizationService()