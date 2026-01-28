import faiss 
import numpy as np

class FaissIndex:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
    
    def add_vectors(self, vectors: np.ndarray):
        self.index.add(vectors)
    
    def search(self, query_vector, top_k=5):
        distances, indices = self.index.search(query_vector, top_k)
        return indices[0]
        