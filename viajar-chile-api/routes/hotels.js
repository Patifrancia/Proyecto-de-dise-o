// routes/hotels.js
import { Router } from "express";
import { searchBooking } from "../services/providers.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ items: [] });

  // Fechas por defecto (30 a 33 días desde hoy)
  const today = new Date();
  const ci = new Date(today); ci.setDate(ci.getDate() + 30);
  const co = new Date(today); co.setDate(co.getDate() + 33);

  const params = {
    checkin: ci.toISOString().slice(0, 10),
    checkout: co.toISOString().slice(0, 10),
    adults: Number(req.query.adults || 2),
    currency: (req.query.currency || "CLP").toUpperCase(),
    locale: (req.query.locale || "es").toLowerCase(),
  };

  const bookingItems = await searchBooking(q, params);
  res.json({ items: bookingItems });
});

export default router;
