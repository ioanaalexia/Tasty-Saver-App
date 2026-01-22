from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

model = YOLO("best.pt")

image_path = "reteta7.jpg" 
results = model(image_path)

results[0].save(filename="output_detected.jpg")

img = cv2.imread("output_detected.jpg")
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

plt.figure(figsize=(10, 8))
plt.imshow(img_rgb)
plt.axis("off")
plt.title("Ingrediente detectate în imagine")
plt.show()
