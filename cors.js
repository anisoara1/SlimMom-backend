const corsOptions = {
  origin: "*",
  methods: "GET,POST",
  optionsSuccessStatus: 204,
  exposedHeaders: ["Access-Control-Allow-Private-Network"],
};

module.exports = {
  corsOptions,
};
