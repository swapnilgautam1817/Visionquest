import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { LocalVisionService } from './localVisionService.js';

export class GeminiVisionService {
  static async analyzeImage(filePath, originalFilename = 'frame.jpg', userApiKey = null, userModel = null) {
    const apiKey = userApiKey || config.gemini.apiKey;
    const modelName = userModel || config.gemini.model || 'gemini-2.5-flash';

    // If no API key is provided, transparently utilize OpticGuard Autonomous Edge Engine
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
      console.log('Gemini API key not configured. Using OpticGuard Autonomous Edge Vision (Local).');
      return LocalVisionService.analyzeImage(filePath, originalFilename);
    }

    const startTime = Date.now();
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const imageBuffer = fs.readFileSync(filePath);
      const base64Data = imageBuffer.toString("base64");
      
      let mimeType = 'image/jpeg';
      if (filePath.endsWith('.png')) mimeType = 'image/png';
      else if (filePath.endsWith('.webp')) mimeType = 'image/webp';

      const prompt = `
You are OpticGuard AI, an industrial-grade Automated Visual Intelligence and Real-Time Anomaly Detection System.
Analyze this visual inspection frame with extreme precision. 
Inspect for any defects, micro-cracks, surface flaws, contamination, thermal anomalies, dimensional misalignments, safety gear/PPE violations, or security intrusions.

Respond ONLY with valid JSON following this exact structure:
{
  "status": "PASSED" | "ANOMALY_DETECTED",
  "isAnomaly": boolean,
  "overallConfidence": number (between 0.0 and 1.0),
  "summary": "Detailed technical finding summary of the inspection",
  "detections": [
    {
      "label": "Specific flaw or anomaly name (e.g. Surface Crack, Foreign Object, Void)",
      "category": "Structural Defect" | "Surface Flaw" | "Thermal Anomaly" | "Foreign Contaminant" | "Geometric Deviation" | "Safety Violation" | "Perimeter Intrusion",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "confidence": number (between 0.0 and 1.0),
      "box": {
        "ymin": number (0.0 to 1.0, top bound normalized),
        "xmin": number (0.0 to 1.0, left bound normalized),
        "ymax": number (0.0 to 1.0, bottom bound normalized),
        "xmax": number (0.0 to 1.0, right bound normalized)
      },
      "description": "Specific forensic detail about the anomaly observed",
      "remediation": "Prescriptive corrective action to mitigate the issue"
    }
  ]
}
If the image shows no defect or anomaly, return "status": "PASSED", "isAnomaly": false, and empty "detections": [].
`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const latencyMs = Date.now() - startTime;
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);

      // Add heatmap grid and latency
      const primaryBox = parsed.detections && parsed.detections.length > 0 
        ? parsed.detections[0].box 
        : null;

      const heatmapGrid = LocalVisionService.generateHeatmap(
        parsed.isAnomaly,
        filePath.length,
        primaryBox
      );

      return {
        ...parsed,
        engine: `Google Gemini (${modelName})`,
        processingLatencyMs: latencyMs,
        heatmapGrid
      };

    } catch (err) {
      console.error('Gemini Vision analysis encountered an error:', err.message);
      console.log('Falling back to OpticGuard Autonomous Edge Vision...');
      const fallbackResult = LocalVisionService.analyzeImage(filePath, originalFilename);
      fallbackResult.engine = `Local Fallback (Gemini API error: ${err.message.slice(0, 50)}...)`;
      return fallbackResult;
    }
  }
}

