import express from 'express';

const app = express();

const Port = 4848;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});