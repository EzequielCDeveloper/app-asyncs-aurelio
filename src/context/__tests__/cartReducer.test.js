import { describe, it, expect } from 'vitest';
import { cartReducer } from '../CartContext';

describe('cartReducer', () => {
  const product = { id: 1, name: 'Burger', price: 10, image: 'burger.jpg', alt: 'Burger' };

  describe('ADD_ITEM', () => {
    it('adds a new item to empty cart', () => {
      const state = [];
      const next = cartReducer(state, { type: 'ADD_ITEM', product });
      expect(next).toHaveLength(1);
      expect(next[0]).toEqual({ ...product, quantity: 1 });
    });

    it('increments quantity when item already exists', () => {
      const state = [{ ...product, quantity: 1 }];
      const next = cartReducer(state, { type: 'ADD_ITEM', product });
      expect(next).toHaveLength(1);
      expect(next[0].quantity).toBe(2);
    });

    it('keeps state unchanged when item quantity is at 99 cap', () => {
      const state = [{ ...product, quantity: 99 }];
      const next = cartReducer(state, { type: 'ADD_ITEM', product });
      expect(next).toHaveLength(1);
      expect(next[0].quantity).toBe(99);
    });
  });

  describe('REMOVE_ITEM', () => {
    const state = [
      { id: 1, name: 'Burger', quantity: 1 },
      { id: 2, name: 'Fries', quantity: 1 },
    ];

    it('removes item by id', () => {
      const next = cartReducer(state, { type: 'REMOVE_ITEM', id: 1 });
      expect(next).toHaveLength(1);
      expect(next[0].id).toBe(2);
    });

    it('returns same state when id does not exist', () => {
      const next = cartReducer(state, { type: 'REMOVE_ITEM', id: 999 });
      expect(next).toHaveLength(2);
    });
  });

  describe('INCREMENT', () => {
    it('increments item quantity', () => {
      const state = [{ id: 1, quantity: 1 }];
      const next = cartReducer(state, { type: 'INCREMENT', id: 1 });
      expect(next[0].quantity).toBe(2);
    });

    it('caps at 99', () => {
      const state = [{ id: 1, quantity: 99 }];
      const next = cartReducer(state, { type: 'INCREMENT', id: 1 });
      expect(next[0].quantity).toBe(99);
    });

    it('no-ops for missing id', () => {
      const state = [{ id: 1, quantity: 1 }];
      const next = cartReducer(state, { type: 'INCREMENT', id: 999 });
      expect(next).toEqual(state);
    });
  });

  describe('DECREMENT', () => {
    it('decrements item quantity', () => {
      const state = [{ id: 1, quantity: 2 }];
      const next = cartReducer(state, { type: 'DECREMENT', id: 1 });
      expect(next[0].quantity).toBe(1);
    });

    it('removes item when quantity reaches 0', () => {
      const state = [{ id: 1, quantity: 1 }];
      const next = cartReducer(state, { type: 'DECREMENT', id: 1 });
      expect(next).toHaveLength(0);
    });
  });

  describe('CLEAR', () => {
    it('returns empty array', () => {
      const state = [
        { id: 1, quantity: 1 },
        { id: 2, quantity: 3 },
      ];
      const next = cartReducer(state, { type: 'CLEAR' });
      expect(next).toEqual([]);
    });
  });

  describe('default', () => {
    it('returns state unchanged for unknown action', () => {
      const state = [{ id: 1, quantity: 1 }];
      const next = cartReducer(state, { type: 'UNKNOWN' });
      expect(next).toEqual(state);
    });
  });
});
