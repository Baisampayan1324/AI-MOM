# AI MOM Sidebar

This is the fresh baseline extension for AI MOM.

## What it does

- Opens as a Chrome side panel.
- Stores a local backend URL.
- Tests the backend `/health` endpoint.

## Load it in Chrome

1. Open `chrome://extensions/`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select the `extension/` folder.
5. Click the extension icon to open the side panel.

## Local backend

Start the backend before testing the side panel:

```powershell
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
