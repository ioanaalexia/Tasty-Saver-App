const FLASK_URL = 'http://10.0.2.2:5000/recommend';

export const getRecommendedRecipes = async ({ favorites, diet, cuisines, strictCuisine = true }) => {
  try {
    const favoritesDetails = favorites.map(fav => {
      return {
        name:      fav.name || "",
        ingredients: Array.isArray(fav.ingredients)
                        ? fav.ingredients
                        : (typeof fav.ingredients === "string"
                            ? fav.ingredients.split(/\s*,\s*/) 
                            : []),
        cuisine:     (fav.cuisine || "").toLowerCase()
      };
    });

    console.log('→ Trimit la Flask favoritesDetails:', favoritesDetails,
                'diet:', diet, 'cuisines:', cuisines);

    const response = await fetch(FLASK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        favorites: favoritesDetails,
        diet,
        cuisines: cuisines.map(c => c.toLowerCase()),
        strictCuisine  
      }),
    });

    const rawText = await response.text();
    console.log('\n>>> RAW RESPONSE from Flask:\n' + rawText + '\n');

    if (!response.ok) {
      console.warn(`Flask returned HTTP ${response.status}`);
      return [];
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error('❌ Eroare la parsare JSON din rawText:', err);
      return [];
    }

    const recommendedResults = data.recommended || [];
    console.log('>>> Parsed JSON „recommended”:', recommendedResults);

    if (
      Array.isArray(recommendedResults) &&
      recommendedResults.length > 0 &&
      typeof recommendedResults[0] === 'object' &&
      recommendedResults[0].image
    ) {
      return recommendedResults;
    }

    return [];
  } catch (error) {
    console.error('❌ Eroare la recomandări:', error);
    return [];
  }
};
