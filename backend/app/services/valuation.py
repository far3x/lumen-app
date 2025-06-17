import os
import zlib
import math
from sqlalchemy.orm import Session
from radon.complexity import cc_visit
from radon.raw import analyze as raw_analyze
from pygments.lexers import get_lexer_for_filename, guess_lexer
from pygments.util import ClassNotFound
from app.db import crud

class AdvancedValuationService:
    HALVING_THRESHOLD = 125_000_000
    
    def _get_files_from_codebase(self, codebase: str) -> dict[str, str]:
        files = {}
        current_file_path = None
        current_file_content = []

        for line in codebase.splitlines():
            if line.startswith("--- file: "):
                if current_file_path:
                    files[current_file_path] = "\n".join(current_file_content)
                current_file_path = line[len("--- file: "):].strip()
                current_file_content = []
            else:
                if current_file_path:
                    current_file_content.append(line)
        
        if current_file_path:
            files[current_file_path] = "\n".join(current_file_content)

        return files

    def calculate(self, db: Session, codebase: str) -> dict:
        files = self._get_files_from_codebase(codebase)
        if not files:
            return {"final_reward": 0.0, "valuation_details": {}}
        
        total_lines = 0
        total_complexity = 0
        complex_file_count = 0
        
        for file_path, content in files.items():
            try:
                lexer = get_lexer_for_filename(file_path, code=content)
            except ClassNotFound:
                try:
                    lexer = guess_lexer(content)
                except ClassNotFound:
                    continue
            
            try:
                raw_metrics = raw_analyze(content)
                total_lines += raw_metrics.lloc
                
                complexity_blocks = cc_visit(content)
                file_complexity = sum(block.complexity for block in complexity_blocks)
                if file_complexity > 0:
                    total_complexity += file_complexity
                    complex_file_count += 1
            except Exception:
                continue

        avg_complexity = (total_complexity / complex_file_count) if complex_file_count > 0 else 0
        if total_lines == 0:
            return {"final_reward": 0.0, "valuation_details": {}}
        
        base_value = math.log(total_lines + 1) * math.log(avg_complexity + 1) * 5.0

        compressed_size = len(zlib.compress(codebase.encode('utf-8'), level=9))
        original_size = len(codebase.encode('utf-8'))
        compression_ratio = compressed_size / original_size if original_size > 0 else 0
        
        quality_multiplier = min(compression_ratio / 0.4, 1.0)
        
        stats = crud.get_network_stats(db)
        if stats:
            z_score = (avg_complexity - stats.mean_complexity) / stats.std_dev_complexity if stats.std_dev_complexity > 0 else 0
            rarity_multiplier = 1.0 + math.tanh(z_score)
            
            halving_exponent = stats.total_lum_distributed / self.HALVING_THRESHOLD
            halving_multiplier = 0.5 ** halving_exponent
        else:
            rarity_multiplier = 1.0
            halving_multiplier = 1.0
        
        final_reward = base_value * quality_multiplier * rarity_multiplier * halving_multiplier

        valuation_details = {
            "total_lines": total_lines,
            "avg_complexity": round(avg_complexity, 2),
            "compression_ratio": round(compression_ratio, 4),
            "quality_multiplier": round(quality_multiplier, 4),
            "rarity_multiplier": round(rarity_multiplier, 4),
            "halving_multiplier": round(halving_multiplier, 4),
            "final_reward": round(final_reward, 4)
        }
        
        return {"final_reward": final_reward, "valuation_details": valuation_details}

advanced_valuation_service = AdvancedValuationService()