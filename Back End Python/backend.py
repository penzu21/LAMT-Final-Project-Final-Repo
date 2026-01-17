from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import List

app= FastAPI(title="Orthonormal Basis Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VectorInput(BaseModel):
    vectors: List[List[float]]

class OrthonormalResponse(BaseModel):
    orthonormal_basis: List[List[float]]
    original_vectors: List[List[float]]
    is_linearly_independent: bool
    dimension: int
    number_of_vectors: int
    vector_size: int
    number_of_output_vectors: int

def gram_schmidt(vectors):
    """Apply Gram-Schmidt orthonormalization process"""
    vectors = np.array(vectors, dtype=float)
    n = len(vectors)
    orthonormal = []
    
    for i in range(n):
        v = vectors[i].copy()
        
        for j in range(len(orthonormal)):
            projection = np.dot(v, orthonormal[j])
            v = v - projection * orthonormal[j]
        
        norm = np.linalg.norm(v)
        
        if norm < 1e-10:
            continue
            
        v = v / norm
        orthonormal.append(v)
    
    return np.array(orthonormal)

@app.get("/")
def root():
    """Root endpoint to check if API is running"""
    return {
        "message": "Orthonormal Basis Finder API", 
        "status": "running",
        "endpoints": {
            "POST /orthonormal": "Find orthonormal basis from vectors",
            "POST /check-orthonormal": "Check if vectors are orthonormal",
            "GET /docs": "Interactive API documentation"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/orthonormal", response_model=OrthonormalResponse)
def find_orthonormal_basis(data: VectorInput):
    """
    Find orthonormal basis using Gram-Schmidt process
    
    Example input:
    {
        "vectors": [[1, 1, 0], [1, 0, 1], [0, 1, 1]]
    }
    """
    try:
        vectors = data.vectors
        
        if not vectors:
            raise HTTPException(status_code=400, detail="No vectors provided")
        
        if len(vectors) == 0:
            raise HTTPException(status_code=400, detail="At least one vector is required")
        
        vec_lengths = [len(v) for v in vectors]
        if len(set(vec_lengths)) > 1:
            raise HTTPException(
                status_code=400, 
                detail=f"All vectors must have the same dimension. Found dimensions: {vec_lengths}"
            )
        
        for i, v in enumerate(vectors):
            if all(x == 0 for x in v):
                raise HTTPException(
                    status_code=400,
                    detail=f"Vector at index {i} is a zero vector"
                )
        
        orthonormal = gram_schmidt(vectors)
        
        is_independent = len(orthonormal) == len(vectors)
        
        return {
            "orthonormal_basis": orthonormal.tolist(),
            "original_vectors": vectors,
            "is_linearly_independent": is_independent,
            "dimension": len(orthonormal),
            "number_of_vectors": len(vectors),
            "vector_size": len(vectors[0]),
            "number_of_output_vectors": len(orthonormal)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.post("/check-orthonormal")
def check_orthonormal(data: VectorInput):
    """
    Check if given vectors form an orthonormal set
    
    Example input:
    {
        "vectors": [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    }
    """
    try:
        vectors = np.array(data.vectors, dtype=float)
        n = len(vectors)
        
        if n == 0:
            raise HTTPException(status_code=400, detail="No vectors provided")
        
        is_orthonormal = True
        details = []
        
        for i in range(n):
            norm = np.linalg.norm(vectors[i])
            if abs(norm - 1.0) > 1e-6:
                is_orthonormal = False
                details.append(f"Vector {i} is not unit length (norm = {norm:.6f})")
        
        for i in range(n):
            for j in range(i+1, n):
                dot = np.dot(vectors[i], vectors[j])
                if abs(dot) > 1e-6:
                    is_orthonormal = False
                    details.append(f"Vectors {i} and {j} are not orthogonal (dot product = {dot:.6f})")
        
        if is_orthonormal:
            details = ["All vectors are orthonormal!"]
        
        return {
            "is_orthonormal": is_orthonormal,
            "details": details,
            "number_of_vectors": len(data.vectors),
            "vector_size": len(data.vectors[0]) if len(data.vectors) > 0 else 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting Orthonormal Basis Finder API...")
    print("API will be available at: http://127.0.0.1:8000")
    print("Interactive docs at: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)