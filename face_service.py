#!/usr/bin/env python3
from flask import Flask, request, jsonify
import cv2, numpy as np
from insightface.app import FaceAnalysis
import sys

print("*** STARTING FACE SERVICE ***", file=sys.stderr)
app = Flask(__name__)

print("Loading buffalo_l...", file=sys.stderr)
face_app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0)
print("buffalo_l READY ON PORT 5000", file=sys.stderr)

@app.route('/embed', methods=['POST'])
def embed():
    file = request.files['image']
    nparr = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    faces = face_app.get(img)
    if not faces:
        return jsonify({"error": "no face detected"})
    return jsonify({"embedding": faces[0].embedding.tolist()})

if __name__ == '__main__':
    print("Starting Flask server...", file=sys.stderr)
    app.run(host='0.0.0.0', port=5000, debug=False)
