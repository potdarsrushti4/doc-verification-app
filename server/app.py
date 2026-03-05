from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from scipy.sparse import hstack
from verification import extract_text, extract_nlp_features, extract_ela_features, nlp_model, ela_model, vectorizer, scaler
import pandas as pd
import numpy as np
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # restrict to frontend

app.config["PROPAGATE_EXCEPTIONS"] = True
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/verify", methods=["POST"])
def verify_document():
    if "document" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["document"]
    filename = file.filename
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    print(f"📄 Saved uploaded file to: {file_path}")

    # --- Begin ML Logic ---
    text = extract_text(file_path)
    features = extract_nlp_features(text)
    df = pd.DataFrame([{**features, "ocr_text": text}])

    for col in ["name", "dob", "aadhaar_id", "passport_id", "aadhaar_mentioned", "passport_mentioned", "govt_mentioned"]:
        df[col] = df[col].astype(str).str.strip().str.upper().map({
            "TRUE": 1, "FALSE": 0, "1": 1, "0": 0
        }).fillna(0)

    X_text = vectorizer.transform(df["ocr_text"])
    X_ner = scaler.fit_transform(df[["name", "dob", "aadhaar_id", "passport_id", "aadhaar_mentioned", "passport_mentioned", "govt_mentioned"]].astype(float))
    X_combined = hstack([X_text, X_ner])
    nlp_prediction = nlp_model.predict(X_combined)[0]

    ela_features = extract_ela_features(file_path)
    ela_prediction = ela_model.predict(ela_features)[0]

    final_status = "real" if nlp_prediction == 0 and ela_prediction == 0 else "fake"
    confidence = round(np.mean([1 - nlp_prediction, 1 - ela_prediction]) * 100, 2)

    return jsonify({
        "status": final_status,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(debug=True)