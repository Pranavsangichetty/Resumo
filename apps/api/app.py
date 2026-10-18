try:
    import spaces

    @spaces.GPU(duration=15)
    def gpu_health():
        return "ZeroGPU Online"
except Exception:
    def gpu_health():
        return "CPU Online"

import gradio as gr
from app.main import app as fastapi_app

# Create a status and info dashboard for Gradio Space
with gr.Blocks(title="Resumo API Server") as demo:
    gr.Markdown("# 🚀 Resumo Backend API is Live!")
    gr.Markdown(
        "This Hugging Face Space hosts the FastAPI backend for the "
        "[Resumo Web App](https://resumo01.netlify.app).\n\n"
        "- **Status**: Operational ✅\n"
        "- **Health Check**: Available at `/health`\n"
        "- **API Docs**: Available at `/docs`"
    )
    # Required for Hugging Face ZeroGPU startup detector
    gpu_btn = gr.Button("Hardware Check", visible=False)
    gpu_btn.click(fn=gpu_health, outputs=[])

# Mount Gradio onto the existing FastAPI application
app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")

if __name__ == "__main__":
    import os
    import uvicorn
    # Only run uvicorn locally when not inside Hugging Face Spaces
    if "SPACE_ID" not in os.environ:
        port = int(os.getenv("PORT", 8000))
        uvicorn.run(app, host="0.0.0.0", port=port)

