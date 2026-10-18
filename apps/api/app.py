import os
os.environ["GRADIO_SSR_MODE"] = "False"

import gradio as gr
import spaces
from app.main import app as fastapi_app

@spaces.GPU
def gpu_health(text: str) -> str:
    return f"ZeroGPU Online: {text}"

with gr.Blocks(title="Resumo API Server") as demo:
    gr.Markdown("# 🚀 Resumo Backend API is Live!")
    gr.Markdown(
        "This Hugging Face Space hosts the FastAPI backend for the "
        "[Resumo Web App](https://resumo01.netlify.app).\n\n"
        "- **Status**: Operational ✅\n"
        "- **Health Check**: `/health`\n"
        "- **API Docs**: `/docs`"
    )
    with gr.Row():
        txt_in = gr.Textbox(label="Status Query", value="ping")
        txt_out = gr.Textbox(label="Hardware Status")
    btn = gr.Button("Check Hardware")
    btn.click(fn=gpu_health, inputs=txt_in, outputs=txt_out)

app = gr.mount_gradio_app(fastapi_app, demo, path="/", ssr_mode=False)

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 7860))
    print(f"Starting Resumo API server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
