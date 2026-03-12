import mongoose from "mongoose";
import express from "express";
import Analytics from "../models/analytics.js";

const router = express.Router();
// const ANALYTICS_DOC_ID = "000000000000000000000001";

// async function getOrCreateAnalytics(inc = {}) {
//   return Analytics.findOneAndUpdate(
//     { _id: ANALYTICS_DOC_ID },
//     {
//       $setOnInsert: {
//         _id: ANALYTICS_DOC_ID,
//         totalVisitors: 0,
//         responsiveTests: 0,
//         supporters: 0,
//       },
//       ...(Object.keys(inc).length ? { $inc: inc } : {}),
//     },
//     {
//       new: true,
//       upsert: true,
//       setDefaultsOnInsert: true,
//     },
//   );
// }
async function getOrCreateAnalytics(inc = {}) {
  return Analytics.findOneAndUpdate(
    {},  
    {
      $setOnInsert: {
        totalVisitors: 0,
        responsiveTests: 0,
        supporters: 0,
      },
      ...(Object.keys(inc).length ? { $inc: inc } : {}),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}
router.get("/", async (_req, res) => {
  try {
    const analytics = await getOrCreateAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/visit", async (_req, res) => {
  try {
    const analytics = await getOrCreateAnalytics({ totalVisitors: 1 });
    res.json(analytics);
  } catch (err) {
    console.error("VISIT ERROR:",err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/test", async (_req, res) => {
  try {
    const analytics = await getOrCreateAnalytics({ responsiveTests: 1 });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/support", async (_req, res) => {
  try {
    const analytics = await getOrCreateAnalytics({ supporters: 1 });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
