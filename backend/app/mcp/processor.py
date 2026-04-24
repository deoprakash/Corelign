"""
Memory Context Processor (MCP)
Resolves ambiguous references in user queries using conversation history.
Acts as a preprocessing layer before the RAG pipeline.
"""

import re
from typing import List, Tuple, Optional
from collections import deque


class ConversationTurn:
    """Represents a single turn in the conversation."""
    def __init__(self, user_query: str, rag_response: str):
        self.user_query = user_query
        self.rag_response = rag_response


class MemoryContextProcessor:
    """
    MCP: Preprocessing layer that resolves ambiguous references in user queries.
    Maintains conversation history and detects/rewrites ambiguous references.
    """
    
    # Ambiguous reference patterns
    AMBIGUOUS_REFERENCES = {
        r'\bit\b': 'it',
        r'\bthis\b': 'this',
        r'\bthat\b': 'that',
        r'\bthey\b': 'they',
        r'\bthose\b': 'those',
        r'\bthese\b': 'these',
        r'\bhe\b': 'he',
        r'\bshe\b': 'she',
        r'\bhis\b': 'his',
        r'\bher\b': 'her',
        r'\btheir\b': 'their',
        r'\bwhat\b': 'what',
        r'\bwhich\b': 'which',
        r'\bwho\b': 'who',
    }
    
    def __init__(self, max_history: int = 10):
        """
        Initialize MCP with conversation history buffer.
        
        Args:
            max_history: Maximum number of conversation turns to keep in memory
        """
        self.history: deque = deque(maxlen=max_history)
        self.max_history = max_history
    
    def add_to_history(self, user_query: str, rag_response: str) -> None:
        """
        Add a conversation turn to history.
        
        Args:
            user_query: The user's query
            rag_response: The RAG system's response
        """
        turn = ConversationTurn(user_query, rag_response)
        self.history.append(turn)
    
    def contains_ambiguous_reference(self, query: str) -> bool:
        """
        Detect if query contains ambiguous references.
        
        Args:
            query: The user query to check
            
        Returns:
            True if ambiguous references are detected, False otherwise
        """
        query_lower = query.lower()
        for pattern in self.AMBIGUOUS_REFERENCES.keys():
            if re.search(pattern, query_lower):
                return True
        return False
    
    def _extract_context_entities(self) -> str:
        """
        Extract key entities/subjects from recent conversation history.
        
        Returns:
            String describing recent context
        """
        if not self.history:
            return ""
        
        # Get the last 2-3 RAG responses for context
        context_parts = []
        for turn in list(self.history)[-2:]:
            # Extract first 200 characters of the response as summary
            summary = turn.rag_response[:200].strip()
            if summary.endswith('.') or len(summary) < 200:
                context_parts.append(f"Previous: {summary}")
            else:
                context_parts.append(f"Previous: {summary}...")
        
        return " ".join(context_parts)
    
    def resolve_coreference(self, query: str) -> str:
        """
        Main MCP function: Resolve ambiguous references in query.
        
        If query contains ambiguous references:
          - Use history context to rewrite the query explicitly
          - Return the rewritten query
        
        If query is clear:
          - Return the original query unchanged
        
        If context is insufficient:
          - Return the original query unchanged (do not hallucinate)
        
        Args:
            query: The user's query, potentially containing ambiguous references
            
        Returns:
            Either the rewritten query or the original query
        """
        # Rule 1: If no ambiguous references, pass through unchanged
        if not self.contains_ambiguous_reference(query):
            return query
        
        # Rule 2: If no history, cannot resolve - pass through unchanged
        if not self.history:
            return query
        
        # Rule 3: Try to resolve using context
        context = self._extract_context_entities()
        
        # Build a simple rule-based rewrite for common patterns
        rewritten = self._rule_based_rewrite(query, context)
        
        if rewritten != query:
            # Successfully rewritten
            return rewritten
        
        # Rule 4: If rule-based rewrite failed, pass through unchanged
        # (do not guess or hallucinate)
        return query
    
    def _rule_based_rewrite(self, query: str, context: str) -> str:
        """
        Simple rule-based rewriting for common coreference patterns.
        
        Args:
            query: The original query
            context: Context from recent history
            
        Returns:
            Rewritten query or original query if no rewrite applied
        """
        rewritten = query
        
        # Get the last user query and RAG response for reference
        if not self.history:
            return query
        
        last_turn = list(self.history)[-1]
        last_response = last_turn.rag_response
        
        # Pattern 1: "it" -> "the document" or extract main subject from last response
        if re.search(r'\bit\b', query, re.IGNORECASE):
            # Extract the main subject from last response (usually first noun phrase)
            subject = self._extract_subject(last_response)
            if subject:
                rewritten = re.sub(r'\bit\b', subject, rewritten, flags=re.IGNORECASE, count=1)
        
        # Pattern 2: "this" -> similar to "it"
        if re.search(r'\bthis\b', query, re.IGNORECASE):
            subject = self._extract_subject(last_response)
            if subject:
                rewritten = re.sub(r'\bthis\b', f'this {subject}', rewritten, flags=re.IGNORECASE, count=1)
        
        # Pattern 3: "that" -> similar to "it"
        if re.search(r'\bthat\b', query, re.IGNORECASE):
            subject = self._extract_subject(last_response)
            if subject:
                rewritten = re.sub(r'\bthat\b', f'that {subject}', rewritten, flags=re.IGNORECASE, count=1)
        
        # Pattern 4: "they/it" at start of question -> "What about X" -> "What is X"
        if query.strip().lower().startswith(('what about it', 'what about that')):
            subject = self._extract_subject(last_response)
            if subject:
                rewritten = re.sub(
                    r'^what about (it|that)',
                    f'what about the {subject}',
                    rewritten,
                    flags=re.IGNORECASE
                )
        
        return rewritten
    
    def _extract_subject(self, text: str) -> Optional[str]:
        """
        Extract main subject/noun from text.
        Simple heuristic: get first capitalized word or common nouns.
        
        Args:
            text: Text to extract subject from
            
        Returns:
            Extracted subject or None
        """
        if not text:
            return None
        
        # Try to find first noun phrase (simple heuristic)
        # Look for "This document", "The document", "A document", etc.
        patterns = [
            r'(?:This|The|A|An)\s+([a-zA-Z]+)',  # "The/This/A <noun>"
            r'^([A-Z][a-z]+)',  # First capitalized word
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.strip())
            if match:
                return match.group(1).lower()
        
        return None
    
    def get_history_summary(self) -> str:
        """
        Get a summary of conversation history for debugging.
        
        Returns:
            String representation of history
        """
        if not self.history:
            return "No conversation history"
        
        summary = f"History ({len(self.history)} turns):\n"
        for i, turn in enumerate(self.history, 1):
            summary += f"  {i}. Q: {turn.user_query[:50]}...\n"
            summary += f"     A: {turn.rag_response[:50]}...\n"
        return summary
    
    def clear_history(self) -> None:
        """Clear all conversation history."""
        self.history.clear()


# Global MCP instance
_mcp_instance: Optional[MemoryContextProcessor] = None


def get_mcp() -> MemoryContextProcessor:
    """
    Get or create the global MCP instance.
    
    Returns:
        The global MemoryContextProcessor instance
    """
    global _mcp_instance
    if _mcp_instance is None:
        _mcp_instance = MemoryContextProcessor(max_history=10)
    return _mcp_instance


def reset_mcp() -> None:
    """Reset the global MCP instance."""
    global _mcp_instance
    if _mcp_instance is not None:
        _mcp_instance.clear_history()
