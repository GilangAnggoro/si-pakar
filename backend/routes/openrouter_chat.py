"""
OpenRouter API Integration untuk Si-Pakar AI Assistant
VERSI PALING LENGKAP — FINAL
Dengan fitur:
✓ Anti-Diagnosa
✓ Penjelasan Penyakit (dinamis berdasarkan database)
✓ Penjelasan Gejala (dinamis berdasarkan database)
✓ List semua gejala lengkap (G01–Gxx otomatis)
✓ List semua penyakit (P01–Pxx)
✓ List SOLUSI penyakit sesuai dataset (BARU)
✓ System prompt dinamis mengikuti isi database
✓ AI boleh memberi edukasi, jurnal, video
✓ AI TIDAK boleh mendiagnosa user
"""

from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

from models.models import Penyakit, Gejala, Aturan

load_dotenv()

openrouter_bp = Blueprint("openrouter", __name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

FREE_MODELS = [
    "arcee-ai/trinity-large-preview:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-405b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-27b-it:free",
    "deepseek/deepseek-r1-0528:free"
]

DEFAULT_MODEL = FREE_MODELS[0]

# ==================================================================
# 1️⃣ RINGKASAN DATASET
# ==================================================================

def get_dataset_summary():
    semua_penyakit = Penyakit.query.all()
    semua_gejala_unik = {a.kode_gejala for a in Aturan.query.all()}

    return {
        "penyakit": [
            {"kode": p.kode_penyakit, "nama": p.nama_penyakit}
            for p in semua_penyakit
        ],
        "jumlah_penyakit": len(semua_penyakit),
        "jumlah_gejala": len(semua_gejala_unik)
    }

# ==================================================================
# 2️⃣ PENJELASAN PENYAKIT + SOLUSI (LANGSUNG DATABASE)
# ==================================================================

def explain_penyakit(kode):
    p = Penyakit.query.filter_by(kode_penyakit=kode).first()
    if not p:
        return None

    aturan = Aturan.query.filter_by(kode_penyakit=kode).all()
    gejala_list = []

    for a in aturan:
        g = Gejala.query.filter_by(kode_gejala=a.kode_gejala).first()
        if g:
            gejala_list.append(f"- {g.kode_gejala}: {g.nama_gejala}")

    gejala_text = "\n".join(gejala_list) or "Belum ada gejala yang terkait."

    return (
        f"{p.kode_penyakit} – {p.nama_penyakit}\n"
        f"Jumlah gejala: {len(gejala_list)}\n\n"
        f"Daftar gejala:\n{gejala_text}\n\n"
        f"Solusi berdasarkan dataset:\n{p.solusi}\n\n"
        "Catatan: Penjelasan ini berbasis dataset dan bukan merupakan diagnosa."
    )

# ==================================================================
# 3️⃣ PENJELASAN GEJALA
# ==================================================================

def explain_gejala(kode):
    g = Gejala.query.filter_by(kode_gejala=kode).first()
    if not g:
        return None
    return f"{g.kode_gejala}: {g.nama_gejala}\nPertanyaan: {g.pertanyaan}"

# ==================================================================
# 4️⃣ LIST SEMUA GEJALA
# ==================================================================

def get_all_gejala():
    return [
        f"{g.kode_gejala} – {g.nama_gejala}"
        for g in Gejala.query.order_by(Gejala.kode_gejala.asc()).all()
    ]

# ==================================================================
# 5️⃣ LIST SEMUA SOLUSI (BARU)
# ==================================================================

def get_all_solusi():
    penyakit = Penyakit.query.order_by(Penyakit.kode_penyakit.asc()).all()
    return [
        f"{p.kode_penyakit} – {p.nama_penyakit}\nSolusi: {p.solusi}"
        for p in penyakit
    ]

# ==================================================================
# 6️⃣ ENDPOINT UTAMA AI ASSISTANT
# ==================================================================

@openrouter_bp.route("/api/openrouter/chat", methods=["POST", "OPTIONS"])
def openrouter_chat():

    # ---- CORS ----
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": "❌ Pesan tidak boleh kosong."}]}
                }]
            }), 400

        user_message = data["message"].strip()

        # ================================================================
        # A. FILTER ANTI DIAGNOSA
        # ================================================================
        forbidden = [
            "diagnosa", "mendiagnosa", "kena apa",
            "penyakit apa saya", "hasil cf", "cf saya",
            "saya kena", "saya termasuk", "cocok penyakit",
            "prediksi penyakit", "penyakit saya"
        ]
        if any(w in user_message.lower() for w in forbidden):
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": "⚠️ AI Assistant tidak memberikan diagnosa. Diagnosa hanya dari sistem pakar CF."
                    }]}
                }]
            }), 200

        # Ringkasan dataset
        summary = get_dataset_summary()

        # ================================================================
        # B. LIST PENYAKIT
        # ================================================================
        if "list" in user_message.lower() and "penyakit" in user_message.lower():
            daftar = "\n".join(
                f"{p['kode']} – {p['nama']}"
                for p in summary["penyakit"]
            )
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": f"Ada {summary['jumlah_penyakit']} penyakit dalam dataset:\n\n{daftar}"
                    }]}
                }]
            }), 200

        # ================================================================
        # C. LIST GEJALA
        # ================================================================
        if "list" in user_message.lower() and "gejala" in user_message.lower():
            semua = get_all_gejala()
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": "Semua gejala dalam dataset:\n\n" + "\n".join(semua)
                    }]}
                }]
            }), 200

        # ================================================================
        # D. LIST SOLUSI (FITUR BARU)
        # ================================================================
        if "list" in user_message.lower() and "solusi" in user_message.lower():
            semua = get_all_solusi()
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": "Solusi seluruh penyakit dalam dataset:\n\n" + "\n\n".join(semua)
                    }]}
                }]
            }), 200

        # ================================================================
        # E. PENJELASAN PENYAKIT (P01–Pxx)
        # ================================================================
        if user_message.upper().startswith("P") and len(user_message) == 3:
            text = explain_penyakit(user_message.upper())
            if text:
                return jsonify({
                    "candidates": [{
                        "content": {"parts": [{"text": text}]}
                    }]
                }), 200

        # ================================================================
        # F. PENJELASAN GEJALA (G01–Gxx)
        # ================================================================
        if user_message.upper().startswith("G") and len(user_message) == 3:
            text = explain_gejala(user_message.upper())
            if text:
                return jsonify({
                    "candidates": [{
                        "content": {"parts": [{"text": text}]}
                    }]
                }), 200

        # ================================================================
        # G. LLM (OpenRouter) — Struktur ASLI
        # ================================================================
        if not OPENROUTER_API_KEY:
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": "❌ API key OpenRouter belum dikonfigurasi."
                    }]}
                }]
            }), 500

        # Dynamic system prompt
        penyakit_str = ", ".join(
            f"{p['kode']}({p['nama']})"
            for p in summary["penyakit"]
        )

        payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        f"Kamu adalah AI Assistant Si-Pakar.\n"
                        f"Gunakan hanya DATASET berikut:\n"
                        f"- Total penyakit: {summary['jumlah_penyakit']}\n"
                        f"- Penyakit: {penyakit_str}\n"
                        f"- Total gejala unik: {summary['jumlah_gejala']}\n\n"
                        "Kamu BOLEH memberikan edukasi, video, jurnal, penjelasan teori CBT, anxiety, dll.\n"
                        "Kamu TIDAK boleh memberikan diagnosa, menilai CF user, atau menghubungkan gejala user ke penyakit."
                    )
                },
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 250,
            "temperature": 0.65
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Si-Pakar AI Assistant"
        }

        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload, headers=headers, timeout=45
        )

        if res.status_code != 200:
            err = "Unknown error"
            try:
                err = res.json().get("error", {}).get("message", err)
            except:
                pass

            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": f"❌ Error OpenRouter: {err}"}]}
                }]
            }), 200

        result = res.json()
        if "choices" in result:
            output = result["choices"][0]["message"]["content"]
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": output}]}
                }]
            }), 200

        return jsonify({
            "candidates": [{
                "content": {"parts": [{"text": "❌ Respons AI tidak valid."}]}
            }]
        }), 200

    except Exception as e:
        return jsonify({
            "candidates": [{
                "content": {"parts": [{"text": f"❌ Server error: {str(e)}"}]}
            }]
        }), 200
