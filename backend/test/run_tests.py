#!/usr/bin/env python3
"""
Test runner script for AI MOM backend.
Run all tests with coverage reporting.
"""

import subprocess
import sys
import os

def run_tests():
    """Run the test suite with coverage."""
    print("🧪 Running AI MOM Backend Tests")
    print("=" * 40)

    # Change to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Run pytest with coverage
    cmd = [
        "pytest",
        "--verbose",
        "--tb=short",
        "--cov=app",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "test/"
    ]

    try:
        result = subprocess.run(cmd, check=True)
        print("\n✅ All tests passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print("\n❌ pytest not found. Please install pytest: pip install pytest pytest-cov")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)