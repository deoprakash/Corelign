"""
MCP Usage Examples
Demonstrates how to use the Memory Context Processor directly.
"""

from app.mcp import MemoryContextProcessor, get_mcp, reset_mcp


def example_1_basic_usage():
    """Example 1: Basic MCP Usage"""
    print("\n" + "="*60)
    print("Example 1: Basic MCP Usage")
    print("="*60)
    
    mcp = MemoryContextProcessor()
    
    # Add a conversation turn
    mcp.add_to_history(
        user_query="What is in this document?",
        rag_response="This document discusses climate change impacts."
    )
    
    # Query with ambiguous reference
    query = "What is it about?"
    rewritten = mcp.resolve_coreference(query)
    
    print(f"\nOriginal query: '{query}'")
    print(f"Rewritten query: '{rewritten}'")
    print(f"Query was rewritten: {query != rewritten}")


def example_2_without_history():
    """Example 2: No Rewrite Without History"""
    print("\n" + "="*60)
    print("Example 2: No Rewrite Without History")
    print("="*60)
    
    mcp = MemoryContextProcessor()
    
    # Query with ambiguous reference but no history
    query = "What is it about?"
    rewritten = mcp.resolve_coreference(query)
    
    print(f"\nHistory size: {len(mcp.history)}")
    print(f"Original query: '{query}'")
    print(f"Rewritten query: '{rewritten}'")
    print(f"Query passed through unchanged: {query == rewritten}")
    print("(No history, so MCP couldn't resolve the reference)")


def example_3_multi_turn_conversation():
    """Example 3: Multi-Turn Conversation"""
    print("\n" + "="*60)
    print("Example 3: Multi-Turn Conversation")
    print("="*60)
    
    mcp = MemoryContextProcessor(max_history=5)
    
    conversation = [
        {
            "user": "What is in this document?",
            "response": "This document contains analysis of renewable energy trends in 2025."
        },
        {
            "user": "What is it about?",
            "response": "It provides detailed insights into solar and wind energy adoption rates."
        },
        {
            "user": "Tell me more about that",
            "response": "The report includes projections for the next 5 years with specific metrics."
        },
    ]
    
    for i, turn in enumerate(conversation, 1):
        user_query = turn["user"]
        response = turn["response"]
        
        # Process with MCP
        rewritten = mcp.resolve_coreference(user_query)
        
        print(f"\nTurn {i}:")
        print(f"  User: {user_query}")
        if user_query != rewritten:
            print(f"  MCP Rewrite: {rewritten}")
        print(f"  Response: {response}")
        
        # Add to history
        mcp.add_to_history(user_query, response)


def example_4_detecting_ambiguous_references():
    """Example 4: Detecting Ambiguous References"""
    print("\n" + "="*60)
    print("Example 4: Detecting Ambiguous References")
    print("="*60)
    
    mcp = MemoryContextProcessor()
    
    queries = [
        "What is in this document?",
        "What is it about?",
        "Tell me more about that",
        "Who is he?",
        "What about her?",
        "Can you explain quantum mechanics?",
        "What are they doing?",
    ]
    
    print("\nAmbiguous Reference Detection:")
    for query in queries:
        has_ref = mcp.contains_ambiguous_reference(query)
        status = "✓ Ambiguous" if has_ref else "✗ Clear"
        print(f"  [{status}] {query}")


def example_5_history_management():
    """Example 5: History Management"""
    print("\n" + "="*60)
    print("Example 5: History Management")
    print("="*60)
    
    # Create MCP with small history buffer
    mcp = MemoryContextProcessor(max_history=3)
    
    print("\nAdding 5 turns to a buffer with max_history=3:")
    for i in range(1, 6):
        mcp.add_to_history(f"Query {i}", f"Response {i}")
        print(f"  Added turn {i} - Current buffer size: {len(mcp.history)}")
    
    print(f"\nFinal history (should only have last 3 turns):")
    for i, turn in enumerate(mcp.history, 1):
        print(f"  {i}. Q: {turn.user_query} → A: {turn.rag_response}")
    
    print(f"\nTotal turns: {len(mcp.history)}")


def example_6_global_singleton():
    """Example 6: Using Global Singleton"""
    print("\n" + "="*60)
    print("Example 6: Using Global Singleton")
    print("="*60)
    
    # Reset first
    reset_mcp()
    
    # Get singleton instance
    mcp1 = get_mcp()
    mcp1.add_to_history("Query 1", "Response 1")
    
    print(f"\nAfter adding to mcp1:")
    print(f"  mcp1 history size: {len(mcp1.history)}")
    
    # Get singleton again - should be same instance
    mcp2 = get_mcp()
    print(f"\nGetting mcp2 (another reference to singleton):")
    print(f"  mcp2 history size: {len(mcp2.history)}")
    print(f"  mcp1 is mcp2: {mcp1 is mcp2}")
    
    print(f"\nAdding to mcp2:")
    mcp2.add_to_history("Query 2", "Response 2")
    
    print(f"  mcp1 history size: {len(mcp1.history)}")
    print(f"  mcp2 history size: {len(mcp2.history)}")


def example_7_debug_output():
    """Example 7: Debug Output"""
    print("\n" + "="*60)
    print("Example 7: Debug Output")
    print("="*60)
    
    reset_mcp()
    mcp = get_mcp()
    
    # Add some history
    mcp.add_to_history("What is climate change?", "Climate change is the long-term shift in Earth's climate patterns.")
    mcp.add_to_history("What causes it?", "It is caused by greenhouse gas emissions from human activities.")
    
    # Get history summary
    print("\n" + mcp.get_history_summary())


def main():
    """Run all examples"""
    print("\n" + "="*60)
    print("MCP Usage Examples")
    print("="*60)
    
    example_1_basic_usage()
    example_2_without_history()
    example_3_multi_turn_conversation()
    example_4_detecting_ambiguous_references()
    example_5_history_management()
    example_6_global_singleton()
    example_7_debug_output()
    
    print("\n" + "="*60)
    print("All examples completed!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
