# Pexels API Setup

To enable AI-suggested images for petitions, you need to configure the Pexels API.

## Steps to Get Your Pexels API Key

1. **Create a Pexels Account**
   - Go to [https://www.pexels.com](https://www.pexels.com)
   - Click "Join" and create a free account

2. **Access the API**
   - Visit [https://www.pexels.com/api/](https://www.pexels.com/api/)
   - Click "Get Started" or "Your API Key"

3. **Generate Your API Key**
   - Once logged in, you'll see your API key on the API page
   - Copy this key

4. **Add to Your Environment**
   - Open your `.env` file
   - Replace `your_pexels_api_key_here` with your actual API key:
   ```
   PEXELS_API_KEY=your_actual_api_key_here
   ```

5. **Restart Your Development Server**
   - Stop and restart `npm run dev` for the changes to take effect

## Testing

1. Create a new petition
2. In the "Petition Image" section, click "Get AI Suggested Images"
3. You should see 5 relevant images based on your petition topic

## Troubleshooting

- If you see an error about the API key not being configured, make sure you've:
  - Added the key to `.env` (not `.env.example`)
  - Restarted your development server
  - Used your actual API key, not the placeholder text

- If no images appear:
  - Check the browser console for error messages
  - Verify your API key is valid on the Pexels API dashboard
  - Try a different search term

## Alternative: Custom Image URLs

If you prefer not to use the Pexels API, you can always:
1. Click "Use Custom URL" in the image selector
2. Paste any image URL from the web
3. The image will be used for your petition
