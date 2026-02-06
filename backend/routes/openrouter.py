"""
OpenRouter API Integration untuk Si-Pakar AI Assistant
VERSI PALING LENGKAP — FINAL
"""

from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

from models.models import Penyakit, Gejala, Aturan

# ==========================================================
# DEBUG: untuk memastikan file ini dipakai Flask
# ==========================================================
print(">>> OPENROUTER FILE ACTIVE <<<")

load_dotenv()

openrouter_bp = Blueprint("openrouter", __name__)

# ============================
# HARDCODE API KEY (PALING MUDAH)
# ============================

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
# 2️⃣ PENJELASAN PENYAKIT
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

    gejala_text = "\n".join(gejala_list) or "Belum ada gejala."

    return (
        f"{p.kode_penyakit} – {p.nama_penyakit}\n"
        f"Gejala terkait:\n{gejala_text}\n\n"
        f"Solusi:\n{p.solusi}\n\n"
        "Catatan: Ini hanya informasi dataset, bukan diagnosa."
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
# 5️⃣ LIST SOLUSI
# ==================================================================

def get_all_solusi():
    penyakit = Penyakit.query.order_by(Penyakit.kode_penyakit.asc()).all()
    return [
        f"{p.kode_penyakit} – {p.nama_penyakit}\nSolusi: {p.solusi}"
        for p in penyakit
    ]


# ==================================================================
# 6️⃣ ROUTE UTAMA AI CHAT
# ==================================================================

@openrouter_bp.route("/api/openrouter/chat", methods=["POST", "OPTIONS"])
def openrouter_chat():

    # ---- Preflight CORS ----
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": "❌ Pesan tidak boleh kosong."}]}
                }]
            }), 400

        user_message = data["message"]

        # Anti-diagnosa
        forbidden = ["diagnosa", "prediksi", "penyakit saya", "cocok penyakit"]
        if any(w in user_message.lower() for w in forbidden):
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{
                        "text": "⚠️ AI tidak boleh memberikan diagnosa. Gunakan konsultan sistem pakar."
                    }]}
                }]
            }), 200

        summary = get_dataset_summary()

        # ---------------------------------------
        # LIST PENYAKIT
        # ---------------------------------------
        if "list" in user_message.lower() and "penyakit" in user_message.lower():
            daftar = "\n".join(f"{p['kode']} – {p['nama']}" for p in summary["penyakit"])
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": daftar}]}
                }]
            }), 200

        # ---------------------------------------
        # LIST GEJALA
        # ---------------------------------------
        if "list" in user_message.lower() and "gejala" in user_message.lower():
            semua = get_all_gejala()
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": "\n".join(semua)}]}
                }]
            }), 200

        # ---------------------------------------
        # LIST SOLUSI
        # ---------------------------------------
        if "list" in user_message.lower() and "solusi" in user_message.lower():
            semua = get_all_solusi()
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": "\n\n".join(semua)}]}
                }]
            }), 200

        # ---------------------------------------
        # PENJELASAN PENYAKIT (P01)
        # ---------------------------------------
        if user_message.upper().startswith("P") and len(user_message) == 3:
            text = explain_penyakit(user_message.upper())
            if text:
                return jsonify({
                    "candidates": [{
                        "content": {"parts": [{"text": text}]}
                    }]
                }), 200

        # ---------------------------------------
        # PENJELASAN GEJALA (G01)
        # ---------------------------------------
        if user_message.upper().startswith("G") and len(user_message) == 3:
            text = explain_gejala(user_message.upper())
            if text:
                return jsonify({
                    "candidates": [{
                        "content": {"parts": [{"text": text}]}
                    }]
                }), 200

        # ---------------------------------------
        # OPENROUTER REQUEST
        # ---------------------------------------

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Si-Pakar AI Assistant"
        }

        payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": "Kamu adalah AI edukasi kesehatan mental."},
                {"role": "user", "content": user_message}
            ]
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            return jsonify({
                "candidates": [{
                    "content": {"parts": [{"text": f"❌ Error OpenRouter: {response.json()}"}]}
                }]
            })

        data = response.json()
        output = data["choices"][0]["message"]["content"]

        return jsonify({
            "candidates": [{
                "content": {"parts": [{"text": output}]}
            }]
        })

    except Exception as e:
        return jsonify({
            "candidates": [{
                "content": {"parts": [{"text": f"❌ Server error: {str(e)}"}]}
            }]
        })
