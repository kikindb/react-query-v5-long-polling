import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
const randomResponse = () => (Math.random() < 0.15 ? 200 : 202);

const app = new Elysia();

app.use(cors());
app.get('/', () => 'Hello Elysia');
app.get('/random', ({ set }) => {
  const rr = randomResponse();
  set.status = rr;
  return {
    status: rr,
    paymentStatus: rr === 200 ? 'Success' : 'Pending',
    message: rr === 200 ? 'This is the data' : null,
  };

  set.status = 500;
  return {
    status: 500,
    paymentStatus: 'Failure',
    message: null,
  };
});
app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
