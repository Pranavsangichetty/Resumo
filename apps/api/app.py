import os
import socket
import gradio as gr
import spaces
from app.main import app as fastapi_app

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
    import uvicorn

    port = int(os.getenv("PORT", 7860))

    # Pre-bind socket with SO_REUSEADDR and SO_REUSEPORT to prevent Errno 98 port conflicts
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    if hasattr(socket, "SO_REUSEPORT"):
        try:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        except Exception:
            pass

    sock.bind(("0.0.0.0", port))
    sock.listen(128)
    print(f"Server socket bound successfully on port {port}. Handing fd to Uvicorn...")
    uvicorn.run(app, fd=sock.fileno())
