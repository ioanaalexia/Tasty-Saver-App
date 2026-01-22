from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")


@app.route("/ingredients", methods=["POST"])
def recognize_ingredients():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    img = Image.open(io.BytesIO(file.read())).convert("RGB")

    results = model(img)

    preds = results[0].boxes.cls.cpu().numpy()
    names = results[0].names
    detected_ingredients = list({names[int(cls)] for cls in preds})

    return jsonify({"ingredients": detected_ingredients})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
