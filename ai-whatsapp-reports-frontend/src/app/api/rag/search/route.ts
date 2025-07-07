import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
        const body = await request.json();
        const response = await axios.post(`${backendUrl}/rag/search`, body);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error searching RAG:', error);
        return NextResponse.json(
            { error: 'Failed to search RAG' },
            { status: 500 }
        );
    }
}
