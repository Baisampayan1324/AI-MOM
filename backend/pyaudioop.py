"""
Compatibility shim for environments where the C `audioop` module
is not available. This module exposes a `pyaudioop` top-level module
so third-party packages (like `pydub`) that attempt `import pyaudioop`
will succeed by falling back to either the stdlib `audioop` or the
`pydub.pyaudioop` pure-Python implementation.

The shim first tries to import the built-in `audioop` and re-exports
its names. If that fails, it attempts to import `pydub.pyaudioop` and
re-export its symbols.
"""
try:
    # Prefer the stdlib C extension if available
    import audioop as _impl
except Exception:
    try:
        # Fall back to pydub's pure-Python implementation if present
        from pydub import pyaudioop as _impl
    except Exception:
        raise

# Re-export everything from the chosen implementation
globals().update({k: v for k, v in _impl.__dict__.items() if not k.startswith("__")})
