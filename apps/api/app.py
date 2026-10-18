import os
os.environ["GRADIO_SSR_MODE"] = "False"

import gradio as gr
import spaces
from fastapi.middleware.cors import CORSMiddleware
from app.main import app as fastapi_app
from app.db.session import init_db

# Initialize database tables
init_db()

@spaces.GPU
def gpu_health(text: str) -> str:
    return f"ZeroGPU Online: {text}"

# Native Gradio Blocks interface required by Hugging Face ZeroGPU
with gr.Blocks(title="Resumo API Server") as demo:
    gr.Markdown("# 🚀 Resumo Backend API is Live!")
    gr.Markdown(
        "This Hugging Face Space hosts the FastAPI backend for the "
        "[Resumo Web App](https://resumo01.netlify.app).\n\n"
        "- **Status**: Operational ✅\n"
        "- **Health Check**: `/health`\n"
        "- **API Docs**: Available"
    )
    with gr.Row():
        txt_in = gr.Textbox(label="Status Query", value="ping")
        txt_out = gr.Textbox(label="Hardware Status")
    btn = gr.Button("Check Hardware")
    btn.click(fn=gpu_health, inputs=txt_in, outputs=txt_out)

if __name__ == "__main__":
    # Launch Gradio without blocking thread initially to attach FastAPI routes
    app, local_url, _ = demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        prevent_thread_lock=True,
    )

    # Attach health check directly to running app
    @app.get("/health")
    def health():
        return {"status": "ok", "product": "Resumo"}

    # Mount our FastAPI routes onto the running server
    app.mount("/api/v1", fastapi_app)
    app.mount("/api", fastapi_app)


    print(f"Resumo API Server running at {local_url} with FastAPI mounted.")
    demo.block_thread()
