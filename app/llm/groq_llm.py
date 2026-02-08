from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
import  os
from dotenv import load_dotenv

load_dotenv()

class GroqLLM:
    def __init__(self):
        self.llm = ChatGroq(
            api_key = os.getenv("GROQ_API_KEY"),
            model_name = "llama-3.1-8b-instant",
            temperature=0.2
        )
    
    def generate_answer(self, context: str, question: str) -> str:
        prompt = f"""
You are an intelligent document assistant.

Context: 
{context}

Question:
{question}

Answer concisely and factually based only on the context.
"""
        msg = HumanMessage(content=prompt)

        # langchain_groq ChatGroq is a LangChain Runnable; call via invoke()
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            print("DEBUG: GROQ_API_KEY is missing; skipping LLM call")
            return ""

        response = None
        last_error = None
        for call_style in ("invoke_messages", "invoke_text", "generate_messages"):
            try:
                if call_style == "invoke_messages" and hasattr(self.llm, "invoke"):
                    print("DEBUG: Calling Groq LLM via invoke([HumanMessage])")
                    response = self.llm.invoke([msg])
                    break

                if call_style == "invoke_text" and hasattr(self.llm, "invoke"):
                    print("DEBUG: Calling Groq LLM via invoke(prompt_str)")
                    response = self.llm.invoke(msg.content)
                    break

                if call_style == "generate_messages" and hasattr(self.llm, "generate"):
                    print("DEBUG: Calling Groq LLM via generate([[HumanMessage]])")
                    response = self.llm.generate([[msg]])
                    break
            except Exception as e:
                last_error = e
                response = None

        if response is None:
            print(f"DEBUG: Groq LLM call failed: {type(last_error).__name__}: {last_error}")
            return ""

        # Extract text/content from various possible response shapes
        def _extract_text(res):
            if res is None:
                return ""
            if isinstance(res, str):
                return res
            if hasattr(res, "content"):
                return getattr(res, "content")
            # langchain generations object
            if hasattr(res, "generations"):
                try:
                    gens = getattr(res, "generations")
                    if gens and gens[0] and gens[0][0]:
                        g0 = gens[0][0]
                        if hasattr(g0, "text"):
                            return getattr(g0, "text")
                        if hasattr(g0, "message") and hasattr(getattr(g0, "message"), "content"):
                            return getattr(getattr(g0, "message"), "content")
                except Exception:
                    pass
            if isinstance(res, (list, tuple)) and len(res) > 0:
                first = res[0]
                if isinstance(first, str):
                    return first
                if hasattr(first, "content"):
                    return getattr(first, "content")
                if isinstance(first, dict):
                    for k in ("content", "text", "answer"):
                        if k in first:
                            return first[k]
            if isinstance(res, dict):
                for k in ("content", "text", "answer", "result"):
                    if k in res:
                        return res[k]
            return str(res)

        return _extract_text(response)