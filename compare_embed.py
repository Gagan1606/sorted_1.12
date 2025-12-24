import sys, json
import numpy as np

def cosine_sim(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

if __name__ == "__main__":
    emb1 = json.loads(sys.argv[1])
    emb2 = json.loads(sys.argv[2])
    print(json.dumps({"similarity": cosine_sim(emb1, emb2)}))
