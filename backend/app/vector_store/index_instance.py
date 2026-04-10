from pathlib import Path
import os

from app.vector_store.faiss_index import FaissIndex

# Set the dimension according to your embedding size, e.g., 768 or 384
VECTOR_DIM = 384
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
VECTOR_STORE_DIR = DATA_DIR / "vector_store"

faiss_index = FaissIndex(dim=VECTOR_DIM, storage_dir=VECTOR_STORE_DIR)
# faiss_index = None
