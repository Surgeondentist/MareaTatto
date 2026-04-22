/**
 * Vercel Serverless: reseñas públicas vía Google Places API (Place Details, legado).
 * Límite de Google: hasta 5 reseñas por respuesta.
 *
 * Variables de entorno en Vercel:
 * - GOOGLE_MAPS_API_KEY  → clave con "Places API" habilitada (restringida según doc de Google para uso servidor).
 * - GOOGLE_PLACE_ID      → Place ID del negocio (Place ID tool / Maps).
 *
 * Consola: https://console.cloud.google.com/
 */

function hintForStatus(status) {
  switch (status) {
    case 'REQUEST_DENIED':
      return 'La clave o el Place ID fueron rechazados: revisa restricciones de la API key, facturación del proyecto y que Places API esté habilitada.';
    case 'INVALID_REQUEST':
      return 'Petición inválida: comprueba que GOOGLE_PLACE_ID sea un Place ID válido (sin espacios ni comillas).';
    case 'NOT_FOUND':
      return 'Lugar no encontrado: el Place ID podría estar desactualizado o ser incorrecto.';
    case 'OVER_QUERY_LIMIT':
      return 'Cuota excedida: revisa límites y facturación en Google Cloud.';
    default:
      return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=86400');

  const placeId = (process.env.GOOGLE_PLACE_ID || '').trim();
  const key = (process.env.GOOGLE_MAPS_API_KEY || '').trim();

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
      const status = data.status || 'UNKNOWN';
      res.status(200).json({
        configured: true,
        ok: false,
        status,
        error_message: data.error_message || null,
        hint: hintForStatus(status),
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
      status: 'SERVER_ERROR',
      error_message: null,
      hint: 'Error al contactar la API de Google desde el servidor (red o tiempo de espera).',
      rating: null,
      user_ratings_total: null,
      url: null,
      reviews: [],
    });
  }
}
