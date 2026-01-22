import { fetchRecipes, fetchRecipeDetails } from '../api/spoonacular';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert'];

export const saveRecipesToFirestore = async () => {
  try {
    const recipesRef = collection(db, 'recipes');

    for (const category of CATEGORIES) {
      const recipes = await fetchRecipesByCategory(category, 5);

      for (const recipe of recipes) {
        const details = await fetchRecipeDetails(recipe.id);

        const recipeData = {
          ...recipe,
          instructions: details.instructions || [],
        };

        await addDoc(recipesRef, recipeData);
      }
    }

    console.log('Rețetele pe categorii au fost salvate în Firestore.');
  } catch (err) {
    console.error('Eroare la salvarea rețetelor:', err);
  }
};