import { z } from 'zod';

// Market ID validator - supports both hex addresses and ticker format
export const marketIdSchema = z.string().refine(
  (val) => {
    // Hex format: 0x followed by 64 hex characters
    const hexPattern = /^0x[a-fA-F0-9]{64}$/;
    // Ticker format: BASE-QUOTE (e.g., INJ-USDT)
    const tickerPattern = /^[A-Z0-9]+-[A-Z0-9]+$/i;
    
    return hexPattern.test(val) || tickerPattern.test(val);
  },
  {
    message: "Invalid market ID format. Expected 66-character hex address starting with '0x' or ticker format 'BASE-QUOTE'",
  }
);

// Market ID param validator for route parameters
export const marketIdParamSchema = z.object({
  marketId: marketIdSchema,
});

// Period validator
export const periodSchema = z.enum(['24h', '7d', '30d'], {
  errorMap: () => ({ message: "Invalid period. Must be one of: 24h, 7d, 30d" }),
});

// Market list validator
export const marketListSchema = z.string().transform((val, ctx) => {
  const markets = val.split(',').map(m => m.trim()).filter(m => m.length > 0);
  
  if (markets.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one market ID required",
    });
    return z.NEVER;
  }
  
  if (markets.length > 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Too many markets. Maximum 10 allowed, got ${markets.length}`,
    });
    return z.NEVER;
  }
  
  // Validate each market ID
  for (const market of markets) {
    const result = marketIdSchema.safeParse(market);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid market ID: ${market}`,
      });
      return z.NEVER;
    }
  }
  
  return markets;
});

// Agent query validator
export const agentQuerySchema = z.object({
  query: z.string().min(3).max(500),
  context: z.record(z.any()).optional().default({}),
});

export type MarketId = z.infer<typeof marketIdSchema>;
export type Period = z.infer<typeof periodSchema>;
export type MarketList = z.infer<typeof marketListSchema>;
export type AgentQuery = z.infer<typeof agentQuerySchema>;
