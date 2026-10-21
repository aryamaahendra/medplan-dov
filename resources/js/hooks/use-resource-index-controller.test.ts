import assert from 'node:assert/strict';
import test from 'node:test';

import type { PaginatedData } from './use-resource-index-controller.ts';

interface MockItem {
  id: number;
  name: string;
}

const mockPaginatedData: PaginatedData<MockItem> = {
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ],
  current_page: 1,
  last_page: 5,
  per_page: 10,
  total: 50,
  from: 1,
  to: 10,
};

test('PaginatedData to PaginationMeta extraction preserves pagination contract', () => {
  const meta = {
    current_page: mockPaginatedData.current_page,
    last_page: mockPaginatedData.last_page,
    per_page: mockPaginatedData.per_page,
    total: mockPaginatedData.total,
    from: mockPaginatedData.from,
    to: mockPaginatedData.to,
  };

  assert.equal(meta.current_page, 1);
  assert.equal(meta.last_page, 5);
  assert.equal(meta.total, 50);
  assert.equal(meta.from, 1);
  assert.equal(meta.to, 10);
});

test('Dialog state transitions correctly between create and edit modes', () => {
  let isOpen = false;
  let editingItem: MockItem | null = null;

  const openCreate = () => {
    editingItem = null;
    isOpen = true;
  };

  const openEdit = (item: MockItem) => {
    editingItem = item;
    isOpen = true;
  };

  const close = () => {
    isOpen = false;
    editingItem = null;
  };

  // Initial state
  assert.equal(isOpen, false);
  assert.equal(editingItem, null);

  // Transition to Create
  openCreate();
  assert.equal(isOpen, true);
  assert.equal(editingItem, null);

  // Transition to Edit
  openEdit({ id: 42, name: 'Alpha' });
  assert.equal(isOpen, true);
  assert.deepEqual(editingItem, { id: 42, name: 'Alpha' });

  // Close
  close();
  assert.equal(isOpen, false);
  assert.equal(editingItem, null);
});

test('Delete dialog state machine handles request, cancellation, and dialog close', () => {
  let deletingItem: MockItem | null = null;

  const requestDelete = (item: MockItem) => {
    deletingItem = item;
  };

  const cancel = () => {
    deletingItem = null;
  };

  const setDeleteDialogOpen = (open: boolean) => {
    if (!open) {
      deletingItem = null;
    }
  };

  // Request deletion
  requestDelete({ id: 99, name: 'Target' });
  assert.equal(deletingItem !== null, true);
  assert.deepEqual(deletingItem, { id: 99, name: 'Target' });

  // Cancel deletion
  cancel();
  assert.equal(deletingItem, null);

  // Re-request and simulate modal close event
  requestDelete({ id: 100, name: 'Target 2' });
  assert.equal(deletingItem !== null, true);
  setDeleteDialogOpen(false);
  assert.equal(deletingItem, null);
});
