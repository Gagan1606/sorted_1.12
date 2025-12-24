#!/usr/bin/env python3
import sys
import json
import cv2
from insightface.app import FaceAnalysis

# Use DEFAULT model (works reliably)
face_app = FaceAnalysis(providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0)

if __name__ == "__main__":
    image_path = sys.argv[1]
    img = cv2.imread(image_path)
    faces = face_app.get(img)
    
    if not faces:
        print(json.dumps({"error": "no face detected"}))
        sys.exit(1)
    
    print(json.dumps({"embedding": faces[0].embedding.tolist()}))
