import requests

url = 'http://127.0.0.1:8000/upload/upload'

headers = {
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryQjWyYj0iQgWQsytm',
    'Origin': 'http://localhost:5173',
    'Referer': 'http://localhost:5173/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36 Edg/147.0.0.0',
    'sec-ch-ua': '"Microsoft Edge";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"'
}

data = '------WebKitFormBoundaryQjWyYj0iQgWQsytm\r\nContent-Disposition: form-data; name="files"; filename="ARYA_RESUME (1).docx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n\r\n------WebKitFormBoundaryQjWyYj0iQgWQsytm--\r\n'

response = requests.post(url, headers=headers, data=data)

print(response.status_code)
print(response.text)