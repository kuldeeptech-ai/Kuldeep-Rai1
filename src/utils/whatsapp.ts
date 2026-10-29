import { STORE_INFO, Product } from '../types/product';

export interface WhatsAppEnquiryParams {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
}

/**
 * Builds an official WhatsApp enquiry link with full product details
 * when customer clicks "WhatsApp Par Baat Karein".
 */
export function buildProductWhatsAppUrl({
  product,
  selectedSize,
  selectedColor,
}: WhatsAppEnquiryParams): string {
  const lines: string[] = [
    '🛍️ *Namaste Looks Mens Wear (Mehdawal)*,',
    `Mujhe is product ke baare me baat karni hai:`,
    '',
    `📌 *Product:* ${product.name}`,
    `🏷️ *Category:* ${product.category}`,
  ];

  if (selectedSize) {
    lines.push(`📏 *Selected Size:* ${selectedSize}`);
  } else if (product.sizes && product.sizes.length > 0) {
    lines.push(`📏 *Available Sizes:* ${product.sizes.join(', ')}`);
  }

  if (selectedColor) {
    lines.push(`🎨 *Selected Color:* ${selectedColor}`);
  } else if (product.colors && product.colors.length > 0) {
    lines.push(`🎨 *Available Colors:* ${product.colors.join(', ')}`);
  }

  if (product.price != null && product.price > 0) {
    lines.push(`💰 *Price:* ₹${product.price.toLocaleString('en-IN')}`);
    if (product.originalPrice && product.originalPrice > product.price) {
      lines.push(`🏷️ *MRP:* ₹${product.originalPrice.toLocaleString('en-IN')}`);
    }
  }

  if (typeof product.inStock === 'boolean') {
    lines.push(`📦 *Store Availability:* ${product.inStock ? 'In Store' : 'On Order'}`);
  }

  lines.push('');
  lines.push('Kripya batayein ki ye store me available hai aur iska latest price/offer kya hai. Dhanyawad!');

  const message = lines.join('\n');
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a general WhatsApp contact link to chat with Looks Mens Wear
 */
export function buildGeneralWhatsAppUrl(customMessage?: string): string {
  const defaultMsg =
    'Namaste Looks Mens Wear! Mai aapke Mehdawal store ke menswear collection ke baare me baat karna chahta hu.';
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    customMessage || defaultMsg
  )}`;
}
