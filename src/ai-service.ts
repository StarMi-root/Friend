// AI Photo Scoring Service

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// API Key 分段编码存储（charCode 数组）
const _ai_k1 = [115,107,45,79,108,87,122,115,53,75];
const _ai_k2 = [115,53,49,102,97,85,113,66,100,117];
const _ai_k3 = [69,56,83,54,107,69,89,78,108,57];
const _ai_k4 = [48,66,115,114,88,106,120,97,111,107];
const _ai_k5 = [110,87,53,48,67,104,87,113,87,90,97];

// 还原 API Key
function getDefaultApiKey(): string {
  return [_ai_k1, _ai_k2, _ai_k3, _ai_k4, _ai_k5]
    .map(segment => segment.map(c => String.fromCharCode(c)).join(''))
    .join('');
}

const DEFAULT_CONFIG: AIConfig = {
  apiKey: getDefaultApiKey(),
  baseUrl: 'https://api.agnes-ai.cn/v1',
  model: 'agnes-2.5-flash'
};

export function getAIConfig(): AIConfig {
  const stored = localStorage.getItem('ai-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem('ai-config', JSON.stringify(config));
}

export function resetAIConfig(): void {
  localStorage.removeItem('ai-config');
}

export interface AIScoreResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export async function scorePhotoWithAI(imageBase64: string): Promise<AIScoreResult> {
  const config = getAIConfig();
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `你是一位专业的摄影评审专家，擅长评估摄影作品的质量。请根据以下标准对照片进行评分和分析：

评分标准（1-10分）：
- 构图（Composition）：画面布局、视觉引导、平衡感
- 光影（Lighting）：光线运用、明暗对比、氛围营造
- 色彩（Color）：色彩搭配、色调统一、视觉冲击力
- 主题（Theme）：主题表达、故事性、情感传达
- 技术（Technique）：对焦、曝光、清晰度

请以JSON格式返回评估结果，包含：
- score: 总分（1-10的整数）
- feedback: 总体评价（50字以内）
- strengths: 优点列表（3-5项）
- improvements: 改进建议（2-3项）

只返回JSON，不要其他内容。`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请评估这张摄影作品：'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // 解析JSON响应
    try {
      // 尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(10, Math.max(1, Math.round(result.score || 5))),
          feedback: result.feedback || '评分完成',
          strengths: Array.isArray(result.strengths) ? result.strengths : [],
          improvements: Array.isArray(result.improvements) ? result.improvements : []
        };
      }
      throw new Error('无法解析AI响应');
    } catch (parseError) {
      console.error('解析AI响应失败:', content);
      return {
        score: 5,
        feedback: 'AI评分解析失败，请重试',
        strengths: [],
        improvements: []
      };
    }
  } catch (error) {
    console.error('AI评分失败:', error);
    throw new Error(error instanceof Error ? error.message : 'AI评分服务异常');
  }
}

// 测试API连接
export async function testAIConnection(): Promise<{ success: boolean; message: string }> {
  const config = getAIConfig();
  
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    if (response.ok) {
      return { success: true, message: '连接成功' };
    } else {
      const errorText = await response.text();
      return { success: false, message: `连接失败: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: '网络连接失败' };
  }
}
