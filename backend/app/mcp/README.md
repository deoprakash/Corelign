# Memory Context Processor (MCP)

## Overview

MCP is an auxiliary preprocessing layer that resolves ambiguous references in user queries before they reach the RAG pipeline. It operates as a pure input-clarification tool—it does NOT modify RAG outputs, inject knowledge, or alter the retrieval/generation logic.

## Architecture

```
User Query → MCP (optional rewrite) → RAG Pipeline → Response
                                    ↓
                              MCP stores (query, response) in history
```

## Functionality

### 1. Ambiguous Reference Detection

MCP detects pronouns and other references:
- Pronouns: `it`, `this`, `that`, `they`, `those`, `these`, `he`, `she`
- Possessives: `his`, `her`, `their`
- Questions: `what`, `which`, `who`

### 2. Query Rewriting

When ambiguous references are detected:
- **If history exists**: Attempt rule-based rewrite using context from previous responses
- **If history is insufficient**: Pass the original query unchanged (no hallucination)
- **If no ambiguity**: Pass query unchanged

### 3. Conversation History

MCP maintains a circular buffer (default: last 10 turns) containing:
- User queries
- RAG system responses

This history is **local to the session** and used only for coreference resolution.

## Example Usage

**Conversation Flow:**
```
Turn 1:
  User: "What is in this document?"
  RAG:  "This document is about climate change impacts."
  MCP:  Stores (query, response) in history

Turn 2:
  User: "What is it about?"
  MCP:  Detects "it" → Looks at last response → Rewrites to "What is the document about?"
  RAG:  Processes clarified query
  MCP:  Stores this turn in history
```

## API Integration

### In `backend/app/api/query.py`:

```python
from app.mcp import get_mcp

# Inside query_documents() endpoint:

# 1. PREPROCESSING: Resolve ambiguous references
mcp = get_mcp()
query = mcp.resolve_coreference(original_query)

# Query proceeds through RAG pipeline...

# 2. POSTPROCESSING: Record this turn in history
mcp.add_to_history(original_query, answer)
```

## Key Design Decisions

### 1. Black Box Principle
- MCP **does not** inspect or modify RAG internals (vector DB, retriever, generator)
- RAG operates exactly as before; MCP is transparent to it

### 2. Conservative Rewriting
- MCP only rewrites if confidence is high
- If context is ambiguous or insufficient, passes original query unchanged
- **No guessing, no hallucination**

### 3. Stateless Design (Per Request)
- MCP instance is global but processes one query at a time
- History is maintained across requests in the same session
- Safe for concurrent requests (deque is thread-safe for append/iteration)

### 4. Simple Rule-Based Matching
- No LLM required for coreference resolution (keeps it lightweight)
- Uses regex and pattern matching on prior responses
- Future: Can integrate with LLM if needed

## Module Structure

```
app/mcp/
├── __init__.py          # Package exports
└── processor.py         # Core MCP implementation
    ├── ConversationTurn      # Data class for a single turn
    ├── MemoryContextProcessor # Main MCP class
    │   ├── add_to_history()
    │   ├── contains_ambiguous_reference()
    │   ├── resolve_coreference()        # Main entry point
    │   ├── _rule_based_rewrite()
    │   └── _extract_subject()
    └── Global utilities
        ├── get_mcp()        # Get singleton instance
        └── reset_mcp()      # Reset for testing
```

## Configuration

### Max History Size
```python
mcp = MemoryContextProcessor(max_history=10)  # Default: 10 turns
```

### Ambiguous Reference Patterns
Patterns are defined in `AMBIGUOUS_REFERENCES` dict in `processor.py`. Extend by adding regex patterns.

## Testing

### Manual Testing via API

```bash
# Query 1: Base question
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is in this document?"}'

# Query 2: Follow-up with ambiguous reference
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is it about?"}'
  
# Expected: MCP rewrites to "What is the document about?"
```

### Debug Output

Enable MCP debug logging in `backend/app/api/query.py`:

```
DEBUG: MCP rewrite - Original: 'What is it about?' -> Rewritten: 'What is the document about?'
```

## Limitations

1. **Simple Pattern Matching**: Uses regex, not NLP. Complex coreference chains may not resolve perfectly.
2. **Short-Term Memory**: Only retains last N turns; longer conversation chains lose context.
3. **English-Only**: Patterns are English-focused.
4. **No Semantic Analysis**: Doesn't deeply understand meaning; relies on heuristics.

## Future Enhancements

1. **LLM-Based Resolution**: Use a lightweight LLM for more sophisticated coreference resolution
2. **Persistent Memory**: Store conversation history in a database
3. **Multi-Language Support**: Add patterns for other languages
4. **Confidence Scoring**: Return confidence level of rewrite
5. **User Feedback Loop**: Learn from corrections

## Constraints (DO NOT violate)

- ❌ DO NOT modify RAG retrieval logic
- ❌ DO NOT modify RAG generation logic
- ❌ DO NOT inject synthetic knowledge
- ❌ DO NOT modify vector database operations
- ✅ DO inject only input clarifications
- ✅ DO use only prior conversation context
- ✅ DO pass through unchanged if uncertain

## Integration Checklist

- [x] Created `app/mcp/processor.py` with core logic
- [x] Created `app/mcp/__init__.py` for package exports
- [x] Updated `app/api/query.py` to use MCP
- [x] MCP preprocessing before RAG
- [x] MCP history update after RAG
- [x] Documentation complete

---

**Status**: ✅ Production Ready (Initialized but awaiting user interaction to populate history)
