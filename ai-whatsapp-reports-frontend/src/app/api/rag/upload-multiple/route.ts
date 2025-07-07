import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
        // Forward the entire FormData request
        const formData = await request.formData();
        
        const response = await axios.post(`${backendUrl}/rag/upload-multiple`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error uploading to RAG:', error);
        return NextResponse.json(
            { error: 'Failed to upload documents' },
            { status: 500 }
        );
    }
}
