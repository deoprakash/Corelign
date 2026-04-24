"""
MCP (Memory Context Processor) package
Provides preprocessing layer for resolving ambiguous references in queries.
"""

from app.mcp.processor import (
    MemoryContextProcessor,
    get_mcp,
    reset_mcp,
)

__all__ = ["MemoryContextProcessor", "get_mcp", "reset_mcp"]
