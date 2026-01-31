/**
 * CSV Parser Utility
 * Parses CSV files on the frontend for immediate data display
 */

export interface SalesRecord {
  transaction_id: string;
  timestamp: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_sales: number;
  payment_method: string;
}

export interface IngredientRecord {
  ingredient_id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
}

/**
 * Parse CSV text into an array of objects
 */
export function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number
        const numValue = parseFloat(value);
        // Preserve timestamp, transaction_id, item_id, ingredient_id, menu_item_id as strings
        const keepAsString = ['transaction_id', 'item_id', 'ingredient_id', 'menu_item_id', 'timestamp'].includes(header.trim());
        row[header.trim()] = !isNaN(numValue) && !keepAsString
          ? numValue 
          : value.trim();
      });
      data.push(row as T);
    }
  }
  
  return data;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Read a file and return its text content
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse sales CSV file
 */
export async function parseSalesCSV(file: File): Promise<SalesRecord[]> {
  const text = await readFileAsText(file);
  return parseCSV<SalesRecord>(text);
}

/**
 * Parse ingredients CSV file
 */
export async function parseIngredientsCSV(file: File): Promise<IngredientRecord[]> {
  const text = await readFileAsText(file);
  return parseCSV<IngredientRecord>(text);
}

/**
 * Group sales data by day for revenue chart
 * Handles timestamps in format: YYYY-MM-DD HH:MM:SS
 */
export function groupSalesByDay(sales: SalesRecord[]): { date: string; revenue: number }[] {
  const grouped: Record<string, number> = {};
  
  sales.forEach((sale) => {
    // Handle timestamp format: "2024-02-01 08:06:06"
    let dateStr: string;
    if (typeof sale.timestamp === 'string') {
      // Extract just the date part (YYYY-MM-DD) from the timestamp
      const datePart = sale.timestamp.split(' ')[0];
      if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        dateStr = datePart;
      } else {
        // Fallback: try to parse as Date
        const parsed = new Date(sale.timestamp);
        dateStr = !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : 'Invalid';
      }
    } else {
      dateStr = 'Invalid';
    }
    
    if (dateStr !== 'Invalid') {
      grouped[dateStr] = (grouped[dateStr] || 0) + sale.total_sales;
    }
  });
  
  return Object.entries(grouped)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get payment method distribution
 */
export function getPaymentMethodDistribution(sales: SalesRecord[]): { method: string; count: number; total: number }[] {
  const grouped: Record<string, { count: number; total: number }> = {};
  
  sales.forEach((sale) => {
    const method = sale.payment_method || 'Unknown';
    if (!grouped[method]) {
      grouped[method] = { count: 0, total: 0 };
    }
    grouped[method].count += 1;
    grouped[method].total += sale.total_sales;
  });
  
  return Object.entries(grouped)
    .map(([method, data]) => ({ method, ...data }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Get top items by quantity
 */
export function getTopItemsByQuantity(sales: SalesRecord[], limit: number = 5): { name: string; quantity: number; revenue: number }[] {
  const grouped: Record<string, { quantity: number; revenue: number }> = {};
  
  sales.forEach((sale) => {
    const name = sale.item_name || 'Unknown';
    if (!grouped[name]) {
      grouped[name] = { quantity: 0, revenue: 0 };
    }
    grouped[name].quantity += sale.quantity;
    grouped[name].revenue += sale.total_sales;
  });
  
  return Object.entries(grouped)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}
