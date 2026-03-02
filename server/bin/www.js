// Set default NODE_ENV to development
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}



const app = require("../app");
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}