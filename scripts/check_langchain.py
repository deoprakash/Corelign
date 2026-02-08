import importlib, pkgutil, sys

try:
    mod = importlib.import_module("langchain")
    print("version:", getattr(mod, "__version__", "no version"))
    print("path:", getattr(mod, "__path__", None))
    path = getattr(mod, "__path__", None)
    if path:
        print("submodules:", [m.name for m in pkgutil.iter_modules(path)])
    else:
        print("no __path__")
    try:
        importlib.import_module("langchain.schema")
        print("import langchain.schema OK")
    except Exception as e:
        print("langchain.schema import error:", type(e).__name__, e)
except Exception as e:
    print("error importing langchain:", type(e).__name__, e)
    sys.exit(1)
