from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingService:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        print("[EMBEDDING_SERVICE] Initializing...")
        try:
            self.model = SentenceTransformer(model_name)
            print(f"[EMBEDDING_SERVICE] Model '{model_name}' loaded successfully.")
        except Exception as e:
            print(f"[EMBEDDING_SERVICE_ERROR] Could not load model: {e}")
            self.model = None

    def generate(self, text: str) -> np.ndarray | None:
        if not self.model or not text.strip():
            return None
        
        return self.model.encode(text, convert_to_numpy=True)

embedding_service = EmbeddingService()