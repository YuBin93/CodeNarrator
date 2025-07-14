// api/analyze-github.js
// 这是一个 Node.js Serverless Function，用于代理对 GitHub API 和 Gemini API 的调用。

import fetch from 'node-fetch'; // 在 Node.js 环境中使用 fetch

// 从环境变量中获取 Gemini API 密钥
// CRITICAL: 在 Vercel 或其他部署平台上设置 GEMINI_API_KEY 环境变量
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

export default async function handler(req, res) {
  // 确保只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { githubUrl, customDuration, customEmotionalTone, customPacing } = req.body;

  if (!githubUrl) {
    return res.status(400).json({ error: 'GitHub URL is required.' });
  }

  const githubRegex = /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/;
  const match = githubUrl.match(githubRegex);

  if (!match) {
    return res.status(400).json({ error: 'Invalid GitHub URL format. Please use "https://github.com/owner/repo".' });
  }

  const [, owner, repoName] = match;

  try {
    // 1. 从 GitHub API 获取仓库详情
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repository details from GitHub: ${repoResponse.statusText}`);
    }
    const repoData = await repoResponse.json();

    // 2. 从 GitHub 获取 README 内容
    const readmeResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/main/README.md`);
    let readmeContent = '';
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text();
    } else {
      console.warn(`Could not fetch README.md for ${owner}/${repoName}. Status: ${readmeResponse.statusText}`);
      // 如果 README 不存在，可以返回空字符串或提示信息
    }

    // 3. 准备发送给 Gemini API 的 Prompt
    const prompt = `You are CodeNarrator AI. Your task is to analyze a GitHub project and generate a structured analysis report and a video script for a technical trailer.

Project Name: ${repoName}
Project Description: ${repoData.description || 'No description provided.'}
Stars: ${repoData.stargazers_count}
Forks: ${repoData.forks_count}
Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}

README Content:
\`\`\`
${readmeContent}
\`\`\`

Based on the above information, please provide:
1.  **Project Analysis:**
    * **goal:** The main objective or purpose of the project.
    * **pain_points:** Key problems or challenges the project aims to solve.
    * **solution:** How the project addresses these pain points.
    * **key_features:** Main functionalities or highlights.
    * **tech_stack:** Primary technologies used.
    * **target_audience:** Who the project is for.
    * **market_position:** How it stands in the market (e.g., innovative, niche, established).
    * **competitive_advantage:** What makes it unique or better than alternatives.
    * **complexity_level:** (e.g., "Beginner", "Intermediate", "Advanced")
    * **confidence_score:** A confidence score (0-100) for your analysis.
2.  **Video Script (for a ${customDuration}-second technical trailer):**
    * **title:** Catchy title for the video.
    * **hook:** An engaging opening line to grab attention.
    * **problem:** A concise description of the problem the project solves.
    * **solution:** A clear explanation of the project's solution.
    * **demo:** A brief description of what would be shown in a demo.
    * **call_to_action:** What viewers should do next.
    * **duration:** Total video duration in seconds (e.g., ${customDuration}).
    * **emotional_tone:** "${customEmotionalTone}"
    * **pacing:** "${customPacing}"
    * **scenes:** An array of scene objects, each with:
        * **type:** (e.g., "hook", "problem", "solution", "demo", "cta")
        * **duration:** Duration of the scene in seconds.
        * **visual:** A brief description of the visual content for the scene.

Ensure the response is a single JSON object adhering to the schema provided in the generationConfig. The video script should be compelling and easy to understand for a general audience, making complex technical concepts accessible.
`;

    // 4. 调用 Gemini API
    const chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = {
        contents: chatHistory,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    analysisResult: {
                        type: "OBJECT",
                        properties: {
                            goal: { "type": "STRING" },
                            pain_points: {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            solution: { "type": "STRING" },
                            key_features: {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            tech_stack: {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            target_audience: { "type": "STRING" },
                            market_position: { "type": "STRING" },
                            competitive_advantage: { "type": "STRING" },
                            complexity_level: { "type": "STRING" },
                            confidence_score: { "type": "NUMBER" }
                        },
                        required: ["goal", "pain_points", "solution", "key_features", "tech_stack", "target_audience", "market_position", "competitive_advantage", "complexity_level", "confidence_score"]
                    },
                    generatedScript: {
                        type: "OBJECT",
                        properties: {
                            title: { "type": "STRING" },
                            hook: { "type": "STRING" },
                            problem: { "type": "STRING" },
                            solution: { "type": "STRING" },
                            demo: { "type": "STRING" },
                            call_to_action: { "type": "STRING" },
                            duration: { "type": "NUMBER" },
                            emotional_tone: { "type": "STRING" },
                            pacing: { "type": "STRING" },
                            scenes: {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "type": { "type": "STRING" },
                                        "duration": { "type": "NUMBER" },
                                        "visual": { "type": "STRING" }
                                    },
                                    "required": ["type", "duration", "visual"]
                                }
                            }
                        },
                        required: ["title", "hook", "problem", "solution", "demo", "call_to_action", "duration", "emotional_tone", "pacing", "scenes"]
                    }
                },
                required: ["analysisResult", "generatedScript"]
            }
        }
    };

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const aiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const aiResult = await aiResponse.json();

    if (aiResult.candidates && aiResult.candidates.length > 0 &&
        aiResult.candidates[0].content && aiResult.candidates[0].content.parts &&
        aiResult.candidates[0].content.parts.length > 0) {
        const jsonText = aiResult.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);

        // 合并 GitHub API 获取的统计数据与 AI 生成的分析结果
        const finalAnalysisResult = {
            ...parsedJson.analysisResult,
            stats: {
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                contributors: repoData.subscribers_count, // GitHub API 不直接提供贡献者数量，此处使用订阅者作为代理
                commits: 234, // 此处仍为模拟数据，需要更复杂的 GitHub API 调用获取
                languages: Object.keys(repoData.language || {}), // 获取主要语言
                lastUpdate: new Date(repoData.updated_at).toLocaleDateString(),
                readme: readmeContent.substring(0, Math.min(readmeContent.length, 200)) + (readmeContent.length > 200 ? '...' : '')
            }
        };

        // 返回成功响应给前端
        res.status(200).json({
          analysisResult: finalAnalysisResult,
          generatedScript: parsedJson.generatedScript
        });

    } else {
        throw new Error("AI did not return a valid structured response.");
    }

  } catch (err) {
    console.error("Backend analysis error:", err);
    res.status(500).json({ error: `Analysis failed: ${err.message}. Please check the URL and try again.` });
  }
}
