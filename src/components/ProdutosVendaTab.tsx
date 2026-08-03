import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Search, Edit3, Trash2, AlertTriangle, Check, X, 
  DollarSign, TrendingUp, Tag, Sparkles
} from 'lucide-react';
import { ProdutoVenda } from '../types';
import { saveProdutoVenda, deleteProdutoVenda } from '../services/estoque';

interface ProdutosVendaTabProps {
  produtosVendaList: ProdutoVenda[];
  produtoSearch: string;
  setProdutoSearch: (val: string) => void;
  produtoCategoryFilter: string;
  setProdutoCategoryFilter: (val: string) => void;
  editingProduto: Partial<ProdutoVenda> | null;
  setEditingProduto: (val: Partial<ProdutoVenda> | null) => void;
  isProdutoModalOpen: boolean;
  setIsProdutoModalOpen: (val: boolean) => void;
}

export const ProdutosVendaTab: React.FC<ProdutosVendaTabProps> = ({
  produtosVendaList,
  produtoSearch,
  setProdutoSearch,
  produtoCategoryFilter,
  setProdutoCategoryFilter,
  editingProduto,
  setEditingProduto,
  isProdutoModalOpen,
  setIsProdutoModalOpen,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // Categories
  const categories = Array.from(
    new Set(produtosVendaList.map((p) => p.category).filter(Boolean))
  );

  // Filtering
  const filteredProdutos = produtosVendaList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(produtoSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(produtoSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(produtoSearch.toLowerCase()));
    const matchesCategory =
      produtoCategoryFilter === 'todos' || item.category === produtoCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // KPI Calculations
  const totalProductsCount = produtosVendaList.length;
  const totalItemsUnits = produtosVendaList.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const lowStockCount = produtosVendaList.filter((p) => p.quantity <= p.minQuantity).length;
  
  const totalPotentialRevenue = produtosVendaList.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.salePrice) || 0),
    0
  );
  
  const totalCost = produtosVendaList.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0),
    0
  );
  
  const totalProfit = totalPotentialRevenue - totalCost;

  // Quick Quantity Update
  const handleQuantityAdjust = async (item: ProdutoVenda, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    await saveProdutoVenda({ ...item, quantity: newQty });
  };

  // Submit Handler
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduto?.name?.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }

    setIsSaving(true);
    try {
      await saveProdutoVenda({
        id: editingProduto.id,
        name: editingProduto.name.trim(),
        category: editingProduto.category || 'Cabelo',
        quantity: Number(editingProduto.quantity) || 0,
        minQuantity: Number(editingProduto.minQuantity) || 1,
        costPrice: Number(editingProduto.costPrice) || 0,
        salePrice: Number(editingProduto.salePrice) || 0,
        salesCommission: Number(editingProduto.salesCommission) || 10,
        description: editingProduto.description || '',
        imageUrl: editingProduto.imageUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300'
      });
      setIsProdutoModalOpen(false);
      setEditingProduto(null);
    } catch (err) {
      alert('Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      await deleteProdutoVenda(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] shrink-0">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-syne text-xl font-extrabold text-white uppercase tracking-wider">
                Produtos de Venda ao Cliente
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                Varejo / Vendas
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Gestão de cosméticos, pomadas, óleos, balms e produtos comercializados para clientes finais da barbearia.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduto({
              name: '',
              category: 'Cabelo',
              quantity: 5,
              minQuantity: 3,
              costPrice: 20,
              salePrice: 45,
              salesCommission: 10,
              description: '',
              imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300'
            });
            setIsProdutoModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catálogo de Venda</span>
            <Tag className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-syne text-3xl font-extrabold text-white">{totalProductsCount}</p>
          <span className="text-[10px] text-zinc-400 block font-medium">{totalItemsUnits} unidades no total</span>
        </div>

        <div className={`rounded-2xl border p-5 space-y-1 transition-all ${
          lowStockCount > 0 
            ? 'border-red-500/40 bg-red-950/20 text-red-400' 
            : 'border-zinc-800 bg-zinc-900/80'
        }`}>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estoque Crítico</span>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
          </div>
          <p className={`font-syne text-3xl font-extrabold ${lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {lowStockCount}
          </p>
          <span className="text-[10px] text-zinc-400 block font-medium">
            {lowStockCount > 0 ? 'Produtos com poucas unidades!' : 'Sem problemas de falta no momento'}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Valor em Vendas (Faturamento)</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-syne text-3xl font-extrabold text-amber-400">
            R$ {totalPotentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-400 block font-medium">Potencial total de vendas em estoque</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lucro Bruto Estimado</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-syne text-3xl font-extrabold text-emerald-400">
            R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-400 block font-medium">Margem líquida antes das comissões</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar produto de venda..."
            value={produtoSearch}
            onChange={(e) => setProdutoSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setProdutoCategoryFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              produtoCategoryFilter === 'todos'
                ? 'bg-amber-400 text-black font-extrabold'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({produtosVendaList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setProdutoCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                produtoCategoryFilter === cat
                  ? 'bg-amber-400 text-black font-extrabold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProdutos.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-3">
          <ShoppingBag className="h-10 w-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-bold">Nenhum produto de venda encontrado</p>
          <p className="text-zinc-500 text-xs">Tente ajustar a busca ou cadastre um novo produto comercial para seus clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProdutos.map((item) => {
            const isLow = item.quantity <= item.minQuantity;
            const profit = item.salePrice - item.costPrice;
            const margin = item.costPrice > 0 ? ((profit / item.salePrice) * 100).toFixed(0) : '100';

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all bg-zinc-900/90 hover:border-zinc-700 ${
                  isLow ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-zinc-800'
                }`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300'}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-800 shrink-0 bg-zinc-950"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-amber-400 border border-amber-500/20">
                          {item.category}
                        </span>
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-red-400 border border-red-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" /> Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-400 border border-emerald-500/20">
                            <Check className="h-2.5 w-2.5" /> Em estoque
                          </span>
                        )}
                      </div>

                      <h4 className="font-syne text-sm font-bold text-white mt-1 leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Stock Controls */}
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Estoque Disponível</span>
                      <span className={`font-mono text-sm font-extrabold ${isLow ? 'text-red-400' : 'text-white'}`}>
                        {item.quantity} un. <span className="text-[10px] text-zinc-400 font-sans">(mín: {item.minQuantity})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityAdjust(item, -1)}
                        className="h-7 w-7 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        title="Diminuir estoque"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuantityAdjust(item, 1)}
                        className="h-7 w-7 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        title="Aumentar estoque"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Prices & Margins Breakdown */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800/80">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-bold block">Custo</span>
                      <span className="text-xs font-mono font-bold text-zinc-300">R$ {Number(item.costPrice).toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-amber-400 uppercase font-bold block">Preço Venda</span>
                      <span className="text-xs font-mono font-extrabold text-amber-400">R$ {Number(item.salePrice).toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-emerald-400 uppercase font-bold block">Margem</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">+{margin}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="text-[10px] font-bold text-zinc-400">
                    Comissão Barbeiro: <strong className="text-amber-400 font-mono">{item.salesCommission || 10}%</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingProduto(item);
                        setIsProdutoModalOpen(true);
                      }}
                      className="p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400 transition-all cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-400 transition-all cursor-pointer"
                      title="Excluir Produto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Produto */}
      {isProdutoModalOpen && editingProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h3 className="font-syne text-lg font-bold text-white uppercase tracking-wider">
                  {editingProduto.id ? 'Editar Produto de Venda' : 'Novo Produto de Venda'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsProdutoModalOpen(false);
                  setEditingProduto(null);
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pomada Modeladora Efeito Matte 150g"
                  value={editingProduto.name || ''}
                  onChange={(e) => setEditingProduto({ ...editingProduto, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={editingProduto.category || 'Cabelo'}
                    onChange={(e) => setEditingProduto({ ...editingProduto, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Tratamento">Tratamento</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Perfumaria">Perfumaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Comissão Barbeiro (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProduto.salesCommission ?? 10}
                    onChange={(e) => setEditingProduto({ ...editingProduto, salesCommission: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Quantidade em Estoque *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduto.quantity ?? 5}
                    onChange={(e) => setEditingProduto({ ...editingProduto, quantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduto.minQuantity ?? 3}
                    onChange={(e) => setEditingProduto({ ...editingProduto, minQuantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduto.costPrice ?? 0}
                    onChange={(e) => setEditingProduto({ ...editingProduto, costPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduto.salePrice ?? 0}
                    onChange={(e) => setEditingProduto({ ...editingProduto, salePrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-amber-500/50 bg-zinc-900 p-2.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">URL da Imagem do Produto</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingProduto.imageUrl || ''}
                  onChange={(e) => setEditingProduto({ ...editingProduto, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Descrição Comercial</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fixação forte, brilho moderado, aroma amadeirado..."
                  value={editingProduto.description || ''}
                  onChange={(e) => setEditingProduto({ ...editingProduto, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsProdutoModalOpen(false);
                    setEditingProduto(null);
                  }}
                  className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
