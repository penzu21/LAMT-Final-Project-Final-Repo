from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import numpy as np
from typing import List, Optional
import os

# Create FastAPI app
app = FastAPI(
    title="Orthonormal Basis Finder API",
    description="Transform vectors into orthonormal basis using Gram-Schmidt process",
    version="1.0.0"
)

# CORS Configuration - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class VectorInput(BaseModel):
    vectors: List[List[float]]
    
    @validator('vectors')
    def validate_vectors(cls, v):
        if not v:
            raise ValueError("At least one vector is required")
        if len(v) == 0:
            raise ValueError("Vectors list cannot be empty")
        
        # Check all vectors have same dimension
        vec_lengths = [len(vec) for vec in v]
        if len(set(vec_lengths)) > 1:
            raise ValueError(f"All vectors must have same dimension. Found: {vec_lengths}")
        
        # Check for zero vectors
        for i, vec in enumerate(v):
            if all(x == 0 for x in vec):
                raise ValueError(f"Vector at index {i} is a zero vector")
        
        return v

class OrthonormalResponse(BaseModel):
    orthonormal_basis: List[List[float]]
    original_vectors: List[List[float]]
    is_linearly_independent: bool
    dimension: int
    number_of_vectors: int
    vector_size: int
    number_of_output_vectors: int

class CheckOrthonormalResponse(BaseModel):
    is_orthonormal: bool
    details: List[str]
    number_of_vectors: int
    vector_size: int

# Helper Functions
def gram_schmidt(vectors: List[List[float]]) -> np.ndarray:
    """
    Apply Gram-Schmidt orthonormalization process
    
    Args:
        vectors: List of vectors to orthonormalize
        
    Returns:
        NumPy array of orthonormal vectors
    """
    vectors_array = np.array(vectors, dtype=float)
    orthonormal = []
    
    for i in range(len(vectors_array)):
        v = vectors_array[i].copy()
        
        # Subtract projections onto previous orthonormal vectors
        for j in range(len(orthonormal)):
            projection = np.dot(v, orthonormal[j])
            v = v - projection * orthonormal[j]
        
        # Calculate norm
        norm = np.linalg.norm(v)
        
        # Skip linearly dependent vectors
        if norm < 1e-10:
            continue
        
        # Normalize the vector
        v = v / norm
        orthonormal.append(v)
    
    return np.array(orthonormal) if orthonormal else np.array([])

# API Endpoints
@app.get("/")
async def root():
    """
    Root endpoint - API information and health check
    """
    return {
        "message": "Orthonormal Basis Finder API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "POST /orthonormal": "Find orthonormal basis from vectors",
            "POST /check-orthonormal": "Check if vectors are orthonormal",
            "GET /health": "Health check endpoint",
            "GET /docs": "Interactive API documentation"
        },
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "service": "orthonormal-basis-api",
        "numpy_version": np.__version__
    }

@app.post("/orthonormal", response_model=OrthonormalResponse)
async def find_orthonormal_basis(data: VectorInput):
    """
    Find orthonormal basis using Gram-Schmidt process
    
    Example request body:
    ```json
    {
        "vectors": [[1, 1, 0], [1, 0, 1], [0, 1, 1]]
    }
    ```
    
    Returns:
        OrthonormalResponse containing the orthonormal basis and metadata
    """
    try:
        vectors = data.vectors
        
        # Apply Gram-Schmidt process
        orthonormal = gram_schmidt(vectors)
        
        # Check if vectors are linearly independent
        is_independent = len(orthonormal) == len(vectors)
        
        # Handle case where no orthonormal vectors were found
        if len(orthonormal) == 0:
            raise HTTPException(
                status_code=400,
                detail="All vectors are linearly dependent or zero vectors"
            )
        
        return OrthonormalResponse(
            orthonormal_basis=orthonormal.tolist(),
            original_vectors=vectors,
            is_linearly_independent=is_independent,
            dimension=len(orthonormal),
            number_of_vectors=len(vectors),
            vector_size=len(vectors[0]),
            number_of_output_vectors=len(orthonormal)
        )
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/check-orthonormal", response_model=CheckOrthonormalResponse)
async def check_orthonormal(data: VectorInput):
    """
    Check if given vectors form an orthonormal set
    
    Example request body:
    ```json
    {
        "vectors": [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    }
    ```
    
    Returns:
        CheckOrthonormalResponse with verification results
    """
    try:
        vectors = np.array(data.vectors, dtype=float)
        n = len(vectors)
        
        is_orthonormal = True
        details = []
        
        # Check if each vector is unit length
        for i in range(n):
            norm = np.linalg.norm(vectors[i])
            if abs(norm - 1.0) > 1e-6:
                is_orthonormal = False
                details.append(
                    f"Vector {i} is not unit length (norm = {norm:.6f})"
                )
        
        # Check if vectors are orthogonal to each other
        for i in range(n):
            for j in range(i + 1, n):
                dot = np.dot(vectors[i], vectors[j])
                if abs(dot) > 1e-6:
                    is_orthonormal = False
                    details.append(
                        f"Vectors {i} and {j} are not orthogonal "
                        f"(dot product = {dot:.6f})"
                    )
        
        if is_orthonormal:
            details = ["All vectors form an orthonormal set!"]
        
        return CheckOrthonormalResponse(
            is_orthonormal=is_orthonormal,
            details=details,
            number_of_vectors=len(data.vectors),
            vector_size=len(data.vectors[0]) if len(data.vectors) > 0 else 0
        )
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# For local development
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Orthonormal Basis Finder API on port {port}...")
    print(f"API will be available at: http://127.0.0.1:{port}")
    print(f"Interactive docs at: http://127.0.0.1:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)
