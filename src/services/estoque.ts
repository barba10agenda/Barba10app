import { InsumoItem, ProdutoVenda } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const INSUMOS_COLLECTION = 'insumos_barbearia';
export const PRODUTOS_VENDA_COLLECTION = 'produtos_venda_barbearia';

// Default initial data for Insumos (empty for live production)
export const DEFAULT_INSUMOS: InsumoItem[] = [];

// Default initial data for Produtos de Venda (empty for live production)
export const DEFAULT_PRODUTOS_VENDA: ProdutoVenda[] = [];

// Insumos Listen / Sync
export function subscribeInsumos(onData: (items: InsumoItem[]) => void): () => void {
  try {
    return listenToCollection<InsumoItem>(
      INSUMOS_COLLECTION,
      (items) => {
        if (!items || items.length === 0) {
          localStorage.setItem('jadson_insumos_seeded', 'true');
          localStorage.setItem('jadson_insumos_v1', JSON.stringify([]));
          onData([]);
        } else {
          localStorage.setItem('jadson_insumos_seeded', 'true');
          localStorage.setItem('jadson_insumos_v1', JSON.stringify(items));
          onData(items);
        }
      },
      () => {
        // Fallback to local storage
        const saved = localStorage.getItem('jadson_insumos_v1');
        if (saved) {
          try { onData(JSON.parse(saved)); } catch { onData([]); }
        } else {
          onData([]);
        }
      }
    );
  } catch {
    const saved = localStorage.getItem('jadson_insumos_v1');
    if (saved) {
      try { onData(JSON.parse(saved)); } catch { onData([]); }
    } else {
      onData([]);
    }
    return () => {};
  }
}

// Save Insumo
export async function saveInsumoItem(item: Omit<InsumoItem, 'id'> & { id?: string }): Promise<string> {
  const id = item.id || `ins-${Date.now()}`;
  const payload: InsumoItem = {
    ...item,
    id,
    updatedAt: new Date().toISOString()
  };

  try {
    await addDocument(INSUMOS_COLLECTION, payload, id);
  } catch (err) {
    console.warn('Firestore failed, saving locally', err);
  }

  // Always update local storage
  const saved = localStorage.getItem('jadson_insumos_v1');
  let current: InsumoItem[] = saved ? JSON.parse(saved) : DEFAULT_INSUMOS;
  const idx = current.findIndex(i => i.id === id);
  if (idx >= 0) {
    current[idx] = payload;
  } else {
    current.push(payload);
  }
  localStorage.setItem('jadson_insumos_v1', JSON.stringify(current));
  localStorage.setItem('jadson_insumos_seeded', 'true');
  return id;
}

// Delete Insumo
export async function deleteInsumoItem(id: string): Promise<void> {
  localStorage.setItem('jadson_insumos_seeded', 'true');

  try {
    await deleteDocument(INSUMOS_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete failed', err);
  }

  const saved = localStorage.getItem('jadson_insumos_v1');
  let current: InsumoItem[] = saved ? JSON.parse(saved) : [];
  current = current.filter(i => i.id !== id);
  localStorage.setItem('jadson_insumos_v1', JSON.stringify(current));
}

// Subscribe Produtos de Venda
export function subscribeProdutosVenda(onData: (items: ProdutoVenda[]) => void): () => void {
  try {
    return listenToCollection<ProdutoVenda>(
      PRODUTOS_VENDA_COLLECTION,
      (items) => {
        if (!items || items.length === 0) {
          localStorage.setItem('jadson_produtos_venda_seeded', 'true');
          localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify([]));
          onData([]);
        } else {
          localStorage.setItem('jadson_produtos_venda_seeded', 'true');
          localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify(items));
          onData(items);
        }
      },
      () => {
        const saved = localStorage.getItem('jadson_produtos_venda_v1');
        if (saved) {
          try { onData(JSON.parse(saved)); } catch { onData([]); }
        } else {
          onData([]);
        }
      }
    );
  } catch {
    const saved = localStorage.getItem('jadson_produtos_venda_v1');
    if (saved) {
      try { onData(JSON.parse(saved)); } catch { onData([]); }
    } else {
      onData([]);
    }
    return () => {};
  }
}

// Save Produto de Venda
export async function saveProdutoVenda(item: Omit<ProdutoVenda, 'id'> & { id?: string }): Promise<string> {
  const id = item.id || `prod-${Date.now()}`;
  const payload: ProdutoVenda = {
    ...item,
    id,
    updatedAt: new Date().toISOString()
  };

  try {
    await addDocument(PRODUTOS_VENDA_COLLECTION, payload, id);
  } catch (err) {
    console.warn('Firestore failed, saving locally', err);
  }

  const saved = localStorage.getItem('jadson_produtos_venda_v1');
  let current: ProdutoVenda[] = saved ? JSON.parse(saved) : [];
  const idx = current.findIndex(p => p.id === id);
  if (idx >= 0) {
    current[idx] = payload;
  } else {
    current.push(payload);
  }
  localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify(current));
  localStorage.setItem('jadson_produtos_venda_seeded', 'true');
  return id;
}

// Delete Produto de Venda
export async function deleteProdutoVenda(id: string): Promise<void> {
  localStorage.setItem('jadson_produtos_venda_seeded', 'true');

  try {
    await deleteDocument(PRODUTOS_VENDA_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete failed', err);
  }

  const saved = localStorage.getItem('jadson_produtos_venda_v1');
  let current: ProdutoVenda[] = saved ? JSON.parse(saved) : [];
  current = current.filter(p => p.id !== id);
  localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify(current));
}
