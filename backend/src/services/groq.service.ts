require('dotenv').config();

const groqApiKey = process.env.GROQ_API_KEY;

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
  
  // Adicionar verificação antes de acessar data.choices[0]
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Resposta inválida da API Groq');
  }
  
  return data.choices[0].message.content;
}

// Função para conversar com IA sobre diagnósticos
export async function conversarComIA(mensagens: any[], contextoDiagnostico = '') {
  try {
    // Preparar contexto do diagnóstico
    const contextoPrompt = contextoDiagnostico ? 
      `Contexto do diagnóstico: ${contextoDiagnostico}\n\n` : '';

    // Usar apenas as mensagens recebidas do controller, que já incluem o prompt de sistema correto
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