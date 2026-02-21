import { BillSplit, ReceiptAnalysis } from './firebaseSetup';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Base function to call Gemini API with image and text
 */
async function callGeminiVision(
  imageBase64: string,
  systemPrompt: string,
  userPrompt: string,
  responseSchema?: object
): Promise<string> {
  console.log('callGeminiVision: Starting API call...');
  console.log('API Key present:', !!GEMINI_API_KEY);
  
  const requestBody: any = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  if (responseSchema) {
    requestBody.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Gemini API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    
    // Check for rate limit errors
    if (response.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data: GeminiResponse = await response.json();
  const result = data.candidates[0]?.content?.parts[0]?.text || '';
  console.log('Gemini API result length:', result.length);
  return result;
}

/**
 * Analyze receipt for all features: line items, fees, gratuity, etc.
 */
export async function analyzeReceipt(imageBase64: string): Promise<ReceiptAnalysis> {
  const systemPrompt = `You are an expert receipt analyzer AI. Your job is to meticulously analyze receipt images like a forensic accountant.

IMPORTANT RULES:
1. Extract ALL line items with exact prices and quantities
2. Identify ANY hidden fees, service charges, or automatic gratuities
3. Check if gratuity/tip is already included in the total
4. Look for return policy information on the receipt
5. Categorize items as "Durable" (electronics, clothing, appliances) or "Consumable" (food, drinks, supplies)
6. For durable goods, look for warranty information or return deadlines

Return your analysis as a JSON object with this exact structure:
{
  "lineItems": [{"name": string, "price": number, "quantity": number, "category": string}],
  "subtotal": number,
  "tax": number,
  "total": number,
  "gratuityIncluded": boolean,
  "gratuityAmount": number or null,
  "serviceFees": [{"name": string, "amount": number, "isHidden": boolean, "description": string}],
  "storeName": string,
  "storeAddress": string or null,
  "date": string or null,
  "returnPolicy": string or null,
  "durableItems": [{"name": string, "price": number, "returnDeadline": string or null, "warrantyInfo": string or null, "category": string}]
}`;

  const userPrompt = `Analyze this receipt image thoroughly. Extract all information and identify any hidden fees or included gratuity. Be especially vigilant about service charges that may be buried in the details.`;

  const result = await callGeminiVision(imageBase64, systemPrompt, userPrompt);
  return JSON.parse(result);
}

/**
 * Check for junk fees and hidden charges
 */
export async function detectJunkFees(imageBase64: string): Promise<{
  hasJunkFees: boolean;
  gratuityIncluded: boolean;
  gratuityPercentage: number | null;
  fees: Array<{ name: string; amount: number; isSuspicious: boolean; reason: string }>;
  warnings: string[];
}> {
  const systemPrompt = `You are a consumer protection expert AI specializing in detecting hidden fees and deceptive billing practices.

Your mission:
1. Identify ANY service charges, convenience fees, or automatic gratuities
2. Flag if gratuity/tip is ALREADY included (critical to prevent double-tipping)
3. Check if any standard items are wildly overpriced
4. Look for fees hidden in fine print or abbreviated in confusing ways

Return JSON with this structure:
{
  "hasJunkFees": boolean,
  "gratuityIncluded": boolean,
  "gratuityPercentage": number or null,
  "fees": [{"name": string, "amount": number, "isSuspicious": boolean, "reason": string}],
  "warnings": [string array of warnings for the user]
}`;

  const userPrompt = `Scan this receipt for hidden fees, automatic gratuity, and suspicious charges. Be thorough - consumers deserve to know what they're paying for.`;

  const result = await callGeminiVision(imageBase64, systemPrompt, userPrompt);
  return JSON.parse(result);
}

/**
 * Natural language bill splitting
 */
export async function splitBill(
  imageBase64: string,
  splitInstructions: string,
  tipPercentage: number = 0
): Promise<BillSplit> {
  console.log('splitBill called', { imageLength: imageBase64?.length, splitInstructions, tipPercentage });
  
  const systemPrompt = `You are an expert bill-splitting AI that can understand natural language instructions.

CRITICAL RULES:
1. Parse the receipt to get ALL line items with their exact prices
2. Follow the user's natural language instructions for assigning items to people
3. Handle special cases like "X didn't drink alcohol" or "Y pays for appetizers"
4. Calculate tax proportionally based on each person's subtotal
5. If tip is provided, distribute it proportionally based on subtotals
6. Ensure the total of all shares equals the receipt total (plus tip if applicable)
7. ALWAYS include at least one person in the "individuals" array - never return an empty array
8. If only one person is mentioned, assign all items to them
9. If no specific names are given, use "Person 1", "Person 2", etc.

You MUST return valid JSON with this EXACT structure:
{
  "total": number,
  "individuals": [
    {
      "name": "string",
      "items": [{"name": "string", "price": number, "quantity": number}],
      "subtotal": number,
      "taxShare": number,
      "tipShare": number,
      "owed": number
    }
  ]
}

IMPORTANT: The "individuals" array must NEVER be empty. Always assign items to people.`;

  const userPrompt = `Split this bill according to these instructions: "${splitInstructions}"
  
${tipPercentage > 0 ? `Add a ${tipPercentage}% tip distributed proportionally.` : 'No additional tip.'}

Make sure each person's total ("owed") includes their subtotal + taxShare + tipShare. Round all numbers to 2 decimal places.
Return ONLY valid JSON, no markdown code blocks.`;

  const result = await callGeminiVision(imageBase64, systemPrompt, userPrompt);
  console.log('Raw Gemini result:', result);
  
  // Clean the result - remove markdown code blocks if present
  let cleanedResult = result.trim();
  if (cleanedResult.startsWith('```json')) {
    cleanedResult = cleanedResult.slice(7);
  } else if (cleanedResult.startsWith('```')) {
    cleanedResult = cleanedResult.slice(3);
  }
  if (cleanedResult.endsWith('```')) {
    cleanedResult = cleanedResult.slice(0, -3);
  }
  cleanedResult = cleanedResult.trim();
  
  console.log('Cleaned result:', cleanedResult);
  
  const parsed = JSON.parse(cleanedResult);
  console.log('Parsed result:', JSON.stringify(parsed, null, 2));
  
  // Validate the response
  if (!parsed.individuals || !Array.isArray(parsed.individuals)) {
    console.error('Invalid response - no individuals array');
    throw new Error('AI response missing individuals array');
  }
  
  if (parsed.individuals.length === 0) {
    console.error('Empty individuals array');
    throw new Error('AI returned empty individuals array');
  }
  
  return parsed;
}

/**
 * Inflation Reality Check - Compare prices to market averages
 */
export async function checkInflation(imageBase64: string): Promise<{
  ripOffScore: number;
  overallAssessment: string;
  priceComparisons: Array<{
    itemName: string;
    receiptPrice: number;
    averagePrice: number;
    percentageDiff: number;
    isOverpriced: boolean;
    verdict: string;
  }>;
  totalOverpayment: number;
  recommendations: string[];
}> {
  const systemPrompt = `You are a consumer economics expert AI with knowledge of average US retail and grocery prices in 2024/2025.

Your task:
1. Extract grocery/retail items from the receipt
2. Compare each item's price against typical average market prices
3. Calculate percentage differences
4. Give a "Rip-off Score" from 1-10 (1 = great deals, 10 = highway robbery)
5. Highlight items that are abnormally expensive (>20% above average)
6. Provide actionable recommendations

Use your training data for average US prices. Be realistic about regional variations and store types (convenience stores are typically more expensive).

Return JSON with this structure:
{
  "ripOffScore": number (1-10),
  "overallAssessment": string,
  "priceComparisons": [
    {
      "itemName": string,
      "receiptPrice": number,
      "averagePrice": number,
      "percentageDiff": number,
      "isOverpriced": boolean,
      "verdict": string
    }
  ],
  "totalOverpayment": number,
  "recommendations": [string array]
}`;

  const userPrompt = `Analyze this receipt and compare prices to typical US market averages. Identify any items that are significantly overpriced and calculate a rip-off score.`;

  const result = await callGeminiVision(imageBase64, systemPrompt, userPrompt);
  return JSON.parse(result);
}

/**
 * Wonkavision - Extract warranty/return info
 */
export async function extractWarrantyInfo(imageBase64: string): Promise<{
  hasDurableItems: boolean;
  durableItems: Array<{
    name: string;
    price: number;
    category: 'electronics' | 'clothing' | 'appliance' | 'other';
    returnDeadline: string | null;
    returnDays: number | null;
    warrantyInfo: string | null;
    warrantyDays: number | null;
  }>;
  storeReturnPolicy: string | null;
  purchaseDate: string | null;
  recommendations: string[];
}> {
  const systemPrompt = `You are a consumer rights expert AI specializing in warranties and return policies.

Your mission:
1. Categorize items as "Durable" (electronics, clothes, appliances) or "Consumable" (food, drinks)
2. For durable goods, search the receipt for:
   - Return policy text (e.g., "14-day return", "30 days for refund")
   - Warranty information
   - Purchase date
3. Calculate actual return/warranty deadlines based on the receipt date
4. Provide recommendations for items the user should track

Return JSON with this structure:
{
  "hasDurableItems": boolean,
  "durableItems": [
    {
      "name": string,
      "price": number,
      "category": "electronics" | "clothing" | "appliance" | "other",
      "returnDeadline": string (ISO date) or null,
      "returnDays": number or null,
      "warrantyInfo": string or null,
      "warrantyDays": number or null
    }
  ],
  "storeReturnPolicy": string or null,
  "purchaseDate": string (ISO date) or null,
  "recommendations": [string array]
}`;

  const userPrompt = `Analyze this receipt for durable goods that may have return policies or warranties. Extract all relevant dates and policies. Today's date should be used if the receipt date is not visible.`;

  const result = await callGeminiVision(imageBase64, systemPrompt, userPrompt);
  return JSON.parse(result);
}

/**
 * Full receipt analysis combining all features
 */
export async function fullReceiptAnalysis(imageBase64: string): Promise<{
  basic: ReceiptAnalysis;
  junkFees: Awaited<ReturnType<typeof detectJunkFees>>;
  inflation: Awaited<ReturnType<typeof checkInflation>>;
  warranty: Awaited<ReturnType<typeof extractWarrantyInfo>>;
}> {
  // Run all analyses in parallel for efficiency
  const [basic, junkFees, inflation, warranty] = await Promise.all([
    analyzeReceipt(imageBase64),
    detectJunkFees(imageBase64),
    checkInflation(imageBase64),
    extractWarrantyInfo(imageBase64),
  ]);

  return { basic, junkFees, inflation, warranty };
}

/**
 * The Loompa Legal Team - Generate dispute messages for problematic charges
 */
export interface DisputeIssue {
  type: 'junk_fee' | 'double_tip' | 'overcharge' | 'expired_item' | 'hidden_fee';
  itemName: string;
  amount: number;
  reason: string;
}

export interface DisputeMessage {
  subject: string;
  emailBody: string;
  smsBody: string;
  tone: 'polite' | 'firm' | 'formal';
  legalReferences: string[];
  estimatedRefund: number;
}

export async function generateDisputeMessage(
  storeName: string,
  storeAddress: string | null,
  purchaseDate: string | null,
  total: number,
  issues: DisputeIssue[]
): Promise<DisputeMessage> {
  console.log('generateDisputeMessage called', { storeName, issues });
  
  const issuesDescription = issues.map(issue => 
    `- ${issue.type.replace('_', ' ')}: "${issue.itemName}" - $${issue.amount.toFixed(2)} (${issue.reason})`
  ).join('\n');
  
  const totalDisputed = issues.reduce((sum, issue) => sum + issue.amount, 0);

  const systemPrompt = `You are a consumer rights advocate AI that generates polite-but-firm dispute messages for customers who have been overcharged or charged unfair fees.

Your task is to create professional, effective communication that:
1. Is polite but assertive - maintains a friendly tone while being firm about the issue
2. References specific line items and amounts from the receipt
3. Cites relevant consumer protection principles (without making up specific laws)
4. Requests a specific remedy (refund, credit, or correction)
5. Includes a reasonable deadline for response

Willy Wonka Theme Guidelines:
- Add subtle playful touches like "We believe in the magic of fair pricing" or "A golden ticket to customer satisfaction"
- Keep the core message professional while adding whimsical charm
- Reference "sweet deals" or "golden opportunities" naturally

Return JSON with this EXACT structure:
{
  "subject": "Email subject line",
  "emailBody": "Full email text with paragraphs",
  "smsBody": "Shorter SMS version (under 300 characters)",
  "tone": "polite",
  "legalReferences": ["Consumer protection principle 1", "Principle 2"],
  "estimatedRefund": number
}`;

  const userPrompt = `Generate a dispute message for this situation:

Store: ${storeName}
Address: ${storeAddress || 'Not specified'}
Purchase Date: ${purchaseDate || 'Recent purchase'}
Receipt Total: $${total.toFixed(2)}

Issues Found:
${issuesDescription}

Total Amount in Dispute: $${totalDisputed.toFixed(2)}

Create both an email and SMS version requesting a refund. Make it professional yet friendly, with subtle Willy Wonka charm.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  let result = data.candidates[0]?.content?.parts[0]?.text || '';
  
  // Clean markdown if present
  result = result.trim();
  if (result.startsWith('```json')) result = result.slice(7);
  if (result.startsWith('```')) result = result.slice(3);
  if (result.endsWith('```')) result = result.slice(0, -3);
  result = result.trim();

  return JSON.parse(result);
}
