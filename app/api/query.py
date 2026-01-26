from fastapi import APIRouter
from app.models.schemas import QueryRequest, QueryResponse

router = APIRouter()

@router.post("/query", response_model = QueryResponse)
async def query_document(request: QueryRequest):
    return QueryResponse(
        answer = "Query pipeline not implemented yet",
        retrieved_chunks=[]
    )