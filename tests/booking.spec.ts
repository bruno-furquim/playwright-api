import { test as base, expect } from '@playwright/test';
import { getAuthToken } from './utils/api';
import { faker } from '@faker-js/faker';

function randomDate(start: Date, end: Date) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generateBookingData() {
  const checkin = randomDate(new Date(2025, 0, 1), new Date(2025, 11, 15));
  const checkout = randomDate(new Date(2025, 11, 16), new Date(2025, 11, 28));
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin,
      checkout,
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'None']),
  };
}

const test = base.extend<{
  token: string;
  bookingData: ReturnType<typeof generateBookingData>;
}>({
  token: async ({ request }, use) => {
    const token = await getAuthToken(request);
    await use(token);
  },
  bookingData: async ({}, use) => {
    await use(generateBookingData());
  },
});

test.describe('Booking API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('Deve criar uma nova reserva', async ({ request, bookingData }) => {
    let bookingid: number | undefined;
    try {
      await test.step('Criar reserva', async () => {
        const response = await request.post('/booking', {
          data: bookingData,
          headers: { 'Content-Type': 'application/json' },
        });
        expect(response.ok(), `Falha ao criar reserva: ${response.status()}`).toBeTruthy();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');
        const body = await response.json();
        expect(body).toHaveProperty('bookingid');
        expect(typeof body.bookingid).toBe('number');
        expect(body).toHaveProperty('booking');
        expect(body.booking.firstname).toBe(bookingData.firstname);
        expect(body.booking.lastname).toBe(bookingData.lastname);
        expect(body.booking.totalprice).toBe(bookingData.totalprice);
        expect(body.booking.depositpaid).toBe(bookingData.depositpaid);
        expect(body.booking.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
        expect(body.booking.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);
        expect(body.booking.additionalneeds).toBe(bookingData.additionalneeds);
        bookingid = body.bookingid;
      });
    } finally {
      if (bookingid) {
        await request.delete(`/booking/${bookingid}`, {
          headers: { Cookie: `token=${token}` },
        });
      }
    }
  });

  test('Deve obter uma reserva existente', async ({ request, bookingData }) => {
    let bookingid: number | undefined;
    try {
      await test.step('Criar reserva para consulta', async () => {
        const create = await request.post('/booking', {
          data: bookingData,
          headers: { 'Content-Type': 'application/json' },
        });
        expect(create.ok()).toBeTruthy();
        expect(create.status()).toBe(200);
        const body = await create.json();
        bookingid = body.bookingid;
      });
      await test.step('Consultar reserva', async () => {
        const response = await request.get(`/booking/${bookingid}`);
        expect(response.ok(), `Falha ao obter reserva: ${response.status()}`).toBeTruthy();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');
        const body = await response.json();
        expect(body.firstname).toBe(bookingData.firstname);
        expect(body.lastname).toBe(bookingData.lastname);
        expect(body.totalprice).toBe(bookingData.totalprice);
        expect(body.depositpaid).toBe(bookingData.depositpaid);
        expect(body.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
        expect(body.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);
        expect(body.additionalneeds).toBe(bookingData.additionalneeds);
      });
    } finally {
      if (bookingid) {
        await request.delete(`/booking/${bookingid}`, {
          headers: { Cookie: `token=${token}` },
        });
      }
    }
  });

  test('Deve atualizar uma reserva', async ({ request, bookingData }) => {
    let bookingid: number | undefined;
    try {
      await test.step('Criar reserva para atualização', async () => {
        const create = await request.post('/booking', {
          data: bookingData,
          headers: { 'Content-Type': 'application/json' },
        });
        expect(create.ok()).toBeTruthy();
        expect(create.status()).toBe(200);
        const body = await create.json();
        bookingid = body.bookingid;
      });
      await test.step('Atualizar reserva', async () => {
        const updatedData = { ...bookingData, lastname: 'Atualizado', totalprice: bookingData.totalprice + 50 };
        const response = await request.put(`/booking/${bookingid}`, {
          data: updatedData,
          headers: {
            'Content-Type': 'application/json',
            Cookie: `token=${token}`,
          },
        });
        expect(response.ok(), `Falha ao atualizar reserva: ${response.status()}`).toBeTruthy();
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');
        const body = await response.json();
        expect(body.firstname).toBe(updatedData.firstname);
        expect(body.lastname).toBe('Atualizado');
        expect(body.totalprice).toBe(updatedData.totalprice);
        expect(body.depositpaid).toBe(updatedData.depositpaid);
        expect(body.bookingdates.checkin).toBe(updatedData.bookingdates.checkin);
        expect(body.bookingdates.checkout).toBe(updatedData.bookingdates.checkout);
        expect(body.additionalneeds).toBe(updatedData.additionalneeds);
      });
    } finally {
      if (bookingid) {
        await request.delete(`/booking/${bookingid}`, {
          headers: { Cookie: `token=${token}` },
        });
      }
    }
  });

  test('Deve deletar uma reserva', async ({ request, bookingData }) => {
    let bookingid: number | undefined;
    await test.step('Criar reserva para deleção', async () => {
      const create = await request.post('/booking', {
        data: bookingData,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(create.ok()).toBeTruthy();
      expect(create.status()).toBe(200);
      const body = await create.json();
      bookingid = body.bookingid;
    });
    await test.step('Deletar reserva', async () => {
      const response = await request.delete(`/booking/${bookingid}`, {
        headers: { Cookie: `token=${token}` },
      });
      expect(response.status(), `Falha ao deletar reserva: ${response.status()}`).toBe(201);
      expect(response.headers()['content-type']).toContain('text/plain');
      expect(await response.text()).toBe('Created');
    });
  });
});
