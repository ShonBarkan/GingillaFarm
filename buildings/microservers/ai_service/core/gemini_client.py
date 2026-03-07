import google.generativeai as genai
import os
import json
from typing import Optional, Dict, Any


class GeminiOwl:
    def __init__(self):
        # API Key should be in your root .env
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_name = 'gemini-1.5-pro'

    async def get_response(self, prompt: str, as_json: bool = False, schema: Optional[Dict] = None):
        # Set up generation config
        config = {}
        if as_json:
            config["response_mime_type"] = "application/json"
            if schema:
                # If a schema is provided, we pass it to Gemini
                config["response_schema"] = schema

        model = genai.GenerativeModel(self.model_name)
        response = model.generate_content(prompt, generation_config=config)

        # Extract content
        content = response.text
        if as_json:
            try:
                content = json.loads(response.text)
            except json.JSONDecodeError:
                content = {"error": "Failed to parse AI response as JSON", "raw": response.text}

        # Token metrics
        usage = {
            "prompt_tokens": response.usage_metadata.prompt_token_count,
            "candidates_tokens": response.usage_metadata.candidates_token_count,
            "total_tokens": response.usage_metadata.total_token_count
        }

        return content, usage