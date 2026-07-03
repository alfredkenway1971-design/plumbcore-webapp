import { z } from 'zod';

export const InventoryCategoryEnum = z.enum(['pipe', 'fitting', 'valve', 'fixture', 'tool', 'sealant', 'heater', 'pump']);

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: InventoryCategoryEnum,
  sku: z.string(),
  quantity: z.number().int().nonnegative(),
  minQuantity: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  supplier: z.string(),
  location: z.string(),
  description: z.string(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryCategory = z.infer<typeof InventoryCategoryEnum>;

export const CreateInventoryItemSchema = InventoryItemSchema.omit({ id: true });
export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;

export const InventoryAlertSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number().int(),
  minQuantity: z.number().int(),
  shortage: z.number().int(),
});

export type InventoryAlert = z.infer<typeof InventoryAlertSchema>;