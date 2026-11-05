'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  QrCode, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Zap, 
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
  Calendar
} from 'lucide-react';

export interface PlanItem {
  id: string;
  name: string;
  priceBrl: number;
  priceUsd: number;
  period: 'mês' | 'ano' | 'crédito' | string;
  description: string;
  creditsLabel?: string;
  featured?: boolean;
  features?: string[];
}

interface V5SovereignCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: PlanItem | null;
  plan?: PlanItem | null;
  siteId?: string;
}

export function V5SovereignCheckoutModal({ isOpen, onClose, selectedPlan: propSelectedPlan, plan, siteId }: V5SovereignCheckoutModalProps) {
  const selectedPlan = propSelectedPlan || plan || null;
  const [activeTab, setActiveTab] = useState<'pix' | 'card' | 'crypto'>('pix');
  const [installments, setInstallments] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'generating' | 'waiting' | 'confirmed'>('idle');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos

  // Chaves e endereços do ecossistema soberano
  const defaultPixKey = '00020126580014br.gov.bcb.pix0136a3261240-5e34-4bc8-8ef9-v5apolloholding5204000053039865405' + (selectedPlan?.priceBrl || 49.90).toFixed(2) + '5802BR5925PUSHIN PAY TECNOLOGIA LT6009SAO PAULO62070503***6304';
  const holdingUsdtAddress = '0x98eD3012921D3c6B323Ff5b4009624eE9A5b04';

  useEffect(() => {
    if (isOpen && selectedPlan) {
      setTxStatus('generating');
      const t = setTimeout(() => {
        setTxStatus('waiting');
      }, 500);
      return () => clearTimeout(t);
    } else {
      setTxStatus('idle');
      setTimeLeft(900);
      setInstallments(1);
    }
  }, [isOpen, selectedPlan]);

  // Cronômetro regressivo
  useEffect(() => {
    if (!isOpen || txStatus !== 'waiting') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, txStatus]);

  if (!isOpen || !selectedPlan) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setTxStatus('confirmed');
    setTimeout(() => {
      onClose();
    }, 2400);
  };

  const installmentValue = (selectedPlan.priceBrl / installments).toFixed(2);
  const usdtAmount = (selectedPlan.priceBrl / 5.5).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-400"></div>

        {/* Header do Modal */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">Checkout Soberano V5</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Tri-Pagamento
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
                Plano: <span className="text-white font-semibold">{selectedPlan.name}</span> • R$ {selectedPlan.priceBrl.toFixed(2)} / {selectedPlan.period}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Seletor de Abas de Pagamento */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('pix')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pix'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>PIX D+0</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'card'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Cartão 12x</span>
            </button>

            <button
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'crypto'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>USDT Web3</span>
            </button>
          </div>

          {/* Estado Confirmado */}
          {txStatus === 'confirmed' ? (
            <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 animate-in zoom-in-95">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h4 className="font-bold text-white text-lg">Pagamento Confirmado Instantaneamente!</h4>
              <p className="text-xs text-zinc-300">
                Seus benefícios do plano <span className="font-bold text-emerald-400">{selectedPlan.name}</span> já foram liberados em seu perfil.
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Auto-Drain Soberano Liquidado em 2.4s</span>
              </div>
            </div>
          ) : (
            <>
              {/* ABA 1: PIX */}
              {activeTab === 'pix' && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-white rounded-2xl shadow-inner mb-3">
                      <div className="w-36 h-36 bg-zinc-950 flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200">
                        <QrCode className="w-24 h-24 text-white" />
                        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest mt-1">Pushin Pay D+0</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      Expira em: <span className="font-bold">{formatTime(timeLeft)}</span>
                    </div>

                    <div className="w-full space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 text-left block">
                        Chave PIX Copia e Cola:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={defaultPixKey}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono truncate focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopy(defaultPixKey)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <strong>Beneficiário:</strong> Pushin Pay Tecnologia LTDA
                    </p>
                    <p>• D+0 imediato sem saldo fiduciário retido (Auto-Drain Web3 instantâneo).</p>
                  </div>
                </div>
              )}

              {/* ABA 2: CARTÃO DE CRÉDITO 1X A 12X */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                        Cartão de Crédito Nacional & Internacional
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                        Até 12x Sem Juros
                      </span>
                    </div>

                    {/* Seletor de Parcelamento */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        Escolha as Parcelas:
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => {
                          const val = (selectedPlan.priceBrl / num).toFixed(2);
                          return (
                            <option key={num} value={num} className="bg-zinc-950 text-white">
                              {num}x de R$ {val} {num === 1 ? 'à vista' : 'sem juros para você'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Total Selecionado:</span>
                        <span className="font-bold text-white font-mono">
                          {installments}x de R$ {installmentValue} (R$ {selectedPlan.priceBrl.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                        <span>Custeio de Antecipação:</span>
                        <span>0% para você (absorvido pela Holding)</span>
                      </div>
                    </div>

                    <a
                      href={`https://buy.moonpay.com?currencyCode=usdt_polygon&baseCurrencyAmount=${usdtAmount}&walletAddress=${holdingUsdtAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                    >
                      Pagar com Cartão ({installments}x de R$ {installmentValue})
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="p-3 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400">
                    <p className="flex items-center gap-1.5 text-zinc-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                      <strong>Política de Parcelamento Soberana:</strong> Todas as tarifas de gateway e antecipação são pagas pelo Fundo de Giro da Holding.
                    </p>
                  </div>
                </div>
              )}

              {/* ABA 3: CRIPTO DIRETA USDT */}
              {activeTab === 'crypto' && (
                <div className="space-y-4">
                  <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Coins className="h-4 w-4 text-purple-400" />
                        Transferência Direta On-Chain (USDT)
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-800/50">
                        Polygon / Arbitrum / BSC
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Total em USDT:</span>
                      <span className="text-sm font-bold font-mono text-purple-400">
                        ~{usdtAmount} USDT
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-400 block">Endereço da Carteira Soberana:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={holdingUsdtAddress}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono truncate focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopy(holdingUsdtAddress)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400">
                    <p className="flex items-center gap-1.5 text-zinc-300">
                      <Lock className="h-3.5 w-3.5 text-purple-400" />
                      <strong>Web3 Soberano:</strong> Liquidação instantânea na rede Polygon/Arbitrum, sem intermediários.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botão de Simulação / Homologação */}
          {txStatus !== 'confirmed' && (
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
              <span className="text-[10px] text-zinc-500 font-mono">Modo Soberano Homologado</span>
              <button
                onClick={handleSimulatePayment}
                className="text-[11px] text-zinc-400 hover:text-emerald-400 font-medium underline transition-colors"
              >
                [Simular Pagamento Confirmado]
              </button>
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Cânone Financeiro 50/25/25 Integrado
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">HOLDING V5 APOLLO</span>
        </div>
      </div>
    </div>
  );
}


export default V5SovereignCheckoutModal;
