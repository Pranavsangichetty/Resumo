import os
os.environ["GRADIO_SSR_MODE"] = "False"

import gradio as gr
import spaces
from fastapi.middleware.cors import CORSMiddleware
from app.main import app as fastapi_app
from app.db.session import init_db

# Initialize database tables
init_db()

# Auto-seed primary accounts if not present
try:
    from app.db.session import SessionLocal
    from app.models.user import User
    with SessionLocal() as db:
        default_emails = [
            ("GVMSC Contact", "contact.gvmsc@gmail.com"),
            ("Durga Sandeep", "gvmdurgasandeep@gmail.com"),
            ("Pranav Sangichetty", "sangichettypranav@gmail.com"),
            ("Pranav Sangichetty", "sangichettychettys@gmail.com"),
        ]
        for name, email in default_emails:
            existing = db.query(User).filter(User.email == email.lower()).first()
            if not existing:
                db.add(User(
                    name=name,
                    email=email.lower(),
                    password_hash=None,
                    auth_provider="email",
                    is_active=True,
                    is_verified=True,
                ))
        db.commit()
except Exception as e:
    print(f"[Seed Info]: {e}")

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

    # Attach all FastAPI routes (including /health and /api/v1/...) directly
    app.include_router(fastapi_app.router)



    print(f"Resumo API Server running at {local_url} with FastAPI mounted.")
    demo.block_thread()
