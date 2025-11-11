// routes/search.js
import { Router } from "express";
import { searchBooking, searchAirbnb, searchTripadvisor } from "../services/providers.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ items: [] });

  // ejecuta en paralelo y absorbe errores de cada proveedor
  const results = await Promise.allSettled([
    searchBooking(q).catch(() => []),
    searchAirbnb(q).catch(() => []),
    searchTripadvisor(q).catch(() => []),
  ]);

  // toma solo los cumplidos y que sean arreglos
  const items = results
    .map(r => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []))
    .flat();

  // Fallback: si no hay nada, manda 1 demo para que el front muestre algo (opcional)
  if (items.length === 0) {
    return res.json({
      items: [
        {
          provider: "demo",
          id: "demo-01",
          name: `Hotel Demo ${q}`,
          city: q,
          price: 90000,
          currency: "CLP",
          score: 9.1,
          photo: "https://images.unsplash.com/photo-1501117716987-c8e0bdde4f94",
          address: `Centro de ${q}`,
          url: "https://booking.com",
        },
      ],
    });
  }

  res.json({ items });
});

export default router;
