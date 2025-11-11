// services/providers.js
import axios from "axios";

const key = process.env.RAPIDAPI_KEY;

function defaultDates() {
  const d1 = new Date(); d1.setDate(d1.getDate() + 1);
  const d2 = new Date(d1); d2.setDate(d2.getDate() + 2);
  const toISO = d => d.toISOString().slice(0, 10);
  return { checkin: toISO(d1), checkout: toISO(d2) };
}

/* BOOKING */
export async function searchBooking(query, opts = {}) {
  const host = process.env.RAPIDAPI_HOST_BOOKING;
  const { checkin, checkout } = { ...defaultDates(), ...opts };

  try {
    // 1) Destino
    const destRes = await axios.get(`https://${host}/api/v1/hotels/searchDestination`, {
      params: { query },
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
    });
    const first = Array.isArray(destRes.data) ? destRes.data[0] : destRes.data?.data?.[0];
    if (!first) return [];

    const destId = first.dest_id || first.id;
    const destType = first.dest_type || "city";

    // 2) Hoteles
    const res = await axios.get(`https://${host}/api/v1/hotels/searchHotels`, {
      params: {
        dest_id: destId, dest_type: destType,
        checkin_date: checkin, checkout_date: checkout,
        adults_number: opts.adults ?? 2,
        currency_code: "CLP", locale: "es",
        sort_by: "popularity", page_number: 1,
      },
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
    });

    const items = res.data?.data || res.data?.result || [];
    return (Array.isArray(items) ? items : []).slice(0, 10).map(h => ({
      provider: "booking",
      id: String(h.hotel_id || h.id),
      name: h.hotel_name || h.name,
      city: h.city_trans || h.city,
      price:
        h.price_breakdown?.all_inclusive_amount?.value ??
        h.composite_price_breakdown?.gross_amount_per_night?.value ??
        h.price,
      currency:
        h.price_breakdown?.all_inclusive_amount?.currency ??
        h.composite_price_breakdown?.gross_amount_per_night?.currency ??
        "CLP",
      score: h.review_score || h.rating,
      photo: h.max_photo_url || h.main_photo_url,
      address: h.address || h.address_trans,
      url: h.url || h.hotel_url,
    }));
  } catch {
    return [];
  }
}

/* AIRBNB */
export async function searchAirbnb(query, opts = {}) {
  const host = process.env.RAPIDAPI_HOST_AIRBNB;
  const { checkin, checkout } = { ...defaultDates(), ...opts };
  try {
    const res = await axios.get(`https://${host}/search-property`, {
      params: { location: `${query}, Chile`, checkin, checkout, adults: opts.adults ?? 2, page: 1 },
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
    });
    const items = res.data?.data ?? [];
    return (Array.isArray(items) ? items : []).slice(0, 10).map(a => ({
      provider: "airbnb",
      id: String(a.id || a.listingId),
      name: a.name,
      city: a.city || a.location?.city,
      price: a.price?.rate || a.price?.priceItems?.[0]?.amount,
      currency: a.price?.currency || "USD",
      url: a.url,
      photo: a.images?.[0],
      address: a.address,
      score: a.rating,
    }));
  } catch {
    return [];
  }
}

/* TRIPADVISOR */
export async function searchTripadvisor(query, opts = {}) {
  const host = process.env.RAPIDAPI_HOST_TRIPADVISOR;
  const { checkin, checkout } = { ...defaultDates(), ...opts };
  try {
    const res = await axios.get(`https://${host}/api/v1/hotels/searchLocation`, {
      params: { query, checkIn: checkin, checkOut: checkout, adults: opts.adults ?? 2, currency: "CLP", language: "es" },
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
    });
    const items = res.data?.results ?? res.data?.data ?? [];
    return (Array.isArray(items) ? items : []).slice(0, 10).map(t => ({
      provider: "tripadvisor",
      id: String(t.id || t.locationId),
      name: t.name,
      city: t.location?.city || t.city,
      price: t.price?.amount || t.price,
      currency: t.price?.currency || "CLP",
      url: t.deeplink || t.url,
      photo: t.images?.[0]?.url || t.images?.[0],
      address: t.address,
      score: t.rating,
    }));
  } catch {
    return [];
  }
}
