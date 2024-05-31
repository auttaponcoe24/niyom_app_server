require("dotenv");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || "8801";
app.listen(PORT, () => console.log(`Server is run on PORT: ${PORT}`));
