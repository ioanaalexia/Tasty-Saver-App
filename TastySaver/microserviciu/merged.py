import pandas as pd

df1 = pd.read_csv("recipes.csv", on_bad_lines='skip')
df2 = pd.read_csv("recipes_cuisine.csv", on_bad_lines='skip')

combined = pd.concat([df1, df2], ignore_index=True)

if "id" in combined.columns:
    combined = combined.drop_duplicates(subset=["id"], keep="first")

combined.to_csv("recipes_all_combined.csv", index=False, encoding="utf-8")

print("✅ Am creat fișierul recipes_all_combined.csv cu", len(combined), "rețete (dup eliminate).")
