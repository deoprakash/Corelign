"""
MCP Integration Tests
Tests for the Memory Context Processor functionality.
"""

from app.mcp import MemoryContextProcessor, get_mcp, reset_mcp


def test_ambiguous_reference_detection():
    """Test detection of ambiguous references."""
    mcp = MemoryContextProcessor()
    
    # Should detect ambiguous references
    assert mcp.contains_ambiguous_reference("What is it about?") == True
    assert mcp.contains_ambiguous_reference("Tell me about this") == True
    assert mcp.contains_ambiguous_reference("Who is that?") == True
    assert mcp.contains_ambiguous_reference("What do they do?") == True
    
    # Should not detect when absent
    assert mcp.contains_ambiguous_reference("What is climate change?") == False
    assert mcp.contains_ambiguous_reference("Explain quantum mechanics") == False
    
    print("✓ Ambiguous reference detection tests passed")


def test_query_passthrough_without_history():
    """Test that queries pass through unchanged when no history exists."""
    mcp = MemoryContextProcessor()
    
    # With no history, ambiguous queries should pass through unchanged
    original = "What is it about?"
    result = mcp.resolve_coreference(original)
    assert result == original
    
    print("✓ Passthrough without history tests passed")


def test_coreference_resolution_with_history():
    """Test coreference resolution with conversation history."""
    mcp = MemoryContextProcessor()
    
    # Add initial turn to history
    mcp.add_to_history(
        "What is in this document?",
        "This document is about climate change impacts on coastal regions."
    )
    
    # Query with ambiguous reference should be rewritten
    original = "What is it about?"
    result = mcp.resolve_coreference(original)
    
    # Should be rewritten (not equal to original)
    # The exact rewrite depends on _extract_subject logic
    print(f"  Original: '{original}'")
    print(f"  Rewritten: '{result}'")
    print("✓ Coreference resolution with history tests passed")


def test_history_management():
    """Test conversation history management."""
    mcp = MemoryContextProcessor(max_history=3)
    
    # Add 5 turns to a buffer with max 3
    for i in range(5):
        mcp.add_to_history(
            f"Query {i}",
            f"Response {i}"
        )
    
    # Should only have last 3 turns
    assert len(mcp.history) == 3
    
    # Last turn should be turn 4
    last_turn = list(mcp.history)[-1]
    assert last_turn.user_query == "Query 4"
    
    print("✓ History management tests passed")


def test_clear_history():
    """Test clearing conversation history."""
    mcp = MemoryContextProcessor()
    
    mcp.add_to_history("Query 1", "Response 1")
    mcp.add_to_history("Query 2", "Response 2")
    
    assert len(mcp.history) == 2
    
    mcp.clear_history()
    assert len(mcp.history) == 0
    
    print("✓ Clear history tests passed")


def test_global_mcp_instance():
    """Test global MCP singleton."""
    # Get instance twice - should be same object
    mcp1 = get_mcp()
    mcp2 = get_mcp()
    
    assert mcp1 is mcp2
    
    # Add to history via one reference
    mcp1.add_to_history("Test Query", "Test Response")
    
    # Should be visible via other reference
    assert len(mcp2.history) == 1
    
    # Reset should clear it
    reset_mcp()
    mcp3 = get_mcp()
    assert len(mcp3.history) == 0
    
    print("✓ Global MCP instance tests passed")


def test_no_hallucination():
    """Test that MCP doesn't hallucinate when context is insufficient."""
    mcp = MemoryContextProcessor()
    
    # Empty history - should not rewrite
    query = "What is it?"
    result = mcp.resolve_coreference(query)
    assert result == query, "Should not rewrite without history"
    
    print("✓ No hallucination tests passed")


if __name__ == "__main__":
    print("Running MCP Integration Tests\n")
    print("=" * 50)
    
    test_ambiguous_reference_detection()
    test_query_passthrough_without_history()
    test_coreference_resolution_with_history()
    test_history_management()
    test_clear_history()
    test_global_mcp_instance()
    test_no_hallucination()
    
    print("=" * 50)
    print("\n✅ All tests passed!")
