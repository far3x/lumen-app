import re
import os
import tempfile
import logging
import json
import subprocess
import sys
from pygments import lex
from pygments.lexers import get_lexer_for_filename
from pygments.token import Comment
from pygments.util import ClassNotFound
import scrubadub

logger = logging.getLogger(__name__)

TRUFFLEHOG_RUNNER_SCRIPT = """
import sys
import json
import os
from trufflehog3.core import scan, load_config, load_rules, DEFAULT_RULES_FILE

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

def run_scan(filepath):
    try:
        dummy_config_path = os.path.join(os.path.dirname(filepath), ".trufflehog3.yml")
        config = load_config(dummy_config_path)
        rules = load_rules(DEFAULT_RULES_FILE)
        return scan(target=filepath, config=config, rules=rules, processes=1)
    except Exception as e:
        print(f"Trufflehog runner error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        results = run_scan(sys.argv[1])
        print(json.dumps(results, cls=SetEncoder))
"""

class SanitizationService:

    def _parse_codebase_string(self, codebase: str) -> list[dict]:
        parsed_files = []
        delimiter = "---lum--new--file--"
        
        parts = codebase.split(delimiter)
        for part in parts:
            if not part.strip():
                continue
            
            try:
                first_newline_index = part.find('\n')
                if first_newline_index == -1:
                    file_path = part.strip()
                    content = ""
                else:
                    file_path = part[:first_newline_index].strip()
                    content = part[first_newline_index+1:]
                
                if file_path:
                    parsed_files.append({"path": file_path, "content": content})
            except Exception as e:
                logger.warning(f"Could not parse a file part during sanitization: {e}")
                pass
        
        return parsed_files

    def _remove_comments(self, codebase: str) -> str:
        parsed_files = self._parse_codebase_string(codebase)
        rebuilt_parts = []

        for file_data in parsed_files:
            file_path = file_data["path"]
            file_content = file_data["content"]
            sanitized_content = file_content
            try:
                lexer = get_lexer_for_filename(file_path, stripall=False)
                tokens = lex(file_content, lexer)
                sanitized_content = "".join(token[1] for token in tokens if not token[0] in Comment)
            except ClassNotFound:
                pass
            except Exception as e:
                logger.warning(f"Comment removal failed for file '{file_path}', keeping original content. Error: {e}")
            
            rebuilt_parts.append(f"{file_data['path']}\n{sanitized_content}")
        
        return "---lum--new--file--" + "---lum--new--file--".join(rebuilt_parts)

    def _redact_secrets(self, content: str) -> str:
        sanitized_content = content
        content_filepath = None
        runner_filepath = None
        
        try:
            temp_dir = tempfile.gettempdir()
            with tempfile.NamedTemporaryFile(mode='w+', delete=False, encoding='utf-8', suffix='.tmp', dir=temp_dir) as content_file:
                content_file.write(content)
                content_filepath = content_file.name

            with tempfile.NamedTemporaryFile(mode='w+', delete=False, encoding='utf-8', suffix='_runner.py', dir=temp_dir) as runner_file:
                runner_file.write(TRUFFLEHOG_RUNNER_SCRIPT)
                runner_filepath = runner_file.name

            process = subprocess.run(
                [sys.executable, runner_filepath, content_filepath],
                capture_output=True,
                text=True,
                check=False,
                timeout=60 
            )

            if process.returncode != 0:
                logger.error(f"Secret scanning subprocess failed. Stderr: {process.stderr}")
                return sanitized_content

            found_issues = json.loads(process.stdout)

            for issue in found_issues:
                for secret_string in issue.get("stringsFound", []):
                    if secret_string:
                        sanitized_content = sanitized_content.replace(secret_string.strip(), "[REDACTED_SECRET]")

        except subprocess.TimeoutExpired:
            logger.error("Secret scanning subprocess timed out after 60 seconds.")
        except Exception as e:
            logger.error(f"An unexpected error occurred during secret scanning: {e}", exc_info=True)
        finally:
            if content_filepath and os.path.exists(content_filepath):
                os.unlink(content_filepath)
            if runner_filepath and os.path.exists(runner_filepath):
                os.unlink(runner_filepath)
                
        return sanitized_content

    def _redact_pii(self, content: str) -> str:
        sanitized_content = scrubadub.clean(content, replace_with='placeholder')
        sanitized_content = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '[REDACTED_IP]', sanitized_content)
        return sanitized_content

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