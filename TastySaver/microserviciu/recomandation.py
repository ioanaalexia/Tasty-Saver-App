# recomandation.py (Flask)
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors
import os

app = Flask(__name__)

recipes_df = pd.read_csv("recipes_all_combined.csv", on_bad_lines="skip")
recipes_df.columns = [col.strip().strip(";") for col in recipes_df.columns]

recipes_df["cuisine_normalized"] = (
    recipes_df["cuisine"]
      .fillna("Unknown")
      .str.lower()
      .str.strip()
)

vectorizer_ingr = CountVectorizer(
    token_pattern=r"(?u)\b\w+\b",
    lowercase=True
)
X_ingr = vectorizer_ingr.fit_transform(
    recipes_df["ingredients"].fillna("")
)
knn_ingr = NearestNeighbors(n_neighbors=10, metric="cosine")
knn_ingr.fit(X_ingr)

@app.route("/recommend", methods=["POST"])
def recommend():
    payload   = request.get_json(force=True)
    favorites = payload.get("favorites", [])
    diet      = payload.get("diet", "Standard")
    cuisines  = [c.lower() for c in payload.get("cuisines", [])]
    strict = payload.get("strictCuisine", True)  # default: True

    print(f"→ Payload primit la /recommend: favorites={favorites}, diet={diet}, cuisines={cuisines}")

    # ─── Pas 1: Aplicăm filtrul de dietă ───
    if diet.lower() == "vegan":
        df_filtered = recipes_df[recipes_df["vegan"] == True].copy()
    elif diet.lower() == "vegetarian":
        df_filtered = recipes_df[recipes_df["vegetarian"] == True].copy()
    else:
        df_filtered = recipes_df.copy()

    print(f"   După filtrul dietă: {len(df_filtered)} rețete rămase")

    # ─── Pas 2: Filtrul pe „cuisine” ───
    if strict and cuisines:
        df_filtered = df_filtered[
            df_filtered["cuisine_normalized"].isin(cuisines)
        ].copy()
    print(f"   După filtrul cuisine: {len(df_filtered)} rețete rămase")

    # ─── Pas 3: Pentru fiecare „fav” (care conține ingredients), rulăm KNN pe ingrediente ───
    recommendations = set()
    for fav in favorites:
        fav_title = fav.get("name", "")
        fav_ingr  = fav.get("ingredients", "")
        if isinstance(fav_ingr, list):
            fav_ingr_str = ", ".join(fav_ingr)
        else:
            fav_ingr_str = str(fav_ingr)

        if not fav_ingr_str:
            print(f"   * Avertisment: '{fav_title}' nu are ingredients -> skip")
            continue

        fav_vec = vectorizer_ingr.transform([fav_ingr_str])

        distances, indices = knn_ingr.kneighbors(fav_vec, n_neighbors=6)
        for idx in indices[0]:
            rec_title = recipes_df.iloc[idx]["title"]
            if rec_title.lower() != fav_title.lower():
                recommendations.add(rec_title)

    print(f"   Vecini KNN găsiți (titluri unice): {recommendations}")

    # ─── Pas 4: Intersectăm cu rețetele rămase după dietă + cuisine ───
    df_final = df_filtered[df_filtered["title"].isin(recommendations)].copy()
    print(f"   În final, după intersect cu df_filtered: {len(df_final)} rețete de returnat")

    # ─── Pas 5: Retur­nează obiectele complete (cu image, desc, rating etc.) ───
    df_final = df_final.fillna("")
    results = df_final[[
        "id", "title", "image", "desc", "rating", "volume",
        "ingredients", "instructions", "cuisine"
    ]].to_dict(orient="records")

    return jsonify({"recommended": results})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
