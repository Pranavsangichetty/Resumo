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

    const prev = {
      width: el.style.width,
      maxWidth: el.style.maxWidth,
      padding: el.style.padding,
    };

    try {
      el.style.width = `${A4_W}px`;
      el.style.maxWidth = `${A4_W}px`;
      el.style.padding = "36px";

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: A4_W,
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
      Object.assign(el.style, prev);
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
