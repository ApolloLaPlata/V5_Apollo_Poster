/**
 * discountCalculator.ts - Calculadora Automática de Porcentagem de Desconto e Destaque de Economia em Reais
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Motor Financeiro e Psicológico de Descontos para o V5 Finders VIP Hub:
 * - Cálculo preciso de economia em R$ (sem erros de float IEEE 754)
 * - Porcentagem de desconto arredondada
 * - Suporte a cupom adicional cumulativo (% ou valor fixo em R$)
 * - Suporte a desconto à vista / PIX
 * - Classificação psicológica da oferta (Bug de Preço, Super Pechincha, Ótimo Desconto)
 * - Gerador de copies prontas de economia para Telegram e WhatsApp
 */

export type DealUrgencyLevel = "price_bug" | "super_deal" | "great_deal" | "moderate_deal";

export interface DealUrgencyInfo {
  level: DealUrgencyLevel;
  badgeLabel: string;
  badgeColor: string;
  emoji: string;
  description: string;
}

export interface DiscountCalculationInput {
  originalPrice: number;
  promoPrice: number;
  additionalCouponDiscount?: {
    type: "percentage" | "fixed";
    value: number;
  };
  pixDiscountPercentage?: number;
}

export interface FullSavingsResult {
  originalPrice: number;
  promoPrice: number;
  finalPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  effectiveDiscountPercentage: number;
  totalSavingsAmount: number;
  urgency: DealUrgencyInfo;
  headlineTelegram: string;
  headlineWhatsApp: string;
  formattedOriginalPrice: string;
  formattedPromoPrice: string;
  formattedFinalPrice: string;
  formattedSavingsAmount: string;
  formattedTotalSavings: string;
  isValid: boolean;
  warnings: string[];
}

/**
 * Formata moeda brasileira com 2 casas decimais
 */
export function formatCurrencyBr(value: number): string {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  const rounded = Math.round(safeValue * 100) / 100;
  return rounded.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Determina o nível de urgência psicológica e badge da oferta com base no percentual de desconto
 */
export function getDealUrgency(discountPercentage: number): DealUrgencyInfo {
  const safePercentage = Number.isFinite(discountPercentage) ? discountPercentage : 0;
  if (safePercentage >= 60) {
    return {
      level: "price_bug",
      badgeLabel: "BUG DE PREÇO HISTÓRICO",
      badgeColor: "bg-red-600/30 text-red-300 border-red-500/50",
      emoji: "🚨",
      description: "Desconto excepcional de 60% ou mais! Alta probabilidade de esgotar em minutos."
    };
  }

  if (safePercentage >= 40) {
    return {
      level: "super_deal",
      badgeLabel: "SUPER PECHINCHA VIP",
      badgeColor: "bg-amber-600/30 text-amber-300 border-amber-500/50",
      emoji: "🔥",
      description: "Desconto agressivo entre 40% e 59%. Forte apelo de conversão nos grupos."
    };
  }

  if (safePercentage >= 20) {
    return {
      level: "great_deal",
      badgeLabel: "ÓTIMA OPORTUNIDADE",
      badgeColor: "bg-emerald-600/30 text-emerald-300 border-emerald-500/50",
      emoji: "⚡",
      description: "Desconto atrativo entre 20% e 39%. Ideal para compras do dia a dia."
    };
  }

  return {
    level: "moderate_deal",
    badgeLabel: "DESCONTO MODERADO",
    badgeColor: "bg-blue-600/30 text-blue-300 border-blue-500/50",
    emoji: "🏷️",
    description: "Desconto abaixo de 20%. Recomendado se houver frete grátis associado."
  };
}

/**
 * Calcula a economia completa com suporte a cupons adicionais e desconto via PIX
 */
export function calculateFullSavings(input: DiscountCalculationInput): FullSavingsResult {
  const warnings: string[] = [];
  const safeInput = input || ({} as DiscountCalculationInput);
  const origPrice = Number.isFinite(Number(safeInput.originalPrice)) ? Number(safeInput.originalPrice) : 0;
  const promPrice = Number.isFinite(Number(safeInput.promoPrice)) ? Number(safeInput.promoPrice) : 0;

  // Validação básica de entrada
  if (origPrice <= 0 || promPrice <= 0) {
    warnings.push("Preço original e preço promocional devem ser maiores que zero.");
    return {
      originalPrice: 0,
      promoPrice: 0,
      finalPrice: 0,
      discountPercentage: 0,
      savingsAmount: 0,
      effectiveDiscountPercentage: 0,
      totalSavingsAmount: 0,
      urgency: getDealUrgency(0),
      headlineTelegram: "",
      headlineWhatsApp: "",
      formattedOriginalPrice: "0,00",
      formattedPromoPrice: "0,00",
      formattedFinalPrice: "0,00",
      formattedSavingsAmount: "0,00",
      formattedTotalSavings: "0,00",
      isValid: false,
      warnings
    };
  }

  if (promPrice >= origPrice) {
    warnings.push("O preço promocional deve ser menor que o preço original.");
  }

  // 1. Economia Base da Oferta
  const rawSavingsAmount = Math.max(0, origPrice - promPrice);
  const savingsAmount = Math.round(rawSavingsAmount * 100) / 100;
  const rawDiscountPercentage = (rawSavingsAmount / origPrice) * 100;
  const discountPercentage = Math.round(rawDiscountPercentage);

  // 2. Aplicação de Desconto Adicional de Cupom (se houver)
  let priceAfterCoupon = promPrice;
  const coupon = safeInput.additionalCouponDiscount;
  if (coupon && Number.isFinite(coupon.value) && coupon.value > 0) {
    if (coupon.type === "percentage") {
      const couponSavings = promPrice * (coupon.value / 100);
      priceAfterCoupon = Math.max(0, promPrice - couponSavings);
    } else {
      priceAfterCoupon = Math.max(0, promPrice - coupon.value);
    }
  }

  // 3. Aplicação de Desconto Adicional no PIX (se houver)
  let finalPrice = priceAfterCoupon;
  const pixPct = safeInput.pixDiscountPercentage;
  if (Number.isFinite(pixPct) && (pixPct ?? 0) > 0) {
    const pixSavings = priceAfterCoupon * ((pixPct ?? 0) / 100);
    finalPrice = Math.max(0, priceAfterCoupon - pixSavings);
  }

  finalPrice = Math.round(finalPrice * 100) / 100;
  const rawTotalSavings = Math.max(0, origPrice - finalPrice);
  const totalSavingsAmount = Math.round(rawTotalSavings * 100) / 100;
  const effectiveDiscountPercentage = Math.round((totalSavingsAmount / origPrice) * 100);

  // 4. Urgência Psicológica
  const urgency = getDealUrgency(effectiveDiscountPercentage);

  // 5. Headings e Destaques Prontos para Telegram e WhatsApp
  const formattedOriginalPrice = formatCurrencyBr(origPrice);
  const formattedPromoPrice = formatCurrencyBr(promPrice);
  const formattedFinalPrice = formatCurrencyBr(finalPrice);
  const formattedSavingsAmount = formatCurrencyBr(savingsAmount);
  const formattedTotalSavings = formatCurrencyBr(totalSavingsAmount);

  const headlineTelegram = `📉 <i>Você economiza: R$ ${formattedSavingsAmount} (${discountPercentage}% OFF)</i>`;
  const headlineWhatsApp = `📉 _Você economiza: R$ ${formattedSavingsAmount} (${discountPercentage}% OFF)_`;

  return {
    originalPrice: origPrice,
    promoPrice: promPrice,
    finalPrice,
    discountPercentage,
    savingsAmount,
    effectiveDiscountPercentage,
    totalSavingsAmount,
    urgency,
    headlineTelegram,
    headlineWhatsApp,
    formattedOriginalPrice,
    formattedPromoPrice,
    formattedFinalPrice,
    formattedSavingsAmount,
    formattedTotalSavings,
    isValid: warnings.length === 0,
    warnings
  };
}
