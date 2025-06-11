import { NextRequest, NextResponse } from 'next/server';

/**
 * API route that acts as a proxy for fetching external resources
 * Helps avoid CORS issues when fetching sitemaps from other domains
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    //console.error('Proxy error: Missing URL parameter');
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  //console.log('Proxy: Fetching URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WCAGApp/1.0; +https://wcag-app.com)',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    //console.log('Proxy: Response status:', response.status, response.statusText);
    //console.log('Proxy: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      //console.error('Proxy error: Bad response', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch from ${url}: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'text/xml';
    //console.log('Proxy: Content-Type:', contentType);
    
    // Get the response body as text
    const text = await response.text();
    //console.log('Proxy: Response length:', text.length);
    //console.log('Proxy: Response preview:', text.substring(0, 200) + '...');
    
    // Create a new response with the same body and content type
    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': contentType.includes('xml') ? 'text/xml' : contentType,
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the requested resource', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
