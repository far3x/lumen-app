from sentence_transformers import SentenceTransformer
import numpy as np
import threading

class EmbeddingService:
    _model = None
    _lock = threading.Lock()

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model_name = model_name

    def get_model(self):
        if EmbeddingService._model is None:
            with EmbeddingService._lock:
                if EmbeddingService._model is None:
                    print(f"[EMBEDDING_SERVICE] Lazily initializing model '{self.model_name}'...")
                    try:
                        EmbeddingService._model = SentenceTransformer(self.model_name)
                        print(f"[EMBEDDING_SERVICE] Model '{self.model_name}' loaded successfully.")
                    except Exception as e:
                        print(f"[EMBEDDING_SERVICE_ERROR] Could not load model: {e}")
        return EmbeddingService._model

    def generate(self, text: str) -> np.ndarray | None:
        model = self.get_model()
        if model is None or not text.strip():
            return None
        
        return model.encode(text, convert_to_numpy=True)

embedding_service = EmbeddingService()