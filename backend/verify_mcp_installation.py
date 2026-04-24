#!/usr/bin/env python
"""
MCP Verification Script
Verifies that the MCP implementation is correctly integrated.
Run this to check if everything is set up properly.
"""

import sys
import os

def check_file_exists(path, description):
    """Check if a file exists."""
    if os.path.exists(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description}: {path} NOT FOUND")
        return False


def check_import(module_name, description):
    """Check if a module can be imported."""
    try:
        __import__(module_name)
        print(f"✅ {description}: {module_name}")
        return True
    except ImportError as e:
        print(f"❌ {description}: Failed - {e}")
        return False


def check_class_exists(module_name, class_name, description):
    """Check if a class exists in a module."""
    try:
        module = __import__(module_name, fromlist=[class_name])
        getattr(module, class_name)
        print(f"✅ {description}: {class_name}")
        return True
    except (ImportError, AttributeError) as e:
        print(f"❌ {description}: Failed - {e}")
        return False


def main():
    print("=" * 60)
    print("MCP Implementation Verification")
    print("=" * 60)
    print()
    
    checks = []
    
    # 1. File Existence Checks
    print("1. Checking File Structure...")
    print("-" * 60)
    checks.append(check_file_exists(
        "app/mcp/__init__.py",
        "MCP Package __init__"
    ))
    checks.append(check_file_exists(
        "app/mcp/processor.py",
        "MCP Processor Module"
    ))
    checks.append(check_file_exists(
        "app/mcp/test_mcp.py",
        "MCP Unit Tests"
    ))
    checks.append(check_file_exists(
        "app/mcp/README.md",
        "MCP Documentation"
    ))
    checks.append(check_file_exists(
        "INTEGRATION_GUIDE_MCP.md",
        "Integration Guide"
    ))
    checks.append(check_file_exists(
        "MCP_IMPLEMENTATION_SUMMARY.md",
        "Implementation Summary"
    ))
    print()
    
    # 2. Import Checks
    print("2. Checking Imports...")
    print("-" * 60)
    checks.append(check_import(
        "app.mcp",
        "MCP Package Import"
    ))
    checks.append(check_import(
        "app.mcp.processor",
        "MCP Processor Import"
    ))
    print()
    
    # 3. Class Checks
    print("3. Checking Classes...")
    print("-" * 60)
    checks.append(check_class_exists(
        "app.mcp.processor",
        "MemoryContextProcessor",
        "MemoryContextProcessor Class"
    ))
    checks.append(check_class_exists(
        "app.mcp.processor",
        "ConversationTurn",
        "ConversationTurn Class"
    ))
    print()
    
    # 4. Function Checks
    print("4. Checking Functions...")
    print("-" * 60)
    try:
        from app.mcp import get_mcp, reset_mcp
        print(f"✅ get_mcp() function: imported")
        checks.append(True)
        print(f"✅ reset_mcp() function: imported")
        checks.append(True)
    except ImportError as e:
        print(f"❌ Function imports failed: {e}")
        checks.append(False)
        checks.append(False)
    print()
    
    # 5. Integration Check
    print("5. Checking Integration...")
    print("-" * 60)
    try:
        from app.api import query
        if hasattr(query, 'router'):
            print(f"✅ Query router imported successfully")
            checks.append(True)
        else:
            print(f"❌ Query router not found")
            checks.append(False)
    except ImportError as e:
        print(f"❌ Query router import failed: {e}")
        checks.append(False)
    print()
    
    # 6. Functional Test
    print("6. Running Functional Tests...")
    print("-" * 60)
    try:
        from app.mcp import get_mcp
        mcp = get_mcp()
        
        # Test 1: Ambiguous reference detection
        has_ref = mcp.contains_ambiguous_reference("What is it about?")
        if has_ref:
            print(f"✅ Ambiguous reference detection works")
            checks.append(True)
        else:
            print(f"❌ Ambiguous reference detection failed")
            checks.append(False)
        
        # Test 2: Query passthrough
        query_pass = mcp.resolve_coreference("What is quantum physics?")
        if query_pass == "What is quantum physics?":
            print(f"✅ Query passthrough works")
            checks.append(True)
        else:
            print(f"❌ Query passthrough failed")
            checks.append(False)
        
        # Test 3: History management
        mcp.clear_history()
        mcp.add_to_history("Test", "Response")
        if len(mcp.history) == 1:
            print(f"✅ History management works")
            checks.append(True)
        else:
            print(f"❌ History management failed")
            checks.append(False)
        
    except Exception as e:
        print(f"❌ Functional tests failed: {e}")
        checks.append(False)
        checks.append(False)
        checks.append(False)
    print()
    
    # Summary
    print("=" * 60)
    passed = sum(checks)
    total = len(checks)
    
    if passed == total:
        print(f"✅ ALL CHECKS PASSED ({passed}/{total})")
        print()
        print("MCP Implementation Status: READY FOR DEPLOYMENT")
        print("=" * 60)
        return 0
    else:
        print(f"⚠️  SOME CHECKS FAILED ({passed}/{total})")
        print()
        print("Please review the failures above and ensure:")
        print("1. All MCP files are in app/mcp/")
        print("2. query.py is updated with MCP integration")
        print("3. Python environment has required dependencies")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
