import os
import zlib
import math
import json
import re
import tiktoken
import google.generativeai as genai
from sqlalchemy.orm import Session
import subprocess
import tempfile

from app.db import crud
from app.core.config import settings

class HybridValuationService:
    HALVING_THRESHOLD = 125_000_000
    GARBAGE_COMPRESSION_THRESHOLD = 0.1
    TOKEN_LIMIT = 700_000

    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)
            self.generation_config = genai.types.GenerationConfig(
                temperature=settings.GEMINI_TEMPERATURE
            )
        else:
            self.model = None
        
        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self.tokenizer = None

    def _parse_codebase(self, codebase: str) -> list[dict]:
        print("[VALUATION_STEP] Parsing codebase with delimiter...")
        parsed_files = []
        delimiter = "---lum--new--file--"
        
        parts = codebase.split(delimiter)
        for part in parts:
            if not part.strip():
                continue
            
            try:
                first_newline_index = part.find('\n')
                if first_newline_index == -1: continue 

                file_path = part[:first_newline_index].strip()
                content = part[first_newline_index+1:]
                
                if file_path:
                    parsed_files.append({"path": file_path, "content": content})
            except Exception as e:
                print(f"[VALUATION_ERROR] Could not parse file chunk: {e}")

        print(f"[VALUATION_STEP] Found {len(parsed_files)} file(s) in contribution.")
        return parsed_files

    def _perform_manual_analysis(self, parsed_files: list[dict]) -> dict:
        print("[VALUATION_STEP] Starting language-agnostic analysis...")
        analysis_data = {
            "total_lloc": 0,
            "total_tokens": 0,
            "avg_complexity": 0.0,
            "compression_ratio": 0.0,
            "language_breakdown": {}
        }
        
        all_content_str = ""
        total_complexity = 0
        total_files_with_complexity = 0

        with tempfile.TemporaryDirectory() as temp_dir:
            for file_data in parsed_files:
                try:
                    full_path = os.path.join(temp_dir, os.path.normpath(file_data["path"]))
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(file_data["content"])
                    
                    all_content_str += file_data["content"] + "\n"
                except (OSError, TypeError) as e:
                    print(f"[VALUATION_ERROR] Could not write temporary file {file_data.get('path', 'unknown')}: {e}")
                    continue

            if not any(os.scandir(temp_dir)):
                print("[VALUATION_WARNING] No files were written to temporary directory for analysis.")
                return analysis_data

            try:
                result = subprocess.run(
                    ['scc', '--format', 'json', temp_dir],
                    capture_output=True,
                    text=True,
                    check=True
                )
                scc_results = json.loads(result.stdout)
                
                for lang_summary in scc_results:
                    lang_name = lang_summary.get("Name")
                    if lang_name:
                        file_count = lang_summary.get("Count", 0)
                        analysis_data["language_breakdown"][lang_name] = analysis_data["language_breakdown"].get(lang_name, 0) + file_count
                        analysis_data["total_lloc"] += lang_summary.get("Code", 0)
                        
                        complexity = lang_summary.get("Complexity", 0)
                        if complexity > 0 and file_count > 0:
                            total_complexity += complexity
                            total_files_with_complexity += file_count

            except (subprocess.CalledProcessError, FileNotFoundError, json.JSONDecodeError) as e:
                print(f"[VALUATION_ERROR] Could not run or parse 'scc' tool: {e}")

        if self.tokenizer:
            analysis_data["total_tokens"] = len(self.tokenizer.encode(all_content_str))

        if total_files_with_complexity > 0:
            analysis_data["avg_complexity"] = total_complexity / total_files_with_complexity
        
        if all_content_str:
            original_size = len(all_content_str.encode('utf-8'))
            compressed_size = len(zlib.compress(all_content_str.encode('utf-8'), level=9))
            analysis_data["compression_ratio"] = compressed_size / original_size if original_size > 0 else 0

        print(f"[VALUATION_STEP] Universal analysis finished: {analysis_data}")
        return analysis_data

    def _get_ai_qualitative_scores(self, full_codebase: str, manual_metrics: dict) -> dict:
        print("[VALUATION_STEP] Preparing new, context-rich prompt for AI analysis...")
        if not self.model:
            return {"error": "AI model not configured."}

        normalized_complexity = min(manual_metrics.get('avg_complexity', 0) / 20.0, 1.0)

        prompt = f"""
        You are a senior software architect on the 'Lumen Protocol' review board. The Lumen Protocol rewards developers with crypto tokens for contributing valuable, high-quality source code to train next-generation AI models. Your task is to provide a qualitative analysis of a code submission from a contributor.

        I have performed a deterministic pre-analysis. Use these ACCURATE metrics as context for your qualitative judgement:
        
        Pre-Analysis Metrics:
        {{
          "language_breakdown": {json.dumps(manual_metrics.get('language_breakdown', {}))},
          "accurate_token_count": {manual_metrics.get('total_tokens', 0)},
          "logical_lines_of_code": {manual_metrics.get('total_lloc', 0)},
          "normalized_complexity_score": {normalized_complexity:.2f}
        }}

        Critically evaluate the submission and return ONLY a single, minified JSON object with the following schema. Do not add comments or explanations.

        Schema:
        {{
          "project_clarity_score": "float",
          "architectural_quality_score": "float",
          "code_quality_score": "float",
          "analysis_summary": "string"
        }}

        Guidelines for scoring (0.0 to 1.0):
        - project_clarity_score: How original, clear, and non-generic is the project's purpose? A simple 'to-do app' is 0.1. A specialized, domain-specific tool is 0.9.
        - architectural_quality_score: How well is the code structured? Does it follow good design patterns (e.g., SOLID)? A single monolithic file is 0.1. A well-organized, modular project is 0.9.
        - code_quality_score: How clean is the code itself? Assess variable names, comments, and potential for bugs. Clean, maintainable code is 0.9. Messy, hard-to-read code is 0.1.
        
        Analyze this contributed codebase:
        ---
        {full_codebase}
        ---
        """
        
        print(f"[VALUATION_STEP] Submitting refined prompt to Gemini...")
        try:
            response = self.model.generate_content(prompt, generation_config=self.generation_config)
            print("[VALUATION_STEP] Received response from Gemini.")
            cleaned_response = re.sub(r'^```json\s*|\s*```$', '', response.text.strip(), flags=re.MULTILINE)
            print("[VALUATION_STEP] AI analysis finished.")
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"[VALUATION_ERROR] Error calling Gemini API: {e}")
            return {"error": str(e)}

    def calculate(self, db: Session, codebase: str) -> dict:
        parsed_files = self._parse_codebase(codebase)
        if not parsed_files:
            return {"final_reward": 0.0, "valuation_details": {}}

        manual_metrics = self._perform_manual_analysis(parsed_files)
        
        if manual_metrics['compression_ratio'] < self.GARBAGE_COMPRESSION_THRESHOLD:
            print("[VALUATION_GATE] Code failed quality gate: compression ratio too low. Likely garbage.")
            manual_metrics["final_reward"] = 0.0
            manual_metrics["analysis_summary"] = "Contribution rejected due to extremely low entropy (highly repetitive content)."
            return {"final_reward": 0.0, "valuation_details": manual_metrics}

        if manual_metrics['total_tokens'] > self.TOKEN_LIMIT:
            print(f"[VALUATION_GATE] Code failed quality gate: token count ({manual_metrics['total_tokens']}) exceeds limit of {self.TOKEN_LIMIT}.")
            manual_metrics["analysis_summary"] = f"Contribution rejected: Codebase is too large ({manual_metrics['total_tokens']} tokens). The current limit is {self.TOKEN_LIMIT} tokens. Please optimize or reduce the size of your submission."
            return {"final_reward": 0.0, "valuation_details": manual_metrics}

        if manual_metrics['total_tokens'] == 0:
            return {"final_reward": 0.0, "valuation_details": manual_metrics}

        ai_scores = {}
        if settings.VALUATION_MODE == "AI" and self.model:
            full_codebase_content = "\n".join([f["content"] for f in parsed_files])
            ai_scores = self._get_ai_qualitative_scores(full_codebase_content, manual_metrics)
        else:
            scope_score = math.log10(manual_metrics.get('total_lloc', 1) + 1)
            structure_score = (math.log10(manual_metrics.get('avg_complexity', 1) + 1) * 2) + (manual_metrics.get('compression_ratio') * 2.5)
            final_manual_score = scope_score * structure_score
            ai_scores = {
                "project_clarity_score": final_manual_score / 15,
                "architectural_quality_score": final_manual_score / 15,
                "code_quality_score": final_manual_score / 15
            }

        clarity = float(ai_scores.get("project_clarity_score", 0.5))
        architecture = float(ai_scores.get("architectural_quality_score", 0.5))
        code_quality = float(ai_scores.get("code_quality_score", 0.5))

        base_value = (manual_metrics['total_tokens'] ** 0.6) * 0.1
        
        stats = crud.get_network_stats(db)
        
        if manual_metrics['avg_complexity'] > 0 and stats and stats.std_dev_complexity > 0:
            rarity_multiplier = 1.0 + math.tanh((manual_metrics['avg_complexity'] - stats.mean_complexity) / stats.std_dev_complexity)
        else:
            rarity_multiplier = 1.0
        
        halving_multiplier = 0.5 ** (stats.total_lum_distributed / self.HALVING_THRESHOLD) if stats else 1.0

        ai_weighted_multiplier = (clarity * 0.5) + (architecture * 0.3) + (code_quality * 0.2)
        
        final_reward = base_value * rarity_multiplier * halving_multiplier * ai_weighted_multiplier
        
        valuation_details = manual_metrics.copy()
        valuation_details.update({
            "project_clarity_score": clarity,
            "architectural_quality_score": architecture,
            "code_quality_score": code_quality,
            "analysis_summary": ai_scores.get("analysis_summary"),
            "rarity_multiplier": round(rarity_multiplier, 4),
            "halving_multiplier": round(halving_multiplier, 4),
            "final_reward": round(final_reward, 4)
        })

        return {"final_reward": final_reward, "valuation_details": valuation_details}

hybrid_valuation_service = HybridValuationService()