const express = require("express");
const LoggerClass = require("./Agents/Classes/logger");
const Logger = new LoggerClass();
module.exports.Logger = Logger;
console.log("Server done");
const battle = require("./FS2").battle;
console.log("FS2 done");
const agents = require("./Agents/agents");
console.log("Agents done");
const app = express();

// LogArray

// Body parser || Static
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/battle", (req, res, err) => {
  battle(agents.R1, agents.P1);
  // res.json({ logArray: FS2.logArray, logArrFighter: logArrFighter });
  res.json(Logger.getLog());
  // res.json({ msg: "WAh" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  agents.createAgents();
  console.log("Server started on port " + PORT);
});

module.exports.app = app;
