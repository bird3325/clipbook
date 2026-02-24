
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SummaryMode, Clipping, AIModel } from "../types";

export const generateAIContent = async (
  mode: SummaryMode,
  clippings: Clipping[],
  customInstruction: string = "",
  apiKey: string,
  model: AIModel,
  interference: number = 50
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 설정에서 API Key를 입력해주세요.");
  }

  // Use the requested model directly
  const effectiveModel = model as string;
  console.log(`[AI Logic] Using model: ${effectiveModel}`);

  // 텍스트 조합 (출처 및 시간 정보 포함) - 레거시/비멀티모달용
  const textContentToAnalyze = clippings.map(c =>
    `[발췌 원문]: ${c.text}\n[출처]: ${c.sourceUrl}\n[수집 시각]: ${new Date(c.timestamp).toLocaleString()}`
  ).join("\n\n---\n\n");

  // 모드별 시스템 프롬프트
  const inputSystemInstruction = getSystemInstruction(mode);

  // 사용자 프롬프트 구성
  const userPromptPrefix = `
    다음은 사용자가 웹에서 수집한 데이터(텍스트 및 이미지) 조각들입니다.
  `;

  const userPromptSuffix = `
    ---------------------------------------------------
    
    [AI 간섭 설정 (AI Interference Level)]
    Level: ${interference}%
    지침: ${interference === 0
      ? "제공된 원문의 단어와 문장 구조를 최대한 유지하고 새로운 내용을 절대 추가하지 마세요. 수집된 이미지가 있다면 그 내용을 텍스트로 아주 객관적으로만 설명하세요."
      : interference <= 30
        ? "원문의 핵심 내용을 중심으로 아주 정교하고 보수적으로 요약하세요. 이미지는 필요한 경우에만 최소한으로 언급하세요."
        : interference <= 60
          ? "내용의 본질을 유지하되, 문맥을 위해 자연스러운 문장 재구성을 허용합니다. 이미지 정보를 텍스트와 유기적으로 결합하세요."
          : interference <= 85
            ? "주어진 정보를 바탕으로 풍성한 설명과 창의적인 통찰을 포함하여 작성하세요. 이미지의 시각적 요소가 주는 함축적 의미까지 분석에 포함하세요."
            : "원문을 영감의 원천으로 삼아 매우 창의적이고 대담하게 재구성하고 확장하세요. 이미지와 텍스트를 넘나드는 새로운 시각적/언어적 구성을 제안하세요."
    }

    [이미지 삽입 및 분석 지침]
    - 수집된 이미지는 분석의 핵심 근거로 활용하세요.
    - 내용 전개상 이미지가 들어가는 것이 효과적인 위치에 [IMAGE_ID: 해당이미지ID] 형식의 태그를 삽입하세요.
    - 예: "제품의 외형은 다음과 같습니다. [IMAGE_ID: 1729837492]"
    - 모든 이미지를 다 넣을 필요는 없으며, 맥락상 중요한 것 위주로 배치하세요.

    [사용자 추가 지시사항]
    ${customInstruction ? customInstruction : "특별한 추가 지시는 없습니다. 위 설정된 페르소나와 형식에 충실해 주세요."}
    
    위 내용을 바탕으로 선택된 모드(${mode})의 형식에 맞춰 한국어로 답변해 주세요.
  `;

  try {
    if (effectiveModel.startsWith('gemini')) {
      // Gemini 멀티모달 처리
      const parts: any[] = [{ text: inputSystemInstruction + "\n\n" + userPromptPrefix }];

      clippings.forEach(c => {
        if (c.type === 'image' && c.imageData) {
          const base64Data = c.imageData.split(',')[1];
          const mimeType = c.imageData.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
          parts.push({ text: `[이미지 정보]\nID: ${c.id}\n출처: ${c.sourceUrl}\n수집 시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
        } else {
          parts.push({ text: `[발췌 원문]\nID: ${c.id}\n내용: ${c.text}\n출처: ${c.sourceUrl}\n수집 시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
        }
      });

      parts.push({ text: userPromptSuffix });

      return await generateGeminiContentMultimodal(apiKey, effectiveModel, parts);
    } else if (effectiveModel.startsWith('gpt')) {
      return await generateOpenAIContentMultimodal(apiKey, effectiveModel, inputSystemInstruction, userPromptPrefix, clippings, userPromptSuffix);
    } else if (effectiveModel.startsWith('claude')) {
      return await generateClaudeContentMultimodal(apiKey, effectiveModel, inputSystemInstruction, userPromptPrefix, clippings, userPromptSuffix);
    } else {
      throw new Error("지원하지 않는 모델입니다.");
    }
  } catch (error) {
    console.error("AI Generation Error:", error);

    // 할당량 초과(429) 에러 처리
    const errorMsg = String(error);
    if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('quota')) {
      throw new Error("API 할당량을 모두 소모했거나 사용이 일시적으로 제한되었습니다. 잠시 후 다시 시도하거나 API 키 상태를 확인해주세요.");
    }

    throw new Error(`AI 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : errorMsg}`);
  }
};

const getSystemInstruction = (mode: SummaryMode): string => {
  const instructions = {
    [SummaryMode.REPORT]: `
      당신은 전문 리서치 분석가입니다. 제공된 텍스트들을 바탕으로 공식 보고서 초안을 작성하세요.
      [필수 형식]
      1. 제목: (핵심 내용을 관통하는 제목)
      2. 배경: (이 주제가 왜 중요한지, 문맥 설명)
      3. 주요 내용/문제: (발췌된 텍스트의 핵심 분석)
      4. 해결방향/제언: (내용에 기반한 통찰)
      5. 결론: (한 줄 요약)
      6. 참고자료: (원본 링크 목록)
      톤앤매너: 객관적, 분석적, 전문적.
    `,
    [SummaryMode.EMAIL]: `
      당신은 비즈니스 커뮤니케이션 전문가입니다. 제공된 텍스트들을 바탕으로 업무용 이메일 초안을 작성하세요.
      [필수 형식]
      1. 제목: (수신자가 클릭하고 싶은 명확한 제목)
      2. 도입부: (정중한 인사 및 메일 목적)
      3. 핵심 요약: (발췌 내용의 요점 정리 - 글머리 기호 사용)
      4. 요청/제안 사항: (명확한 Action Item)
      5. 맺음말: (추후 일정 언급 및 정중한 마무리)
      톤앤매너: 정중함, 명료함, 비즈니스 격식.
    `,
    [SummaryMode.NOTION]: `
      당신은 지식 관리(PKM) 전문가입니다. 제공된 텍스트를 노션(Notion)에 저장하기 좋은 구조화된 노트로 변환하세요.
      [필수 형식 - 마크다운]
      # (직관적인 제목)
      ## 💡 핵심 인사이트
      (내용의 본질적인 의미나 통찰 1-2문장)
      ## 📝 상세 요약
      - (주요 포인트 1)
      - (주요 포인트 2)
      ## ✅ Action Item / 적용점
      - [ ] (실천 가능한 항목 1)
      > [출처 및 태그]
      > #태그1 #태그2
      톤앤매너: 직관적, 구조적, 핵심 위주.
    `,
    [SummaryMode.CARD]: `
      당신은 콘텐츠 큐레이터입니다. 소셜 미디어(LinkedIn, Twitter)나 카드 뉴스에 적합한 형태로 요약하세요.
      [필수 형식]
      1. 캐치프레이즈 (시선을 끄는 한 문장)
      2. 3줄 요약 (이모지 활용)
      3. 원문 링크
      톤앤매너: 트렌디, 간결함, 이모지 적절히 사용.
    `
  };
  return instructions[mode];
};

// Gemini Implementation
const generateGeminiContentMultimodal = async (apiKey: string, model: string, parts: any[]): Promise<string> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({ model: model });

  const result = await generativeModel.generateContent(parts);
  const response = await result.response;
  return response.text();
};

// OpenAI Multimodal Implementation
const generateOpenAIContentMultimodal = async (apiKey: string, model: string, systemInstruction: string, prefix: string, clippings: Clipping[], suffix: string): Promise<string> => {
  const messages: any[] = [
    { role: "system", content: systemInstruction }
  ];

  const userContent: any[] = [{ type: "text", text: prefix }];

  clippings.forEach(c => {
    if (c.type === 'image' && c.imageData) {
      userContent.push({
        type: "image_url",
        image_url: { url: c.imageData }
      });
      userContent.push({ type: "text", text: `[수집된 이미지 ID: ${c.id}]\n출처: ${c.sourceUrl}\n시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
    } else {
      userContent.push({ type: "text", text: `[수집된 텍스트 ID: ${c.id}]\n내용: ${c.text}\n출처: ${c.sourceUrl}\n시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
    }
  });

  userContent.push({ type: "text", text: suffix });
  messages.push({ role: "user", content: userContent });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "내용을 생성하지 못했습니다.";
};

// Anthropic Multimodal Implementation
const generateClaudeContentMultimodal = async (apiKey: string, model: string, systemInstruction: string, prefix: string, clippings: Clipping[], suffix: string): Promise<string> => {
  const messages: any[] = [];
  const content: any[] = [{ type: "text", text: prefix }];

  clippings.forEach(c => {
    if (c.type === 'image' && c.imageData) {
      const base64Data = c.imageData.split(',')[1];
      const mimeType = c.imageData.split(';')[0].split(':')[1];
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64Data
        }
      });
      content.push({ type: "text", text: `[수집된 이미지 ID: ${c.id}]\n출처: ${c.sourceUrl}\n시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
    } else {
      content.push({ type: "text", text: `[수집된 텍스트 ID: ${c.id}]\n내용: ${c.text}\n출처: ${c.sourceUrl}\n시각: ${new Date(c.timestamp).toLocaleString()}\n\n` });
    }
  });

  content.push({ type: "text", text: suffix });
  messages.push({ role: "user", content: content });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      system: systemInstruction,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "내용을 생성하지 못했습니다.";
};

// Legacy single-text implementation can be kept or removed if not used. (Keeping it simple for now)
const generateOpenAIContent = async (apiKey: string, _model: string, _system: string, _prompt: string) => { return ""; };
const generateClaudeContent = async (apiKey: string, _model: string, _system: string, _prompt: string) => { return ""; };
