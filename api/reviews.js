/**
 * Vercel Serverless: reseñas públicas vía Google Places API (Place Details).
 * Límite de Google: hasta 5 reseñas por respuesta.
 *
 * Variables de entorno en Vercel:
 * - GOOGLE_MAPS_API_KEY  → clave con "Places API" habilitada (restringida por IP de Google / sin referrer en server).
 * - GOOGLE_PLACE_ID      → Place ID del negocio (p. ej. desde el buscador de Place ID de Google).
 *
 * Consola: https://console.cloud.google.com/
 */

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=86400');

  const placeId = process.env.GOOGLE_PLACE_ID;
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!placeId || !key) {
    res.status(200).json({
      configured: false,
      rating: null,
      user_ratings_total: null,
      url: null,
      reviews: [],
    });
    return;
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'rating,user_ratings_total,reviews,url',
      reviews_sort: 'newest',
      language: 'es',
      key,
    });
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const googleRes = await fetch(url);
    const data = await googleRes.json();

    if (data.status !== 'OK' || !data.result) {
      res.status(200).json({
        configured: true,
        ok: false,
        status: data.status,
        error_message: data.error_message || null,
        rating: null,
        user_ratings_total: null,
        url: null,
        reviews: [],
      });
      return;
    }

    const r = data.result;
    const reviews = (r.reviews || []).map((rev) => ({
      author_name: rev.author_name,
      rating: rev.rating,
      relative_time_description: rev.relative_time_description,
      text: rev.text,
      profile_photo_url: rev.profile_photo_url || null,
    }));

    res.status(200).json({
      configured: true,
      ok: true,
      rating: r.rating ?? null,
      user_ratings_total: r.user_ratings_total ?? null,
      url: r.url || null,
      reviews,
    });
  } catch {
    res.status(200).json({
      configured: true,
      ok: false,
      rating: null,
      user_ratings_total: null,
      url: null,
      reviews: [],
    });
  }
}
