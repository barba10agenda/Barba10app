import { InsumoItem, ProdutoVenda } from '../types';
import { listenToCollection, addDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const INSUMOS_COLLECTION = 'insumos_barbearia';
export const PRODUTOS_VENDA_COLLECTION = 'produtos_venda_barbearia';

// Default mock initial data for Insumos
export const DEFAULT_INSUMOS: InsumoItem[] = [
  {
    id: 'ins-1',
    name: 'Shaving Gel Transparente (500ml)',
    category: 'Barbearia',
    quantity: 8,
    minQuantity: 3,
    unit: 'Frasco',
    costPrice: 25.00,
    notes: 'Uso diário nas bancadas dos barbeiros'
  },
  {
    id: 'ins-2',
    name: 'Gola Higiênica Descartável (Rolo c/ 100)',
    category: 'Higiene',
    quantity: 15,
    minQuantity: 5,
    unit: 'Rolo',
    costPrice: 12.50,
    notes: 'Uso obrigatório por cliente'
  },
  {
    id: 'ins-3',
    name: 'Lâminas de Barbear Wilki (Caixa c/ 100)',
    category: 'Lâminas',
    quantity: 4,
    minQuantity: 2,
    unit: 'Caixa',
    costPrice: 45.00,
    notes: 'Descarte individual por navalha'
  },
  {
    id: 'ins-4',
    name: 'Papel Toalha p/ Mãos e Bancada',
    category: 'Limpeza',
    quantity: 12,
    minQuantity: 4,
    unit: 'Pacote',
    costPrice: 18.00,
    notes: 'Higienização geral da barbearia'
  },
  {
    id: 'ins-5',
    name: 'Talco Antisséptico Barbearia',
    category: 'Higiene',
    quantity: 5,
    minQuantity: 2,
    unit: 'Frasco',
    costPrice: 15.00,
    notes: 'Acabamento do corte de cabelo'
  },
  {
    id: 'ins-6',
    name: 'Loção Pós-Barba Profissional (1L)',
    category: 'Barbearia',
    quantity: 3,
    minQuantity: 1,
    unit: 'Litro',
    costPrice: 65.00,
    notes: 'Acalma a pele após a navalha'
  }
];

// Default mock initial data for Produtos de Venda
export const DEFAULT_PRODUTOS_VENDA: ProdutoVenda[] = [
  {
    id: 'prod-1',
    name: 'Pomada Modeladora Efeito Matte 150g',
    category: 'Cabelo',
    quantity: 18,
    minQuantity: 5,
    costPrice: 22.00,
    salePrice: 45.00,
    salesCommission: 10,
    description: 'Fixação forte e efeito fosco natural sem oleosidade.',
    imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'prod-2',
    name: 'Óleo para Barba Hidratante 30ml',
    category: 'Barba',
    quantity: 12,
    minQuantity: 4,
    costPrice: 18.00,
    salePrice: 39.90,
    salesCommission: 10,
    description: 'Com óleos nobres de jojoba e argan. Alinha os fios e perfuma.',
    imageUrl: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'prod-3',
    name: 'Shampoo Fortificante Antiqueda 250ml',
    category: 'Cabelo',
    quantity: 10,
    minQuantity: 3,
    costPrice: 28.00,
    salePrice: 58.00,
    salesCommission: 10,
    description: 'Limpeza profunda do couro cabeludo e estímulo aos fios.',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'prod-4',
    name: 'Balm para Barba Modelador 90g',
    category: 'Barba',
    quantity: 14,
    minQuantity: 4,
    costPrice: 20.00,
    salePrice: 42.00,
    salesCommission: 10,
    description: 'Hidrata a pele abaixo da barba e retira o frizz.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'prod-5',
    name: 'Minoxidil Tonificante Capilar & Barba',
    category: 'Tratamento',
    quantity: 7,
    minQuantity: 3,
    costPrice: 35.00,
    salePrice: 79.90,
    salesCommission: 12,
    description: 'Estimulante para preenchimento de falhas na barba e cabelo.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597262-8381bf9a4c03?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'prod-6',
    name: 'Pente de Madeira Curvo Antiestático',
    category: 'Acessórios',
    quantity: 25,
    minQuantity: 8,
    costPrice: 8.00,
    salePrice: 25.00,
    salesCommission: 10,
    description: 'Pente artesanal compacto em madeira nobre.',
    imageUrl: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&q=80&w=300'
  }
];

// Insumos Listen / Sync
export function subscribeInsumos(onData: (items: InsumoItem[]) => void): () => void {
  try {
    return listenToCollection<InsumoItem>(
      INSUMOS_COLLECTION,
      (items) => {
        if (!items || items.length === 0) {
          // Seed defaults if empty
          DEFAULT_INSUMOS.forEach((item) => {
            addDocument(INSUMOS_COLLECTION, item, item.id);
          });
          onData(DEFAULT_INSUMOS);
        } else {
          onData(items);
        }
      },
      () => {
        // Fallback to local storage
        const saved = localStorage.getItem('jadson_insumos_v1');
        if (saved) {
          try { onData(JSON.parse(saved)); } catch { onData(DEFAULT_INSUMOS); }
        } else {
          onData(DEFAULT_INSUMOS);
        }
      }
    );
  } catch {
    const saved = localStorage.getItem('jadson_insumos_v1');
    if (saved) {
      try { onData(JSON.parse(saved)); } catch { onData(DEFAULT_INSUMOS); }
    } else {
      onData(DEFAULT_INSUMOS);
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
  return id;
}

// Delete Insumo
export async function deleteInsumoItem(id: string): Promise<void> {
  try {
    await deleteDocument(INSUMOS_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete failed', err);
  }

  const saved = localStorage.getItem('jadson_insumos_v1');
  if (saved) {
    let current: InsumoItem[] = JSON.parse(saved);
    current = current.filter(i => i.id !== id);
    localStorage.setItem('jadson_insumos_v1', JSON.stringify(current));
  }
}

// Subscribe Produtos de Venda
export function subscribeProdutosVenda(onData: (items: ProdutoVenda[]) => void): () => void {
  try {
    return listenToCollection<ProdutoVenda>(
      PRODUTOS_VENDA_COLLECTION,
      (items) => {
        if (!items || items.length === 0) {
          // Seed defaults
          DEFAULT_PRODUTOS_VENDA.forEach((item) => {
            addDocument(PRODUTOS_VENDA_COLLECTION, item, item.id);
          });
          onData(DEFAULT_PRODUTOS_VENDA);
        } else {
          onData(items);
        }
      },
      () => {
        const saved = localStorage.getItem('jadson_produtos_venda_v1');
        if (saved) {
          try { onData(JSON.parse(saved)); } catch { onData(DEFAULT_PRODUTOS_VENDA); }
        } else {
          onData(DEFAULT_PRODUTOS_VENDA);
        }
      }
    );
  } catch {
    const saved = localStorage.getItem('jadson_produtos_venda_v1');
    if (saved) {
      try { onData(JSON.parse(saved)); } catch { onData(DEFAULT_PRODUTOS_VENDA); }
    } else {
      onData(DEFAULT_PRODUTOS_VENDA);
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
  let current: ProdutoVenda[] = saved ? JSON.parse(saved) : DEFAULT_PRODUTOS_VENDA;
  const idx = current.findIndex(p => p.id === id);
  if (idx >= 0) {
    current[idx] = payload;
  } else {
    current.push(payload);
  }
  localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify(current));
  return id;
}

// Delete Produto de Venda
export async function deleteProdutoVenda(id: string): Promise<void> {
  try {
    await deleteDocument(PRODUTOS_VENDA_COLLECTION, id);
  } catch (err) {
    console.warn('Firestore delete failed', err);
  }

  const saved = localStorage.getItem('jadson_produtos_venda_v1');
  if (saved) {
    let current: ProdutoVenda[] = JSON.parse(saved);
    current = current.filter(p => p.id !== id);
    localStorage.setItem('jadson_produtos_venda_v1', JSON.stringify(current));
  }
}
