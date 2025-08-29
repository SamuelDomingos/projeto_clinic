require('dotenv').config();

const groqApiKey = process.env.GROQ_API_KEY;

// Cache para rate limiting
const apiCallCache = new Map();
const rateLimitTracker = {
  calls: 0,
  resetTime: Date.now() + 60000 // Reset a cada minuto
};

// Função para gerar questionário
export async function gerarQuestionarioIA(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Resposta inválida da API Groq');
  }
  
  return data.choices[0].message.content;
}

// Função para conversar com IA sobre diagnósticos
export async function conversarComIA(mensagens: any[], contextoDiagnostico = '') {
  try {
    const contextoPrompt = contextoDiagnostico ? 
      `Contexto do diagnóstico: ${contextoDiagnostico}\n\n` : '';

    const messagesForAI = mensagens;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesForAI,
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da API Groq');
    }

    return {
      success: true,
      content: data.choices[0].message.content,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Erro ao conversar com IA:', error);
    return {
      success: false,
      content: 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente.',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// NOVA FUNÇÃO: IA Inteligente com Rate Limiting e Cache
export async function conversarComIAInteligente(prompt: string, context: any = {}): Promise<any> {
  try {
    // Verifica rate limiting
    if (Date.now() > rateLimitTracker.resetTime) {
      rateLimitTracker.calls = 0;
      rateLimitTracker.resetTime = Date.now() + 60000;
    }

    if (rateLimitTracker.calls >= 50) { // Limite conservador
      return {
        success: false,
        content: null,
        error: 'Rate limit atingido. Aguarde um momento.',
        useCache: true
      };
    }

    // Verifica cache
    const cacheKey = `ai_${Buffer.from(prompt).toString('base64').substring(0, 50)}`;
    if (apiCallCache.has(cacheKey)) {
      const cached = apiCallCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutos
        return {
          success: true,
          content: cached.content,
          fromCache: true
        };
      }
    }

    rateLimitTracker.calls++;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Você é uma IA especializada em análise de banco de dados. Contexto disponível: ${JSON.stringify(context, null, 2)}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          content: null,
          error: 'Rate limit da API. Usando fallback inteligente.',
          useIntelligentFallback: true
        };
      }
      throw new Error(`Erro na API Groq: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Salva no cache
    apiCallCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      content: null,
      error: error.message,
      useIntelligentFallback: true
    };
  }
}

// Função para JSON com fallback inteligente
export async function conversarComIAParaJSON(prompt: string, context: any = {}): Promise<any> {
  const result = await conversarComIAInteligente(prompt, context);
  
  if (!result.success && result.useIntelligentFallback) {
    // Fallback inteligente quando a API falha
    return {
      success: true,
      content: generateIntelligentFallback(prompt, context),
      fromFallback: true
    };
  }
  
  return result;
}

// Fallback inteligente baseado em padrões
function generateIntelligentFallback(prompt: string, context: any): string {
  const promptLower = prompt.toLowerCase();
  
  // Detecta tipo de consulta
  let entity = 'patients';
  let operation = 'find';
  let conditions = {};
  
  // Análise inteligente da pergunta
  if (promptLower.includes('paciente') || promptLower.includes('patient')) {
    entity = 'patients';
  } else if (promptLower.includes('produto') || promptLower.includes('product')) {
    entity = 'products';
  } else if (promptLower.includes('agendamento') || promptLower.includes('appointment')) {
    entity = 'appointments';
  } else if (promptLower.includes('usuário') || promptLower.includes('user')) {
    entity = 'users';
  }
  
  // Detecta condições
  const nameMatch = promptLower.match(/nome.*?([a-zA-Z]+)/);
  if (nameMatch && nameMatch[1]) {
    conditions = { name: { contains: nameMatch[1] } };
  }
  
  // Detecta filtros de data
  if (promptLower.includes('hoje') || promptLower.includes('today')) {
    const today = new Date().toISOString().split('T')[0];
    conditions = { ...conditions, createdAt: { gte: today } };
  }
  
  return JSON.stringify({
    interpretation: `Consulta automática para ${entity} (fallback inteligente)`,
    query: {
      module: entity,
      entity: entity,
      operation: operation,
      conditions: conditions,
      orderBy: { createdAt: 'desc' },
      limit: 100
    },
    explanation: `Query gerada por fallback inteligente baseada na análise da pergunta`,
    confidence: 0.7
  });
}