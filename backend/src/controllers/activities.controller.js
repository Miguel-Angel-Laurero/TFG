const Activity = require("../models/Activities.model");

const activitiesController = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            order: [['id', 'ASC']]
        });
        
        if (!activities || activities.length === 0) {
            return res.status(404).json({ message: "No se encontraron actividades" });
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = activitiesController;