process.env.NODE_ENV = "test";
process.env.DATABASE_URL ||=
  "postgresql://inferra:password@localhost:5432/inferra_test";
process.env.APP_ORIGIN ||= "http://localhost:5173";
process.env.API_ORIGIN ||= "http://localhost:3000";
process.env.AUTH_PEPPER ||= "test_only_pepper_32_characters_minimum_12345";
process.env.COOKIE_SECURE = "false";
