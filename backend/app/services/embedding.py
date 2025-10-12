import numpy as np
import tiktoken
import google as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model_name = 'models/embedding-001'
        else:
            self.model_name = None
            logger.error("[EMBEDDING_SERVICE_ERROR] GEMINI_API_KEY is not configured!")

        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self.tokenizer = None
            logger.error("[EMBEDDING_SERVICE_ERROR] Could not load tiktoken tokenizer.")

    def generate(self, text: str) -> np.ndarray | None:
        if not self.model_name or not self.tokenizer or not text.strip():
            return None

        max_tokens_per_chunk = 2048
        
        tokens = self.tokenizer.encode(text, disallowed_special=())
        if not tokens:
            return None

        text_chunks = []
        for i in range(0, len(tokens), max_tokens_per_chunk):
            chunk_tokens = tokens[i : i + max_tokens_per_chunk]
            text_chunk = self.tokenizer.decode(chunk_tokens)
            if text_chunk.strip():
                text_chunks.append(text_chunk)

        if not text_chunks:
            return None
        
        try:
            batch_size = 100
            all_embeddings = []

            for i in range(0, len(text_chunks), batch_size):
                batch = text_chunks[i:i+batch_size]
                result = genai.embed_content(
                    model=self.model_name,
                    content=batch,
                    task_type="semantic_similarity",
                    output_dimensionality=1536
                )
                all_embeddings.extend(result['embedding'])

            if not all_embeddings:
                return None
            
            mean_embedding = np.mean(all_embeddings, axis=0)
            return mean_embedding

        except Exception as e:
            logger.error(f"[EMBEDDING_SERVICE_ERROR] Gemini API call failed: {e}")
            return None

embedding_service = EmbeddingService()