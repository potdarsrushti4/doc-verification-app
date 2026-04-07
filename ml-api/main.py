from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import shutil
import os
import joblib
import numpy as np

from verification import extract_text, extract_nlp_features, extract_ela_features

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Document Verification API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://doc-verifier.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load models
vectorizer = joblib.load("models/nlp_vectorizer_enhanced.pkl")
scaler = joblib.load("models/nlp_scaler.pkl")
nlp_model = joblib.load("models/voting_nlp_model_updated2.pkl")
ela_model = joblib.load("models/xgboost_model.pkl")


@app.post("/verify")
async def verify(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # OCR
    text = extract_text(file_path)

    # NLP features
    nlp_features = extract_nlp_features(text)

    from scipy.sparse import hstack

    # TF-IDF features
    text_vector = vectorizer.transform([text])

    # handcrafted NLP features
    handcrafted_features = np.array([[
        int(nlp_features["aadhaar_mentioned"]),
        int(nlp_features["passport_mentioned"]),
        int(nlp_features["govt_mentioned"]),
        int(nlp_features["aadhaar_id"] is not None),
        int(nlp_features["passport_id"] is not None),
        int(nlp_features["dob"] is not None),
        int(nlp_features["name"] is not None)
    ]])

    # scale handcrafted features
    scaled_handcrafted = scaler.transform(handcrafted_features)

    # combine features
    combined_features = hstack([text_vector, scaled_handcrafted])

    # NLP probability
    nlp_prob = nlp_model.predict_proba(combined_features)[0][1]

    # ELA features + probability
    ela_features = extract_ela_features(file_path)
    ela_prob = ela_model.predict_proba(ela_features)[0][1]

    # Final score (ensemble)
    final_score = 0.6 * ela_prob + 0.4 * nlp_prob

    # Decision logic
    if final_score > 0.75:
        final_prediction = "Fake Document"
    elif final_score > 0.4:
        final_prediction = "Suspicious Document"
    else:
        final_prediction = "Authentic Document"

    result = {
        "status": final_prediction,
        "confidence": float(final_score),
        "name": nlp_features["name"],
        "dob": nlp_features["dob"],
        "document_type": "Detected Document"
    }

    return result