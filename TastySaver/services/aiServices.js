// aiServices.js
import { OPENAI_API_KEY } from '@env';

export const generateRecipesWithAI = async (ingredients, diet='Standard') => {
  try {
    const preferenceRules = {
      Vegan: 'Do not use any animal-based ingredients.',
      Vegetarian: 'Do not use meat. Dairy and eggs are allowed.',
      Standard: '',
    };

    const prompt = `
    Generate 3 simple recipes for a ${diet} user.
    ${preferenceRules[diet]}
    You have the following ingredients with their quantities: ${ingredients.join(', ')}.
    The first 2 recipes should ONLY use these ingredients and NOT exceed the available quantities.
    The third recipe can include additional ingredients besides ${ingredients.join(', ')}, but must keep the proportions for the listed ones.

    Each recipe should include:
    - a name
    - a complete and accurate list of ingredients used, each with its quantity and unit
    - preparation steps

    Return the response as a valid JSON array, each element formatted as:
    {"name": "Recipe name", "ingredients": ["..."], "instructions": ["..."]}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('REZ AI:', data);
    const raw = data?.choices?.[0]?.message?.content;

    console.log('👉 RAW RESPONSE:', raw);

    const cleanedRaw = raw.trim().replace(/```json|```/g, '');

    const parsed = JSON.parse(cleanedRaw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Eroare AI:', error);
    return [];
  }
};