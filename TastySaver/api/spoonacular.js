import { SPOONACULAR_API_KEY } from '@env';

const BASE_URL = 'https://api.spoonacular.com/recipes';

export const fetchRecipes = async (number = 3) => {
  try {
    const response = await fetch(
      `${BASE_URL}/random?number=${number}&apiKey=${SPOONACULAR_API_KEY}`
    );
    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return [];
  }
};

export const fetchRecipeDetails = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${id}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
    );
    const instructionsResponse = await fetch(
      `${BASE_URL}/${id}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`
    );
    
    const data = await response.json();
    const instructionsData = await instructionsResponse.json();

    const nutrients = data.nutrition?.nutrients || [];

    const get = (name) =>
      nutrients.find((n) => n.name === name)?.amount +
      ' ' +
      nutrients.find((n) => n.name === name)?.unit;

    const instructions = instructionsData.length > 0
      ? instructionsData[0].steps.map((step) => step.step)
      : [];

    return {
      calories: get('Calories') || 'N/A',
      protein: get('Protein') || 'N/A',
      fat: get('Fat') || 'N/A',
      carbs: get('Carbohydrates') || 'N/A',
      ingredients: data.extendedIngredients?.map(i => i.original) || [],
      instructions: instructions
    };
  } catch (err) {
    console.error('Error fetching recipe details:', err);
    return {
      calories: 'N/A',
      protein: 'N/A',
      fat: 'N/A',
      carbs: 'N/A',
      ingredients: [],
      instructions: []
    };
  }
};

export const fetchRecipesByCategory = async (category, number = 10, offset = 0) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?type=${category}&number=${number}&offset=${offset}&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`
    );
    const data = await response.json();

    return data.results.map((recipe) => ({
      id: recipe.id.toString(),
      name: recipe.title,
      image: recipe.image,
      price: recipe.pricePerServing ? `$${(recipe.pricePerServing / 100).toFixed(2)}` : '$0.00',
      rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20).toFixed(1) : '4.0',
      volume: '1 portion',
      desc: recipe.summary?.replace(/<[^>]*>?/gm, '') || 'No description',
      category: category,
    }));
  } catch (error) {
    console.error('Error fetching dynamic recipes:', error);
    return [];
  }
};

export const searchRecipes = async (query, number = 10, offset = 0) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=${number}&offset=${offset}&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`
    );
    const data = await response.json();

    return data.results.map((recipe) => ({
      id: recipe.id.toString(),
      name: recipe.title,
      image: recipe.image,
      price: recipe.pricePerServing ? `$${(recipe.pricePerServing / 100).toFixed(2)}` : '$0.00',
      rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20).toFixed(1) : '4.0',
      volume: '1 portion',
      desc: recipe.summary?.replace(/<[^>]*>?/gm, '') || 'No description',
      category: recipe.dishTypes?.[0] || 'Other',
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

const getRecipesByTitles = async (titles) => {
  const recipes = [];

  for (const title of titles) {
    const searchResults = await searchRecipes(title, 1);
    if (searchResults.length > 0) {
      recipes.push(searchResults[0]);
    }
  }

  return recipes;
};
