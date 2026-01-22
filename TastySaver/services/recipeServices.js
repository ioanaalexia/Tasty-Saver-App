import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const getAllRecipes = async () => {
  try {
    const recipesRef = collection(db, 'recipes');
    const snapshot = await getDocs(recipesRef);

    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      instructions: doc.data().instructions || []

    }));

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
};

export const getRecipesByCategory = async (category) => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, where('category', '==', category));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      instructions: doc.data().instructions || []
    }));
  } catch (error) {
    console.error(`Error fetching recipes for ${category}:`, error);
    return [];
  }
};
