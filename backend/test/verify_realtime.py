"""
Quick verification script for realtime transcription setup.
Run this before your demo to confirm everything is working.
"""
import sys
import os

def check_imports():
    """Verify all required packages are installed."""
    print("🔍 Checking Python packages...")
    required = {
        'whisper': 'openai-whisper',
        'numpy': 'numpy',
        'torch': 'torch',
        'fastapi': 'fastapi',
        'groq': 'groq',
        'openai': 'openai'
    }
    
    missing = []
    for module, package in required.items():
        try:
            __import__(module)
            print(f"  ✅ {module}")
        except ImportError:
            print(f"  ❌ {module} (install: pip install {package})")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages. Install with:")
        print(f"  pip install {' '.join(missing)}")
        return False
    
    print("✅ All packages installed\n")
    return True

def check_gpu():
    """Check GPU availability for acceleration."""
    print("🔍 Checking GPU availability...")
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            memory = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"  ✅ GPU detected: {gpu_name}")
            print(f"  📊 GPU memory: {memory:.1f} GB")
            print(f"  💡 Recommendation: Set REALTIME_WHISPER_FP16=1 for 3-5x speedup")
            return True
        else:
            print(f"  ℹ️  No GPU detected (CPU mode)")
            print(f"  💡 Recommendation: Use base.en model for reasonable CPU speed")
            return False
    except Exception as e:
        print(f"  ❌ Error checking GPU: {e}")
        return False

def check_whisper_models():
    """Check which Whisper models are available."""
    print("\n🔍 Checking Whisper models...")
    import whisper
    
    models_to_check = ['tiny.en', 'base.en', 'small.en']
    available = []
    
    for model_name in models_to_check:
        try:
            print(f"  Testing {model_name}...", end=" ")
            model = whisper.load_model(model_name)
            print(f"✅ Available")
            available.append(model_name)
        except Exception as e:
            print(f"❌ Not downloaded")
    
    if 'base.en' in available:
        print(f"\n✅ Recommended model 'base.en' is ready")
    else:
        print(f"\n⚠️  Downloading base.en model (one-time, ~150 MB)...")
        try:
            whisper.load_model('base.en')
            print(f"✅ base.en downloaded successfully")
        except Exception as e:
            print(f"❌ Failed to download: {e}")
            return False
    
    return True

def check_env_vars():
    """Display current environment configuration."""
    print("\n🔍 Current environment configuration:")
    env_vars = {
        'REALTIME_WHISPER_MODEL': 'base.en (default)',
        'REALTIME_WHISPER_FP16': '0 (default, CPU)',
        'REALTIME_MIN_SECONDS': '1.2 (default)',
        'REALTIME_MAX_SECONDS': '4.0 (default)',
        'REALTIME_SILENCE_THRESHOLD': '0.0001 (default)',
        'REALTIME_SILENCE_TAIL': '0.35 (default)'
    }
    
    for var, default in env_vars.items():
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var} = {value}")
        else:
            print(f"  ℹ️  {var} = {default}")
    
    print()

def suggest_config():
    """Suggest optimal configuration based on system."""
    import torch
    print("💡 Recommended configuration for your system:")
    print("-" * 50)
    
    if torch.cuda.is_available():
        print("# GPU detected - use FP16 acceleration")
        print("$env:REALTIME_WHISPER_MODEL = 'base.en'")
        print("$env:REALTIME_WHISPER_FP16 = '1'")
    else:
        print("# CPU-only - balanced config")
        print("$env:REALTIME_WHISPER_MODEL = 'base.en'")
        print("$env:REALTIME_WHISPER_FP16 = '0'")
    
    print("$env:REALTIME_MIN_SECONDS = '1.2'")
    print("$env:REALTIME_MAX_SECONDS = '3.5'")
    print("-" * 50)
    print("\nCopy these to PowerShell before starting backend\n")

def quick_model_benchmark():
    """Quick benchmark of realtime model."""
    print("🔍 Running quick model benchmark...")
    try:
        import whisper
        import numpy as np
        import time
        
        # Load base.en model
        model_name = os.getenv('REALTIME_WHISPER_MODEL', 'base.en')
        use_fp16 = os.getenv('REALTIME_WHISPER_FP16', '0') == '1'
        
        print(f"  Loading {model_name} model...", end=" ")
        model = whisper.load_model(model_name)
        print("✅")
        
        # Generate 2 seconds of test audio (silence)
        test_audio = np.zeros(32000, dtype=np.float32)
        
        print(f"  Testing transcription speed (2s audio, fp16={use_fp16})...", end=" ")
        start = time.time()
        result = model.transcribe(test_audio, fp16=use_fp16, language='en', beam_size=1)
        elapsed = time.time() - start
        
        print(f"✅ {elapsed:.2f}s")
        
        # Assess performance
        if elapsed < 0.5:
            status = "🚀 Excellent - real-time capable"
        elif elapsed < 1.0:
            status = "✅ Good - suitable for demo"
        elif elapsed < 2.0:
            status = "⚠️  Acceptable - minor lag expected"
        else:
            status = "❌ Slow - consider GPU or smaller model"
        
        print(f"  Performance: {status}")
        print(f"  Expected realtime lag: ~{elapsed + 0.5:.1f}s after pause\n")
        
        return elapsed < 2.0
        
    except Exception as e:
        print(f"❌ Benchmark failed: {e}")
        return False

def main():
    """Run all verification checks."""
    print("=" * 60)
    print("  AI_MOM Real-Time Transcription Verification")
    print("=" * 60)
    print()
    
    all_ok = True
    
    # Run checks
    all_ok &= check_imports()
    check_gpu()
    all_ok &= check_whisper_models()
    check_env_vars()
    suggest_config()
    all_ok &= quick_model_benchmark()
    
    print("=" * 60)
    if all_ok:
        print("✅ All checks passed! System ready for real-time transcription")
        print("\nNext steps:")
        print("1. Apply recommended env config above in PowerShell")
        print("2. Run: .\\start_backend.bat")
        print("3. Open: frontend\\real.html in browser")
        print("4. Click Connect → Start Recording")
    else:
        print("⚠️  Some checks failed. Review errors above.")
        print("See REALTIME_SETUP.md for troubleshooting guide.")
    print("=" * 60)
    
    return 0 if all_ok else 1

if __name__ == '__main__':
    sys.exit(main())
