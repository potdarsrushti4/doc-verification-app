import pytesseract

pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
import os
import cv2
import pytesseract
import spacy
import re
import pandas as pd
from PIL import Image
import joblib
from scipy.sparse import hstack
import numpy as np

# --- Load models and tools ---
nlp = spacy.load("en_core_web_sm")
nlp_model = joblib.load("models/voting_nlp_model_updated2.pkl")   # ✅ Place your model here
vectorizer = joblib.load("models/nlp_vectorizer_enhanced.pkl")
ela_model = joblib.load("models/xgboost_model.pkl")
scaler = joblib.load("models/nlp_scaler.pkl")

# --- Flask App ---
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- OCR Extraction ---
def extract_text(image_path):
    try:
        return pytesseract.image_to_string(Image.open(image_path), lang='eng+hin')
    except:
        return ""

# --- NLP Feature Extraction ---
def extract_nlp_features(text):
    doc = nlp(text)
    name = next((ent.text for ent in doc.ents if ent.label_ == "PERSON"), None)
    dob_match = re.search(r"\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b", text)
    aadhaar_match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", text)
    passport_match = re.search(r"\b[A-Z][0-9]{7}\b", text)

    return {
        "name": name,
        "dob": dob_match.group(1) if dob_match else None,
        "aadhaar_id": aadhaar_match.group(0) if aadhaar_match else None,
        "passport_id": passport_match.group(0) if passport_match else None,
        "aadhaar_mentioned": bool(re.search(r"\baadhaar\b", text, re.IGNORECASE)),
        "passport_mentioned": bool(re.search(r"\bpassport\b", text, re.IGNORECASE)),
        "govt_mentioned": bool(re.search(r"भारत सरकार|government", text, re.IGNORECASE))
    }

# --- ELA Features ---
def compute_ela_image(image_path, ela_path, quality=90):
    original = Image.open(image_path).convert('RGB')
    original.save(ela_path, 'JPEG', quality=quality)
    compressed = Image.open(ela_path)
    ela_image = Image.new("RGB", original.size)

    for x in range(original.width):
        for y in range(original.height):
            r1, g1, b1 = original.getpixel((x, y))
            r2, g2, b2 = compressed.getpixel((x, y))
            diff = tuple([min(255, abs(a - b) * 10) for a, b in zip((r1, g1, b1), (r2, g2, b2))])
            ela_image.putpixel((x, y), diff)

    return ela_image

def extract_ela_features(image_path):
    temp_path = os.path.join(UPLOAD_FOLDER, "temp_ela.jpg")
    ela_image = compute_ela_image(image_path, temp_path)
    ela_array = np.array(ela_image).astype(np.float32)

    features = [
        np.mean(ela_array),
        np.var(ela_array),
        np.max(ela_array),
        np.min(ela_array)
    ]
    os.remove(temp_path)
    return np.array([features])

# --- Run server ---
if __name__ == "__main__":
    app.run(debug=True)
