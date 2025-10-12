import numpy as np
import tiktoken
from google import genai
from google.genai import types
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self.model_name = 'gemini-embedding-001'
        else:
            self.client = None
            self.model_name = None
            logger.error("[EMBEDDING_SERVICE_ERROR] GEMINI_API_KEY is not configured!")

        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self.tokenizer = None
            logger.error("[EMBEDDING_SERVICE_ERROR] Could not load tiktoken tokenizer.")

    def generate(self, text: str) -> np.ndarray | None:
        if not self.client or not self.tokenizer or not text.strip():
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
            config = types.EmbedContentConfig(
                task_type="semantic_similarity",
                output_dimensionality=1536
            )
            
            batch_size = 100
            all_result_embeddings = []

            for i in range(0, len(text_chunks), batch_size):
                batch = text_chunks[i:i+batch_size]
                
                result = self.client.models.embed_content(
                    model=self.model_name,
                    contents=batch,
                    config=config
                )
                all_result_embeddings.extend(result.embeddings)

            embeddings = [np.array(e.values) for e in all_result_embeddings]

            if not embeddings:
                return None
            
            mean_embedding = np.mean(embeddings, axis=0)
            return mean_embedding

        except Exception as e:
            logger.error(f"[EMBEDDING_SERVICE_ERROR] Gemini API call failed: {e}")
            return None

embedding_service = EmbeddingService()