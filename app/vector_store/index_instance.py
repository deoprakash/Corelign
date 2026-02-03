from pathlib import Path

from app.vector_store.faiss_index import FaissIndex

# Set the dimension according to your embedding size, e.g., 768 or 384
VECTOR_DIM = 384
VECTOR_STORE_DIR = Path("data/vector_store")

faiss_index = FaissIndex(dim=VECTOR_DIM, storage_dir=VECTOR_STORE_DIR)
