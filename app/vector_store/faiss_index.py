# import faiss 
# import numpy as np

# class FaissIndex:
#     def __init__(self, dim: int):
#         self.index = faiss.IndexFlatL2(dim)
#         self.chunk_ids = []
#         self.ids = []  # Initialize ids to avoid AttributeError
    
#     def add_vectors(self, vectors: np.ndarray, chunk_ids=None):
#         self.index.add(vectors)
#         if chunk_ids:
#             self.chunk_ids.extend(chunk_ids)
#             self.ids.extend(chunk_ids)  # Keep ids in sync if needed
#         print("FAISS IDS:", self.ids)
    
#     def search(self, vectors, top_k:int):
#         return self.index.search(vectors, top_k)

#     def get_chunk_ids(self, indices):
#         return [self.chunk_ids[i] for i in indices if i < len(self.chunk_ids)]
        

import json
from pathlib import Path
from typing import List, Sequence, Union

import faiss
import numpy as np


class FaissIndex:
    def __init__(self, dim: int, storage_dir: Union[str, Path] = "data/vector_store"):
        self.dim = dim
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.storage_dir / "faiss.index"
        self.meta_file = self.storage_dir / "chunk_ids.json"

        self.index = faiss.IndexFlatL2(dim)
        self.chunk_ids: List[str] = []

        self.load_from_disk()

    @property
    def has_vectors(self) -> bool:
        return self.index.ntotal > 0 and len(self.chunk_ids) >= self.index.ntotal

    def add_vectors(self, vectors: np.ndarray, chunk_ids: Sequence[Union[str, int]]):
        assert len(vectors) == len(chunk_ids), "Vectors and chunk_ids length mismatch"

        if vectors.dtype != np.float32:
            vectors = vectors.astype(np.float32)

        self.index.add(vectors)
        self.chunk_ids.extend([str(cid) for cid in chunk_ids])
        print(f"FAISS vectors stored: {self.index.ntotal}")

    def search(self, vectors: np.ndarray, top_k: int) -> List[str]:
        if self.index.ntotal == 0:
            return []

        if vectors.dtype != np.float32:
            vectors = vectors.astype(np.float32)

        _, indices = self.index.search(vectors, top_k)
        return [
            self.chunk_ids[i] for i in indices[0] if 0 <= i < len(self.chunk_ids)
        ]

    def save_to_disk(self) -> None:
        faiss.write_index(self.index, str(self.index_file))
        with self.meta_file.open("w", encoding="utf-8") as fh:
            json.dump(self.chunk_ids, fh)

    def load_from_disk(self) -> None:
        if self.index_file.exists():
            self.index = faiss.read_index(str(self.index_file))

        if self.meta_file.exists():
            with self.meta_file.open("r", encoding="utf-8") as fh:
                self.chunk_ids = json.load(fh)
            # Keep chunk_ids list aligned with index size if new vectors were added elsewhere
            self.chunk_ids = self.chunk_ids[: self.index.ntotal]
