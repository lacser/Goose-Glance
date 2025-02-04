const schemaUrl = chrome.runtime.getURL('schemas/schema_all.json');
const llmConfigUrl = chrome.runtime.getURL('schemas/llm_config.json');

const schemaPromise = fetch(schemaUrl).then(res => res.json());
const llmConfigPromise = fetch(llmConfigUrl).then(res => res.json());

// Function to analyze job description using OpenAI API and return structured output according to predefined schema
export async function analyzeJobDescription(description) {
  try {
    // Retrieve API key from Chrome storage
    const apiKey = await new Promise((resolve) => {
      chrome.storage.sync.get(['openaiApiKey'], function(result) {
        resolve(result.openaiApiKey);
      });
    });

    if (!apiKey) {
      throw new Error('No API key found. Please set your OpenAI API key in the extension settings.');
    }

    const schema = await schemaPromise;
    const llmConfig = await llmConfigPromise;
    // Configure the request body using imported configuration and schema
    const requestBody = {
      model: llmConfig.model_config.model,
      temperature: llmConfig.model_config.temperature,
      max_tokens: llmConfig.model_config.max_tokens,
      top_p: llmConfig.model_config.top_p,
      frequency_penalty: llmConfig.model_config.frequency_penalty,
      presence_penalty: llmConfig.model_config.presence_penalty,
      messages: [
        {
          role: "system",
          content: llmConfig.system_message
        },
        {
          role: "user",
          content: `Job description: ${description}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schema.name,
          schema: schema.schema,
          strict: schema.strict
        }
      },
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI API');
    }

    const data = await response.json();
    const message = data.choices[0].message;

    try {
      const parsedOutput = JSON.parse(message.content);
      return parsedOutput;
    } catch (error) {
      throw new Error("Failed to parse structured output: " + error.message);
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
