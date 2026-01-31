/**
 * Global Data Context with LocalStorage Persistence
 * Manages inventory and sales data across the application
 * Data persists across page navigation and browser refreshes
 */

import { inventoryItems as defaultInventoryItems, type InventoryItem } from '@/lib/mockData';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Sales data type (matching the CSV structure)
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

// Context state type
interface DataContextState {
  // Inventory data
  inventoryData: InventoryItem[];
  setInventoryData: (data: InventoryItem[]) => void;
  resetInventoryData: () => void;
  isInventoryImported: boolean;
  
  // Sales data
  salesData: SalesRecord[];
  setSalesData: (data: SalesRecord[]) => void;
  resetSalesData: () => void;
  isSalesImported: boolean;
}

// LocalStorage keys
const INVENTORY_STORAGE_KEY = 'matsu-matcha-inventory-data';
const SALES_STORAGE_KEY = 'matsu-matcha-sales-data';

// Create context with default values
const DataContext = createContext<DataContextState | undefined>(undefined);

// Helper function to safely parse JSON from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return fallback;
}

// Helper function to save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or defaults
  const [inventoryData, setInventoryDataState] = useState<InventoryItem[]>(() => 
    loadFromStorage(INVENTORY_STORAGE_KEY, defaultInventoryItems)
  );
  
  const [salesData, setSalesDataState] = useState<SalesRecord[]>(() => 
    loadFromStorage(SALES_STORAGE_KEY, [])
  );
  
  // Track if data was imported (not default)
  const [isInventoryImported, setIsInventoryImported] = useState<boolean>(() => {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return stored !== null;
  });
  
  const [isSalesImported, setIsSalesImported] = useState<boolean>(() => {
    const stored = localStorage.getItem(SALES_STORAGE_KEY);
    return stored !== null && JSON.parse(stored).length > 0;
  });

  // Persist inventory data to localStorage whenever it changes
  useEffect(() => {
    if (isInventoryImported) {
      saveToStorage(INVENTORY_STORAGE_KEY, inventoryData);
    }
  }, [inventoryData, isInventoryImported]);

  // Persist sales data to localStorage whenever it changes
  useEffect(() => {
    if (salesData.length > 0) {
      saveToStorage(SALES_STORAGE_KEY, salesData);
      setIsSalesImported(true);
    }
  }, [salesData]);

  // Setter functions that also update import status
  const setInventoryData = (data: InventoryItem[]) => {
    setInventoryDataState(data);
    setIsInventoryImported(true);
    saveToStorage(INVENTORY_STORAGE_KEY, data);
  };

  const setSalesData = (data: SalesRecord[]) => {
    setSalesDataState(data);
    if (data.length > 0) {
      setIsSalesImported(true);
      saveToStorage(SALES_STORAGE_KEY, data);
    }
  };

  // Reset functions
  const resetInventoryData = () => {
    setInventoryDataState(defaultInventoryItems);
    setIsInventoryImported(false);
    localStorage.removeItem(INVENTORY_STORAGE_KEY);
  };

  const resetSalesData = () => {
    setSalesDataState([]);
    setIsSalesImported(false);
    localStorage.removeItem(SALES_STORAGE_KEY);
  };

  const value: DataContextState = {
    inventoryData,
    setInventoryData,
    resetInventoryData,
    isInventoryImported,
    salesData,
    setSalesData,
    resetSalesData,
    isSalesImported,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export function useData(): DataContextState {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Export the context for advanced use cases
export { DataContext };
