const app = require("./app");
const startCronJobs = require("./schedule");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startCronJobs(); // start cron jobs after server starts
});
