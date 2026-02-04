// DeepSeek API 封装

import { getSettings } from './storage';

export interface TranslateRequest {
  content: string;
  targetLang?: 'en' | 'zh';
}

export interface TranslateResponse {
  translated: string;
  error?: string;
}

export async function translateText(request: TranslateRequest): Promise<TranslateResponse> {
  const settings = await getSettings();
  
  if (!settings.apiKey) {
    return { translated: '', error: '请先设置 DeepSeek API Key' };
  }

  const targetLang = request.targetLang || 'en';
  const systemPrompt = targetLang === 'en' 
    ? settings.translatePrompt 
    : '你是一个专业的翻译助手，请将以下内容翻译为中文，保持原有的格式和含义：';

  try {
    const response = await fetch(`${settings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.content },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    
    if (!translated) {
      throw new Error('翻译结果为空');
    }

    return { translated };
  } catch (error) {
    console.error('Translation error:', error);
    return { 
      translated: '', 
      error: error instanceof Error ? error.message : '翻译失败' 
    };
  }
}

export async function polishText(content: string): Promise<TranslateResponse> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    return { translated: '', error: '请先设置 DeepSeek API Key' };
  }

  const polishPrompt = settings.polishPrompt || '请润色以下文本，使其更加专业、流畅和清晰：';

  try {
    const response = await fetch(`${settings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: polishPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const polished = data.choices?.[0]?.message?.content?.trim();

    if (!polished) {
      throw new Error('润色结果为空');
    }

    return { translated: polished };
  } catch (error) {
    console.error('Polish error:', error);
    return {
      translated: '',
      error: error instanceof Error ? error.message : '润色失败'
    };
  }
}

export async function customProcess(content: string): Promise<TranslateResponse> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    return { translated: '', error: '请先设置 DeepSeek API Key' };
  }

  if (!settings.customPrompt) {
    return { translated: '', error: '请先在设置中配置自定义提示词' };
  }

  try {
    const response = await fetch(`${settings.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: settings.customPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (!result) {
      throw new Error('处理结果为空');
    }

    return { translated: result };
  } catch (error) {
    console.error('Custom process error:', error);
    return {
      translated: '',
      error: error instanceof Error ? error.message : '处理失败'
    };
  }
}

// 验证 API Key 是否有效
export async function validateApiKey(apiKey: string, baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
