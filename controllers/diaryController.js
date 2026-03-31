const MyProducts = require("../schemas/MyProductSchema");
const Product = require("../schemas/ProductSchema");

// ========================= ADD PRODUCT TO DIARY =========================

const addProductToDiary = async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const userId = req.user._id;

    // Căutăm produsul în DB
    const prod = await Product.findOne({ "title.en": product }).lean();
    if (!prod) return res.status(404).json({ error: "Product not found" });

    const totalCalories = Math.round((prod.calories * quantity) / 100);
    const date = new Date().toISOString().split("T")[0];

    let doc = await MyProducts.findOne({ owner: userId });

    if (!doc) {
      doc = await MyProducts.create({
        owner: userId,
        dates: [
          {
            date,
            products: [
              {
                product,
                quantity,
                newCalories: totalCalories,
              },
            ],
          },
        ],
      });
    } else {
      const index = doc.dates.findIndex((d) => d.date === date);

      if (index !== -1) {
        doc.dates[index].products.push({
          product,
          quantity,
          newCalories: totalCalories,
        });
      } else {
        doc.dates.push({
          date,
          products: [
            {
              product,
              quantity,
              newCalories: totalCalories,
            },
          ],
        });
      }

      await doc.save();
    }

    res.json({ status: "success", data: doc });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========================= REMOVE PRODUCT FROM DIARY =========================

const removeProductFromDiary = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const doc = await MyProducts.findOne({ owner: userId });
    if (!doc) return res.status(404).json({ error: "Diary not found" });

    let removed = false;

    doc.dates.forEach((day) => {
      const index = day.products.findIndex(
        (p) => p._id.toString() === productId,
      );

      if (index !== -1) {
        day.products.splice(index, 1);
        removed = true;
      }
    });

    if (!removed) return res.status(404).json({ error: "Product not found" });

    await doc.save();
    res.json({ status: "success", data: doc });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========================= GET DIARY FOR A SPECIFIC DAY =========================

const getDiaryForDay = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date;

    const doc = await MyProducts.findOne({ owner: userId }).lean();
    if (!doc) return res.json({ status: "success", data: [] });

    const day = doc.dates.find((d) => d.date === date);
    if (!day) return res.json({ status: "success", data: [] });

    res.json({ status: "success", data: day });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========================= GET SUMMARY FOR A DAY =========================

const getDiarySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date;

    const doc = await MyProducts.findOne({ owner: userId }).lean();
    if (!doc)
      return res.json({ status: "success", data: { totalCalories: 0 } });

    const day = doc.dates.find((d) => d.date === date);
    if (!day)
      return res.json({ status: "success", data: { totalCalories: 0 } });

    const totalCalories = day.products.reduce(
      (sum, p) => sum + p.newCalories,
      0,
    );

    res.json({
      status: "success",
      data: {
        date,
        totalCalories,
        products: day.products,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addProductToDiary,
  removeProductFromDiary,
  getDiaryForDay,
  getDiarySummary,
};
