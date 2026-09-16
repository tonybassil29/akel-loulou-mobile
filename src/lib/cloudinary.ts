/**
 * Televersement d'image vers Cloudinary via un preset "unsigned" — le meme que
 * le site. Aucun secret n'est embarque dans l'app : le preset est publiable.
 */
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dtv0rzcra';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'mon_preset_image';

export async function uploadImage(localUri: string): Promise<string> {
  const form = new FormData();
  // React Native accepte cette forme d'objet pour un fichier local.
  form.append('file', {
    uri: localUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  form.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary a refusé l'image (${response.status}). ${detail.slice(0, 160)}`);
  }

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error('Cloudinary n\'a pas renvoyé d\'URL.');

  // Meme normalisation que le site : largeur plafonnee, format et qualite auto.
  return data.secure_url.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_auto/');
}
