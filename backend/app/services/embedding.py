from sentence_transformers import SentenceTransformer
import numpy as np
import threading

class EmbeddingService:
    _model = None
    _lock = threading.Lock()

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model_name = model_name
        # The print statement is removed from __init__ because initialization is now trivial.
        # The real initialization happens in get_model().

    def get_model(self):
        """
        Lazily initializes and returns the SentenceTransformer model.
        This method is thread-safe.
        """
        if EmbeddingService._model is None:
            with EmbeddingService._lock:
                # Double-check if another thread initialized it while waiting for the lock
                if EmbeddingService._model is None:
                    print(f"[EMBEDDING_SERVICE] Lazily initializing model '{self.model_name}'...")
                    try:
                        EmbeddingService._model = SentenceTransformer(self.model_name)
                        print(f"[EMBEDDING_SERVICE] Model '{self.model_name}' loaded successfully.")
                    except Exception as e:
                        print(f"[EMBEDDING_SERVICE_ERROR] Could not load model: {e}")
                        # _model remains None, so it might retry on the next call
        return EmbeddingService._model

    def generate(self, text: str) -> np.ndarray | None:
        model = self.get_model()
        if model is None or not text.strip():
            return None
        
        return model.encode(text, convert_to_numpy=True)

# Create an instance of the service.
# This is now a very cheap operation as the model is not loaded here.
embedding_service = EmbeddingService()