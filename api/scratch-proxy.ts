/**
 * Vercel Serverless Function to proxy Scratch API requests
 * This bypasses CORS restrictions by making requests server-side
 */

type VercelRequest = {
  method?: string;
  query: {
    projectId?: string;
    type?: string;
  };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, type } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  // Validate project ID is numeric
  if (!/^\d+$/.test(projectId)) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    let url: string;
    
    if (type === 'metadata') {
      // Fetch project metadata
      url = `https://api.scratch.mit.edu/projects/${projectId}`;
    } else if (type === 'data') {
      // Fetch project data (blocks, sprites, etc.)
      url = `https://projects.scratch.mit.edu/${projectId}`;
    } else {
      return res.status(400).json({ error: 'Invalid type. Use "metadata" or "data"' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CanvasClassroom/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();

    // Set CORS headers to allow our frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Scratch proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

