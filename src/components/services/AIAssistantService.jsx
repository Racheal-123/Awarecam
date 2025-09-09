import { invokeLLM } from '@/api/integrations';
import { Event } from '@/api/entities';
import { Task } from '@/api/entities';
import { createPageUrl } from '@/utils';

// --- RAG Orchestration Service for the AI Assistant ---

// This object maps entities to their corresponding SDK objects for dynamic querying.
// This is the key to making the system extensible.
const ENTITY_MAP = {
  Event: Event,
  Task: Task,
};

// Main function to process a user's message using the RAG pipeline.
async function sendMessage(userId, organizationId, locationId, isAllLocations, prompt) {
  try {
    // 1. Generate a structured query from the user's natural language prompt.
    const structuredQuery = await generateStructuredQuery(prompt, isAllLocations);

    if (structuredQuery.error) {
      return { message: structuredQuery.clarification_needed, error: true };
    }

    if (!ENTITY_MAP[structuredQuery.entity]) {
      return { message: "I can only search for 'Events' or 'Tasks' right now.", error: true };
    }

    // 2. Execute the structured query against the database, ensuring security scopes.
    const queryResults = await executeSecureQuery(
      structuredQuery,
      organizationId,
      locationId,
      isAllLocations
    );

    // 3. Generate a final, user-friendly response based on the query results.
    const finalResponse = await generateFinalResponse(prompt, queryResults, structuredQuery.view_more_url);

    return { message: finalResponse, error: false };

  } catch (error) {
    console.error("RAG Pipeline Error in AIAssistantService:", error);
    return {
      message: "I encountered an error trying to understand or find that information. Please try rephrasing your question.",
      error: true,
    };
  }
}

// LLM Call #1: Convert natural language to a structured JSON query object.
async function generateStructuredQuery(prompt, isAllLocations) {
  const schema = {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        enum: ['Event', 'Task'],
        description: 'The type of data the user is asking about.',
      },
      filters: {
        type: 'object',
        description: 'Key-value pairs for filtering. Dates should be in ISO 8601 format. Use MongoDB-style operators like $gte, $lte for date ranges.',
        properties: {
            event_type: { type: 'string' },
            status: { type: 'string' },
            severity: { type: 'string' },
            created_date: { type: 'object' },
            due_date: { type: 'object' },
        }
      },
      operation: {
        type: 'string',
        enum: ['list', 'count', 'summarize'],
        description: 'The operation to perform: list items, count items, or summarize results.',
      },
      view_more_url: {
        type: 'string',
        description: `Generate a relative URL for a "View More" link based on the user's query. Example: for "unacknowledged safety events", generate "/Events?status=new&event_type=safety_violation". Include a location parameter if the user specifies one. Current date is ${new Date().toISOString()}`
      },
      error: {
        type: 'string',
        enum: ['ambiguous', 'unsupported'],
        description: 'Set this if the query is too vague or cannot be answered.'
      },
      clarification_needed: {
          type: 'string',
          description: 'If the query is ambiguous, ask a clarifying question here.'
      }
    },
    required: ['entity'],
  };

  const llmPrompt = `
    You are a data query generator. Based on the user's question, create a structured JSON object to query a database.
    User Question: "${prompt}"
    
    Instructions:
    - Today's date is ${new Date().toISOString()}. Calculate date ranges accordingly (e.g., "last week").
    - For date ranges, use ISO 8601 format with $gte (greater than or equal) and $lte (less than or equal) operators.
    - If the user's request is unclear or too broad, set the 'error' and 'clarification_needed' fields.
    - If you can answer the question, do not set the 'error' field.
    - ALWAYS generate a relevant 'view_more_url' that corresponds to the filters.
  `;

  return await invokeLLM({
    prompt: llmPrompt,
    response_json_schema: schema,
  });
}

// Execute the query against the database, injecting security/scoping filters.
async function executeSecureQuery(query, organizationId, locationId, isAllLocations) {
  const Entity = ENTITY_MAP[query.entity];
  
  // CRITICAL: Inject security and context filters.
  const secureFilters = {
    ...query.filters,
    organization_id: organizationId,
  };

  // Only add location_id filter if a specific location is selected.
  if (!isAllLocations && locationId) {
    secureFilters.location_id = locationId;
  }

  let results;
  const limit = query.operation === 'list' ? 10 : 100; // Get more for summaries

  const data = await Entity.filter(secureFilters, '-created_date', limit);

  if (query.operation === 'count') {
    results = { count: data.length };
  } else {
    // For list/summarize, return the actual data.
    // We can add more specific summarization logic here later.
    results = data;
  }
  
  return results;
}

// LLM Call #2: Generate a natural language response from the query results.
async function generateFinalResponse(originalPrompt, results, viewMoreUrl) {
  const dataSummary = JSON.stringify(results, null, 2);

  const llmPrompt = `
    You are a helpful AI assistant for a security platform called AwareCam.
    A user asked: "${originalPrompt}"

    Based on the following data, provide a friendly and concise answer.
    Data:
    ${dataSummary}

    Instructions:
    - If the data is empty or the count is 0, state that no results were found and suggest a different search.
    - If there is data, summarize it clearly. Mention the count if available.
    - For lists, you can mention the first few items.
    - At the end of your response, if a "View More" link should be shown, include the following EXACT markdown: [View Details](${viewMoreUrl})
    - Do not make up information. Base your answer ONLY on the provided data.
  `;

  return await invokeLLM({ prompt: llmPrompt });
}

// Initialize conversation session with context
async function initializeSession(userId, organizationId, pageContext) {
  try {
    // Create or update conversation context
    const sessionContext = {
      userId,
      organizationId,
      pageContext,
      initialized: true,
      timestamp: new Date().toISOString()
    };

    // For onboarding context, we don't need to create a conversation record
    // The onboarding wizard manages its own conversation state
    if (pageContext.page === 'Onboarding') {
      return sessionContext;
    }

    // For other contexts, you could create/update AIConversation records
    return sessionContext;
  } catch (error) {
    console.error('Failed to initialize AI session:', error);
    throw error;
  }
}

// Get conversation history for regular chat contexts
async function getConversationHistory(userId, organizationId) {
  try {
    // This would load from AIConversation entity for regular chat
    // For onboarding, return empty array as it manages its own state
    return [];
  } catch (error) {
    console.error('Failed to load conversation history:', error);
    return [];
  }
}

// Process onboarding-specific messages
async function processOnboardingMessage(userId, organizationId, message, context) {
  try {
    const prompt = `
You are an onboarding assistant for AwareCam helping users set up their video intelligence platform.

Current context: ${JSON.stringify(context)}
User message: "${message}"

Generate a helpful, conversational response that guides the user through their onboarding step.
Keep responses friendly, informative, and under 150 words.
Use emojis appropriately and maintain a professional but approachable tone.
`;

    const response = await invokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          suggestions: { type: 'array', items: { type: 'string' } },
          error: { type: 'boolean' }
        },
        required: ['message']
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to process onboarding message:', error);
    return {
      message: "I'm having trouble right now. You can continue with the setup process, or try asking me again in a moment.",
      error: true
    };
  }
}

// Export all functions as a default object
const aiAssistantService = {
  initializeSession,
  getConversationHistory,
  sendMessage,
  processOnboardingMessage
};

export default aiAssistantService;