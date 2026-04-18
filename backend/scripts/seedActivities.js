/**
 * Script de seed para la tabla `activities`.
 * Uso: node backend/scripts/seedActivities.js
 * Ejecutar una sola vez en producción (Render shell o localmente con DATABASE_URL apuntando a Postgres).
 */
require("dotenv").config();
const { sequelize } = require("../src/models");
const Activity = require("../src/models/Activities.model");

const DEFAULT_ACTIVITIES = [
  {
    name: "Quiz",
    description: "Pon a prueba tu conocimiento del tema.",
  },
  {
    name: "FlashCards",
    description:
      "Practica y repasa mediante tarjetas sobre el tema que prefieras.",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    for (const data of DEFAULT_ACTIVITIES) {
      const [activity, created] = await Activity.findOrCreate({
        where: { name: data.name },
        defaults: data,
      });
      console.log(`${created ? "➕ Creada" : "✔ Ya existe"}: ${activity.name}`);
    }

    console.log("🎉 Seed completado");
  } catch (err) {
    console.error("❌ Error en el seed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
