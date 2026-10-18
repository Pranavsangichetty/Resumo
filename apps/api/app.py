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
def gpu_health(text: str = "status") -> str:
    return f"ZeroGPU Online: {text}"

# Native Gradio Blocks interface required by Hugging Face ZeroGPU
with gr.Blocks(title="Resumo API Server") as demo:
    gr.Markdown("# 🚀 Resumo Backend API is Live!")
    gr.Markdown(
        "This Hugging Face Space hosts the FastAPI backend for the "
        "[Resumo Web App](https://resumo01.netlify.app).\n\n"
        "- **Status**: Operational ✅\n"
        "- **Health Check**: `/health`\n"
        "- **Backend Docs**: `/docs`"
    )
    with gr.Row():
        txt_in = gr.Textbox(label="Status Query", value="ping")
        txt_out = gr.Textbox(label="Hardware Status")
    btn = gr.Button("Check Hardware")
    btn.click(fn=gpu_health, inputs=txt_in, outputs=txt_out)

# Configure CORS on the Gradio app so Netlify frontend can call it
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@demo.app.get("/health")
def health():
    return {"status": "ok", "product": "Resumo"}

# Mount the FastAPI backend onto Gradio's internal FastAPI server
demo.app.mount("/api/v1", fastapi_app)
demo.app.mount("", fastapi_app)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
