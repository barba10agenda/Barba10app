import React, { useState } from 'react';
import { 
  Package, Plus, Search, Edit3, Trash2, AlertTriangle, Check, X, 
  DollarSign, Box, Layers, RefreshCw
} from 'lucide-react';
import { InsumoItem } from '../types';
import { saveInsumoItem, deleteInsumoItem } from '../services/estoque';

interface EstoqueInsumosTabProps {
  insumosList: InsumoItem[];
  insumoSearch: string;
  setInsumoSearch: (val: string) => void;
  insumoCategoryFilter: string;
  setInsumoCategoryFilter: (val: string) => void;
  editingInsumo: Partial<InsumoItem> | null;
  setEditingInsumo: (val: Partial<InsumoItem> | null) => void;
  isInsumoModalOpen: boolean;
  setIsInsumoModalOpen: (val: boolean) => void;
}

export const EstoqueInsumosTab: React.FC<EstoqueInsumosTabProps> = ({
  insumosList,
  insumoSearch,
  setInsumoSearch,
  insumoCategoryFilter,
  setInsumoCategoryFilter,
  editingInsumo,
  setEditingInsumo,
  isInsumoModalOpen,
  setIsInsumoModalOpen,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  // Categories extraction
  const categories = Array.from(
    new Set(insumosList.map((i) => i.category).filter(Boolean))
  );

  // Filtering
  const filteredInsumos = insumosList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(insumoSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(insumoSearch.toLowerCase());
    const matchesCategory =
      insumoCategoryFilter === 'todos' || item.category === insumoCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // KPI Calculations
  const totalItemsCount = insumosList.length;
  const lowStockCount = insumosList.filter((i) => i.quantity <= i.minQuantity).length;
  const totalCostValue = insumosList.reduce(
    (acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.costPrice) || 0),
    0
  );

  // Quick Quantity Update
  const handleQuantityAdjust = async (item: InsumoItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    await saveInsumoItem({ ...item, quantity: newQty });
  };

  // Submit Handler
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsumo?.name?.trim()) {
      alert('Por favor, informe o nome do insumo.');
      return;
    }

    setIsSaving(true);
    try {
      await saveInsumoItem({
        id: editingInsumo.id,
        name: editingInsumo.name.trim(),
        category: editingInsumo.category || 'Geral',
        unit: editingInsumo.unit || 'Unidade',
        quantity: Number(editingInsumo.quantity) || 0,
        minQuantity: Number(editingInsumo.minQuantity) || 1,
        costPrice: Number(editingInsumo.costPrice) || 0,
        notes: editingInsumo.notes || '',
      });
      setIsInsumoModalOpen(false);
      setEditingInsumo(null);
    } catch (err) {
      alert('Erro ao salvar insumo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o insumo "${name}"?`)) {
      await deleteInsumoItem(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.15)] shrink-0">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-syne text-xl font-extrabold text-white uppercase tracking-wider">
                Estoque de Insumos
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-500/30">
                Uso Interno
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Controle de materiais de consumo interno da barbearia (géis, lâminas, golas, toalhas, higienizadores).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingInsumo({
              name: '',
              category: 'Barbearia',
              unit: 'Unidade',
              quantity: 1,
              minQuantity: 2,
              costPrice: 0,
              notes: ''
            });
            setIsInsumoModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Cadastrar Novo Insumo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Insumos</span>
            <Box className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-syne text-3xl font-extrabold text-white">{totalItemsCount}</p>
          <span className="text-[10px] text-zinc-400 block font-medium">Itens cadastrados no estoque</span>
        </div>

        <div className={`rounded-2xl border p-5 space-y-1 transition-all ${
          lowStockCount > 0 
            ? 'border-red-500/40 bg-red-950/20 text-red-400' 
            : 'border-zinc-800 bg-zinc-900/80'
        }`}>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alerta Estoque Baixo</span>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
          </div>
          <p className={`font-syne text-3xl font-extrabold ${lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {lowStockCount}
          </p>
          <span className="text-[10px] text-zinc-400 block font-medium">
            {lowStockCount > 0 ? 'Itens atingiram a quantidade mínima!' : 'Todos os insumos com quantidade adequada'}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Investimento em Insumos</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-syne text-3xl font-extrabold text-emerald-400">
            R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-400 block font-medium">Valor total acumulado em custo</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar insumo..."
            value={insumoSearch}
            onChange={(e) => setInsumoSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setInsumoCategoryFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              insumoCategoryFilter === 'todos'
                ? 'bg-amber-400 text-black font-extrabold'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({insumosList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setInsumoCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                insumoCategoryFilter === cat
                  ? 'bg-amber-400 text-black font-extrabold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insumos List Table / Cards */}
      {filteredInsumos.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-3">
          <Package className="h-10 w-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-bold">Nenhum insumo encontrado</p>
          <p className="text-zinc-500 text-xs">Tente mudar o filtro de busca ou cadastre um novo material de uso interno.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  <th className="p-4">Insumo</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-center">Qtd Atual</th>
                  <th className="p-4 text-center">Est. Mínimo</th>
                  <th className="p-4 text-right">Custo Unit.</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-medium">
                {filteredInsumos.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  const subtotal = item.quantity * item.costPrice;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Name & Notes */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{item.name}</div>
                        {item.notes && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-xs">{item.notes}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-block rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider border border-zinc-700">
                          {item.category}
                        </span>
                      </td>

                      {/* Quantity & Controls */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                          <button
                            onClick={() => handleQuantityAdjust(item, -1)}
                            className="h-6 w-6 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                            title="Diminuir"
                          >
                            -
                          </button>
                          <span className={`px-2 font-mono font-extrabold text-sm ${isLow ? 'text-red-400' : 'text-white'}`}>
                            {item.quantity} <span className="text-[10px] text-zinc-500 font-sans">{item.unit}</span>
                          </span>
                          <button
                            onClick={() => handleQuantityAdjust(item, 1)}
                            className="h-6 w-6 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Min Quantity */}
                      <td className="p-4 text-center font-mono font-bold text-zinc-400">
                        {item.minQuantity} {item.unit}
                      </td>

                      {/* Cost Price */}
                      <td className="p-4 text-right font-mono text-zinc-300">
                        R$ {Number(item.costPrice).toFixed(2)}
                      </td>

                      {/* Subtotal */}
                      <td className="p-4 text-right font-mono font-bold text-amber-400">
                        R$ {subtotal.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-extrabold text-red-400 border border-red-500/20">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Reposição
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20">
                            <Check className="h-3 w-3 shrink-0" /> Normal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingInsumo(item);
                              setIsInsumoModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-400 transition-all cursor-pointer"
                            title="Editar Insumo"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-400 transition-all cursor-pointer"
                            title="Excluir Insumo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Insumo */}
      {isInsumoModalOpen && editingInsumo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-syne text-lg font-bold text-white uppercase tracking-wider">
                  {editingInsumo.id ? 'Editar Insumo' : 'Novo Insumo de Consumo'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsInsumoModalOpen(false);
                  setEditingInsumo(null);
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Shaving Gel 500ml, Gola Higiênica, Lâminas"
                  value={editingInsumo.name || ''}
                  onChange={(e) => setEditingInsumo({ ...editingInsumo, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Barbearia, Higiene, Limpeza"
                    value={editingInsumo.category || ''}
                    onChange={(e) => setEditingInsumo({ ...editingInsumo, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Unidade de Medida</label>
                  <select
                    value={editingInsumo.unit || 'Unidade'}
                    onChange={(e) => setEditingInsumo({ ...editingInsumo, unit: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Unidade">Unidade</option>
                    <option value="Frasco">Frasco</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Rolo">Rolo</option>
                    <option value="Pacote">Pacote</option>
                    <option value="Litro">Litro</option>
                    <option value="Galão">Galão</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Qtd Atual *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingInsumo.quantity ?? 1}
                    onChange={(e) => setEditingInsumo({ ...editingInsumo, quantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Qtd Mínima (Alerta)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingInsumo.minQuantity ?? 2}
                    onChange={(e) => setEditingInsumo({ ...editingInsumo, minQuantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingInsumo.costPrice ?? 0}
                    onChange={(e) => setEditingInsumo({ ...editingInsumo, costPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Observações de Uso</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fornecedor principal, frequência de troca..."
                  value={editingInsumo.notes || ''}
                  onChange={(e) => setEditingInsumo({ ...editingInsumo, notes: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsInsumoModalOpen(false);
                    setEditingInsumo(null);
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
                  {isSaving ? 'Salvando...' : 'Salvar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
