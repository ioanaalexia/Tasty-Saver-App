export async function recognizeIngredientsFromImage(imageUri) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  const endpoint = 'http://10.0.2.2:5001/ingredients';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  });

  if (!response.ok) throw new Error('Eroare la recunoaștere ingrediente!');
  return await response.json();
}
