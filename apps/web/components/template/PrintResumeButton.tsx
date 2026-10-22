"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_W = 794;

export default function PrintResumeButton() {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    const el = document.querySelector(".print-resume") as HTMLElement;
    if (!el) return;

    setDownloading(true);

    let container: HTMLDivElement | null = null;

    try {
      // Create an isolated off-screen sandbox container with fixed A4 desktop dimensions
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = `${A4_W}px`;
      container.style.minWidth = `${A4_W}px`;
      container.style.maxWidth = `${A4_W}px`;
      container.style.backgroundColor = "#ffffff";
      container.style.zIndex = "-9999";
      container.style.overflow = "visible";

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.width = `${A4_W}px`;
      clone.style.minWidth = `${A4_W}px`;
      clone.style.maxWidth = `${A4_W}px`;
      clone.style.padding = "36px";
      clone.style.margin = "0";
      clone.style.boxSizing = "border-box";

      container.appendChild(clone);
      document.body.appendChild(container);

      // Force layout calculation
      void container.offsetHeight;

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: A4_W,
        windowWidth: 1200, // Forces full desktop layout calculation regardless of mobile screen
      });

      const imgW = 210;
      const imgH = (canvas.height * imgW) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");

      if (imgH <= 297) {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgW, imgH);
      } else {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgW, 297);
      }

      pdf.save("resume.pdf");
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setDownloading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
      >
        {downloading ? "Downloading..." : "Download PDF"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
      >
        Print
      </button>
    </div>
  );
}
