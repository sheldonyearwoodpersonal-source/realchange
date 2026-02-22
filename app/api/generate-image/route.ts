import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const pexelsApiKey = process.env.PEXELS_API_KEY;

    if (!pexelsApiKey || pexelsApiKey === 'your_pexels_api_key_here') {
      return NextResponse.json(
        { error: 'Pexels API key not configured. Please add PEXELS_API_KEY to your .env file.' },
        { status: 400 }
      );
    }

    const searchQuery = keywords.replace(/\s+/g, '+');
    const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=5&orientation=landscape`;

    const response = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch images from Pexels: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      return NextResponse.json(
        { error: 'No images found for this search' },
        { status: 404 }
      );
    }

    const images = data.photos.map((photo: any) => ({
      id: photo.id,
      url: photo.src.large,
      alt: photo.alt || keywords,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
