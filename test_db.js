// test_db.js
const { sequelize, User, Result } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida correctamente.");

    // Insertar un usuario de prueba
    const user = await User.create({
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "1234"
    });
    console.log("👤 Usuario creado:", user.toJSON());

    // Insertar un resultado vinculado a ese usuario
    const result = await Result.create({
      user_id: user.id,
      tipo: "huella",
      detalle: { ejemplo: "dato en JSON" },
      score: 95.5
    });
    console.log("📊 Resultado creado:", result.toJSON());

    // Consultar usuarios con resultados (usando alias)
    const users = await User.findAll({
      include: { model: Result, as: 'results' }
    });
    console.log("📋 Usuarios con resultados:", JSON.stringify(users, null, 2));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Conexión cerrada.");
  }
})();
