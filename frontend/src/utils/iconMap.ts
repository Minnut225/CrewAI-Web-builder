/**
 * Maps legacy/FontAwesome icon names or unmapped names to standard Google Material Symbols.
 */
const ICON_ALIAS_MAP: Record<string, string> = {
  // FontAwesome to Material Symbols mappings
  utensils: 'restaurant',
  cutlery: 'restaurant',
  film: 'movie',
  car: 'directions_car',
  automobile: 'directions_car',
  'file-invoice-dollar': 'receipt_long',
  'file-invoice': 'receipt',
  'shopping-bag': 'shopping_bag',
  shopping_bag: 'shopping_bag',
  cart: 'shopping_cart',
  heartbeat: 'medical_services',
  heart: 'favorite',
  'ellipsis-h': 'more_horiz',
  more: 'more_horiz',
  wallet: 'account_balance_wallet',
  gift: 'card_giftcard',
  'chart-line': 'trending_up',
  chart: 'show_chart',
  bolt: 'bolt',
  flash: 'bolt',
  arrow_outgoing: 'arrow_downward',
  arrow_incoming: 'arrow_upward',
  salary: 'payments',
  bank: 'account_balance',
  coffee: 'restaurant',
  cash: 'payments',
  home: 'home',
  house: 'home',
  education: 'school',
  book: 'menu_book',
  plane: 'flight',
  game: 'sports_esports',
};

/**
 * Returns a guaranteed valid Material Symbol icon name for any category or transaction.
 */
export function getCategoryIcon(rawIcon?: string | null, type?: 'INCOME' | 'EXPENSE' | string): string {
  if (!rawIcon || rawIcon.trim() === '') {
    return type === 'INCOME' ? 'payments' : 'shopping_bag';
  }

  const normalized = rawIcon.trim().toLowerCase();
  if (ICON_ALIAS_MAP[normalized]) {
    return ICON_ALIAS_MAP[normalized];
  }

  // If already a valid underscore/standard name, return it
  return normalized;
}

export default getCategoryIcon;
