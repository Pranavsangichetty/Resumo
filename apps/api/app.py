import gradio as gr
import spaces
from app.main import app as fastapi_app

import os
import sys
import socket

print("=== STARTUP DIAGNOSTICS ===")
print("PID:", os.getpid(), "NAME:", __name__, "ARGS:", sys.argv)
test_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    test_sock.bind(("0.0.0.0", 7860))
    print("TEST: Port 7860 is AVAILABLE for binding")
    test_sock.close()
except Exception as err:
    print("TEST: Port 7860 bind error:", err)

@spaces.GPU
def gpu_health(text: str = "status") -> str:
    return f"ZeroGPU Online: {text}"



# Official ZeroGPU pattern: gr.Interface directly bound to @spaces.GPU function
demo = gr.Interface(
    fn=gpu_health,
    inputs=gr.Textbox(label="Status Query", value="ping"),
    outputs=gr.Textbox(label="Status"),
    title="Resumo API Server",
    description=(
        "Backend FastAPI service powering the "
        "[Resumo Web App](https://resumo01.netlify.app).\n\n"
        "- Status: Operational ✅\n"
        "- Health: /health\n"
        "- API Docs: /docs"
    ),
)

# Mount Gradio onto the existing FastAPI application
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)




