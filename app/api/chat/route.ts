import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Check if Google API key is available
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (googleApiKey) {
      // Use Google Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `你是一个有益的习惯追踪教练。根据用户的习惯和情绪数据提供个性化建议。保持鼓励、实用和简洁。回复使用中文，字数控制在300字以内。

用户消息: ${message}

请提供有用的建议。`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google API error:', errorText);

        // Check if it's a quota error
        if (errorText.includes('429') || errorText.includes('RESOURCE_EXHAUSTED')) {
          return NextResponse.json({
            message: getFallbackResponse(message),
            fallback: true,
          });
        }

        throw new Error('Google API request failed');
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(message);

      return NextResponse.json({
        message: responseText,
      });
    }

    // Fallback responses when no API key
    const responseText = getFallbackResponse(message);
    return NextResponse.json({
      message: responseText,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      message: "抱歉，我遇到了一些问题。请稍后再试。",
      error: true,
    }, { status: 500 });
  }
}

function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('streak') || lowerMsg.includes('连续')) {
    return "连续记录天数是坚持的好指标！保持连续记录的关键是如果错过一天不要对自己太苛刻。专注于回到正轨，而不是追求完美。你想改进哪个习惯的连续记录？";
  }

  if (lowerMsg.includes('habit') || lowerMsg.includes('习惯')) {
    return "养成习惯是从小处开始并保持一致。我建议：\n\n1. 刚开始只专注于 1-2 个习惯\n2. 让习惯小到不可能失败\n3. 将它们与现有习惯叠加\n4. 庆祝小小的胜利\n\n你正在培养哪些习惯？";
  }

  if (lowerMsg.includes('mood') || lowerMsg.includes('情绪') || lowerMsg.includes('心情')) {
    return "与习惯一起追踪你的情绪有助于了解模式。注意哪些活动能提升你的情绪，哪些会消耗你。这种意识有助于你在一天中做出更好的选择。";
  }

  if (lowerMsg.includes('tip') || lowerMsg.includes('help') || lowerMsg.includes('建议') || lowerMsg.includes('帮助')) {
    return "这里是一些经过验证的习惯技巧：\n\n• 2分钟法则：让习惯开始时间少于2分钟\n• 实施意图：'当[情况]时，我将[习惯]'\n• 环境设计：让好习惯容易养成，坏习惯难以保持\n• 可视化追踪：在日历上标记完成的天数\n\n需要我详细说明其中任何一个吗？";
  }

  if (lowerMsg.includes('thank') || lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
    return "不客气！记住，养成更好的习惯是一段旅程，而不是终点。每一天你尝试都是胜利。继续加油！";
  }

  return "这是一个很好的问题！为了给你个性化的见解，我建议你持续在应用中记录你的习惯和情绪。随着时间的推移，我可以帮助识别模式并提供量身定制的建议。你想了解习惯养成的哪个具体方面？";
}
