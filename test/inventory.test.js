const test = require('node:test');
const assert = require('node:assert');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('CURRENT BEHAVIOUR: inventory.check accepts qty 1 when sellable stock is 1', () => {
  const products = [{ id: 1, name: 'One unit', stock: 1, reserved: 0 }];

  const result = inventory.check(products, [{ id: 1, qty: 1 }]);

  assert.deepStrictEqual(result, { ok: true });
});

test('CURRENT BEHAVIOUR: inventory.check rejects qty 2 when sellable stock is 1', () => {
  const products = [{ id: 1, name: 'One unit', stock: 1, reserved: 0 }];

  const result = inventory.check(products, [{ id: 1, qty: 2 }]);

  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.msg, 'One unit is out of stock (1 sellable available)');
});

test('CURRENT BEHAVIOUR: inventory.check accepts qty 0 when sellable stock is 1', () => {
  const products = [{ id: 1, name: 'One unit', stock: 1, reserved: 0 }];

  const result = inventory.check(products, [{ id: 1, qty: 0 }]);

  assert.deepStrictEqual(result, { ok: true });
});

test('CURRENT BEHAVIOUR: inventory.check accepts qty 1 when stock 4 reserved 3 leaves one sellable unit', () => {
  const products = [{ id: 1, name: 'Reserved item', stock: 4, reserved: 3 }];

  const result = inventory.check(products, [{ id: 1, qty: 1 }]);

  assert.deepStrictEqual(result, { ok: true });
});

test('CURRENT BEHAVIOUR: cancelling a pending order restores stock and leaves reserved unchanged', () => {
  const product = {
    id: 7,
    sku: 'TEST-007',
    name: 'Test product',
    hsn: '1006',
    price: 10,
    stock: 4,
    reserved: 1
  };
  const lineItem = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: product.hsn,
    price: product.price,
    qty: 1
  };
  const db = {
    products: [product],
    orders: [{
      id: 9001,
      date: '22/11/2026',
      customer: 'Walk-in',
      customerId: null,
      paymentMode: 'cash',
      status: 'pending',
      items: [lineItem],
      coupon: '',
      subtotal: 10,
      discount: 0,
      tax: 0.5,
      total: 10.5
    }]
  };

  const before = { stock: product.stock, reserved: product.reserved };
  inventory.reserve(db.products, [lineItem]);
  const afterReserve = { stock: product.stock, reserved: product.reserved };
  const result = orders.cancel(db, 9001, 'characterization test');
  const afterCancel = { stock: product.stock, reserved: product.reserved };

  assert.deepStrictEqual(before, { stock: 4, reserved: 1 });
  assert.deepStrictEqual(afterReserve, { stock: 3, reserved: 1 });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.order.status, 'cancelled');
  assert.deepStrictEqual(afterCancel, { stock: 4, reserved: 1 });
});

test('CORRECT BEHAVIOUR: checkout accepts the last unit and cancellation restores stock once', () => {
  const product = {
    id: 8,
    sku: 'TEST-008',
    name: 'Test product',
    hsn: '0902',
    price: 10,
    stock: 1,
    reserved: 0
  };
  const lineItem = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: product.hsn,
    price: product.price,
    qty: 1
  };
  const db = {
    products: [product],
    orders: [{
      id: 9002,
      date: '22/11/2026',
      customer: 'Walk-in',
      customerId: null,
      paymentMode: 'cash',
      status: 'pending',
      items: [lineItem],
      coupon: '',
      subtotal: 10,
      discount: 0,
      tax: 1.8,
      total: 11.8
    }]
  };

  assert.deepStrictEqual(inventory.check(db.products, [lineItem]), { ok: true });
  inventory.reserve(db.products, [lineItem]);
  assert.strictEqual(product.stock, 0);

  const cancelled = orders.cancel(db, 9002, 'characterization test');
  assert.strictEqual(cancelled.ok, true);
  assert.strictEqual(product.stock, 1);
  assert.strictEqual(product.reserved, 0);

  const cancelledAgain = orders.cancel(db, 9002, 'characterization test');
  assert.strictEqual(cancelledAgain.ok, false);
  assert.strictEqual(product.stock, 1);
  assert.strictEqual(product.reserved, 0);
});
