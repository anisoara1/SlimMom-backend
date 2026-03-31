const corsOptions = {
  origin: "*",
  methods: "GET,POST,PATCH,DELETE,PUT",
  optionsSuccessStatus: 204,
  exposedHeaders: ["Access-Control-Allow-Private-Network"],
};

module.exports = {
  corsOptions,
};
