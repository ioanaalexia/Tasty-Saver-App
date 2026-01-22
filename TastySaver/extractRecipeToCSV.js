const fetch = require('node-fetch');
const fs   = require('fs');
require('dotenv').config();

const API_KEY    = process.env.SPOONACULAR_API_KEY;

const BASE_URL    = 'https://api.spoonacular.com/recipes/complexSearch';
const DETAILS_URL = 'https://api.spoonacular.com/recipes';

const CUISINES = [
  'Italian',
  'Romanian',
  'Spanish',
  'French',
  'Mexican',
  'Asian'
];

const PER_CUISINE = 20;  

async function fetchRecipeDetails(id) {
  const url = `${DETAILS_URL}/${id}/information?includeNutrition=true&apiKey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    id: id,
    title: data.title,
    cuisine: data.cuisines?.[0] || 'Unknown',
    ingredients: data.extendedIngredients
                  ?.map(i => i.original)
                  .join(', ') || '',
    image: data.image || '',
    instructions: data.analyzedInstructions?.[0]
                    ?.steps
                    ?.map(s => s.step)
                    .join(' | ') || '',
    desc: data.summary
            ?.replace(/<[^>]*>?/gm, '') || '',
    rating: data.spoonacularScore
              ? (data.spoonacularScore / 20).toFixed(1)
              : '4.0',
    volume: `${data.servings || 1} portion`,
    readyInMinutes: data.readyInMinutes,
    healthScore: data.healthScore,
    vegetarian: data.vegetarian,
    vegan: data.vegan,
    glutenFree: data.glutenFree
  };
}

function saveToCSV(recipes) {
  const header = 'id,title,cuisine,ingredients,image,instructions,desc,rating,volume,readyInMinutes,healthScore,vegetarian,vegan,glutenFree\n';
  const rows = recipes.map(r => 
    `${r.id},"${r.title}","${r.cuisine}","${r.ingredients}","${r.image}","${r.instructions}","${r.desc}",${r.rating},"${r.volume}",${r.readyInMinutes},${r.healthScore},${r.vegetarian},${r.vegan},${r.glutenFree}`
  ).join('\n');

  fs.writeFileSync('recipes.csv', header + rows, 'utf8');
  console.log(`✅ CSV actualizat: recipes.csv (${recipes.length} rețete)`);
}

async function run() {
  try {
    const seenIds = new Set();

    const allRecipes = [];

    for (const cuisine of CUISINES) {
      console.log(`—> Fetching up to ${PER_CUISINE} recipes for cuisine=${cuisine} ...`);

      const url = `${BASE_URL}?cuisine=${encodeURIComponent(cuisine)}&number=${PER_CUISINE}&addRecipeInformation=false&apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results) {
        console.warn(`⚠️  Nu am primit niciun rezultat pentru ${cuisine}.`);
        continue;
      }

      const idsForCuisine = data.results.map(r => r.id);

      for (const id of idsForCuisine) {
        if (seenIds.has(id)) {
          continue;
        }
        seenIds.add(id);

        try {
          const detailed = await fetchRecipeDetails(id);
          allRecipes.push(detailed);
        } catch (err) {
          console.error(`❌ Eroare la fetchRecipeDetails(${id}):`, err.message);
        }
      }
      console.log(`   ‣ Collected so far: ${allRecipes.length} rețete (după ${cuisine})`);
    }

    saveToCSV(allRecipes);

  } catch (err) {
    console.error('❌ Eroare generală:', err.message);
  }
}

run();
