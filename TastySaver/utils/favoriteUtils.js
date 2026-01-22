import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';

export const toggleFavorite = async (recipeId, add = true) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  await updateDoc(userRef, {
    favoriteRecipeIds: add ? arrayUnion(recipeId) : arrayRemove(recipeId),
  });
};

export const getFavoriteRecipes = async () => {
    const user = auth.currentUser;
    if (!user) return [];
  
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const ids = userDoc.data().favoriteRecipeIds || [];
  
    const recipePromises = ids.map(async (id) => {
      const snap = await getDoc(doc(db, 'recipes', String(id)));
      return snap.exists() ? snap.data() : null;
    });
  
    const results = await Promise.all(recipePromises);
    return results.filter(Boolean);
  };