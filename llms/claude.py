import requests
import zlib
import gzip
import io
import re

url = "https://www.blackbox.ai/api/chat"

headers = {
    'Host': 'www.blackbox.ai',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5', 
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Referer': 'https://www.blackbox.ai/chat/rWYgWII?model=claude-sonnet-3.5',
    'Content-Type': 'application/json',
    'Content-Length': '1004',
    'Origin': 'https://www.blackbox.ai',
    'Connection': 'keep-alive',
    'Cookie': 'sessionId=d0eb9123-cd95-4d15-aa46-3c556ec230b1; __Host-authjs.csrf-token=3aee55a4beb7bba5e228b4d4b746ac767bd5eed05e7ef55895f382029c4c32ae%7C588a27ac61353daa65e004071052870830a2e66779605d6d86c7ba34f19294ce; __Secure-authjs.callback-url=https%3A%2F%2Fwww.blackbox.ai%2F; g_state={"i_l":0}; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ydxdrtZNSf0QN2M3.uXW7s5o93kSx27xA8dMleArUGTmTaKHrqaeG2t9-eimEgxfmLRCpKGWmMPMoHawJbj37Arjv0QoH3MB1miYirYBqS6LbTQBw5kMCpA0BEY1RJnnuDLWMPXTpalZuXJkoLv9ZiwdyTPip_gh7L7sQvLnUSF3vqT0r_ZEvDB-NdD8_ENnqZmIjlWHKeJZ577NftC3qOBCczR8z5ZP27vofV6G2AilNC8ySYbNHmUIjb5Ae3NSnNJg8UnqQaZd348x-iALB2QYop5fYZIKmfwd5rDFpEskRDzBk7CTkPCoT31Mv_0ZwvIhpfzrK0TlqwHxS4kb7CFeSUUI3CoymiC-1MI9qUmsQq1kXbckZs6kKMOK83xrmVH8giwjQSKt1oKhpgCbjuX8_ING6stSEjxFuBpEsi5Fcj-5Imn5VMwSiRLfrcZ84rATdQrWgZpUShUg3xzvmQhHJCVuIn0QmJ3giktO7zxTHYjEddi14nBnDBGZ9yqvZzDbKIglwGzW-kBg_A2lCM9I.pTySM__tefUFR97GuPBzvQ',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'DNT': '1',
    'Sec-GPC': '1',
    'Priority': 'u=0'
}

def ai_model(prompt, model="claude-sonnet-3.5"):
    payload = {
        "messages": [
            {
                "id": "rWYgWII", 
                "content": f"{prompt}",
                "role": "user"
            }
        ],
        "id": "rWYgWII",
        "previewToken": None,
        "userId": None,
        "codeModelMode": True,
        "agentMode": {},
        "trendingAgentMode": {},
        "isMicMode": False,
        "userSystemPrompt": None,
        "maxTokens": 1024,
        "playgroundTopP": 0.9,
        "playgroundTemperature": 0.5,
        "isChromeExt": False,
        "githubToken": "",
        "clickedAnswer2": False,
        "clickedAnswer3": False,
        "clickedForceWebSearch": False,
        "visitFromDelta": False,
        "mobileClient": False,
        "userSelectedModel": model,
        "validated": "00f37b34-a166-4efb-bce5-1312d87f2f94",
        "imageGenerationMode": False,
        "webSearchModePrompt": False
    }
    
    try:
        resp = requests.post(url=url, json=payload, headers=headers)
        resp.raise_for_status()

        # Print debugging info
        print("Request Payload:")
        print(payload)
        print("\nResponse Status Code:", resp.status_code)
        print("Response Headers:", resp.headers)
        
        # Get the raw content and decode it properly
        content = resp.content
        text = resp.text
        # Remove binary artifacts and decode
        content = content.replace(b'\x0b\x02\x80', b'')  # Remove leading bytes
        text = text.replace(b'\x0b\x02\x80', b'')
        content = content.replace(b'\x03', b'')  # Remove trailing byte
        text = text.replace(b'\x03', b'')
        content = re.sub(b'[\x00-\x1F\x7F-\xFF]', b'', content)  # Remove control chars and high bytes
        text = re.sub(b'[\x00-\x1F\x7F-\xFF]', b'', text)

        print(text)
        # Decode to text and clean up
        text = content.decode('utf-8', errors='ignore')
        
        # Clean up remaining artifacts
        text = re.sub(r'[kXxhpHP@]', '', text)  # Remove specific artifacts
        text = re.sub(r'☻||♥', '', text)  # Remove special characters
        text = re.sub(r'@.*?\d+.*?\?', '?', text)  # Remove garbage between @ and ?
        text = ' '.join(text.split())  # Normalize whitespace
        
        return text.strip()
        
    except requests.exceptions.RequestException as e:
        return f"Error making request: {str(e)}"
    except Exception as e:
        return f"Error processing response: {str(e)}"

while True:
    print(ai_model(input("Enter your prompt: ")))