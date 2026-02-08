import importlib, inspect, sys

try:
    mod = importlib.import_module('langchain_groq')
    print('module file:', getattr(mod, '__file__', None))
    print('module dir:', dir(mod)[:200])
    ChatGroq = getattr(mod, 'ChatGroq', None)
    print('ChatGroq:', ChatGroq)
    if ChatGroq:
        try:
            print('\n--- Inspecting ChatGroq source ---\n')
            print(inspect.getsource(ChatGroq))
        except Exception as e:
            print('could not get source:', type(e).__name__, e)
        try:
            print('\n--- ChatGroq dir ---\n', dir(ChatGroq))
        except Exception as e:
            print('dir error:', e)
except Exception as e:
    print('error importing langchain_groq:', type(e).__name__, e)
    sys.exit(1)
