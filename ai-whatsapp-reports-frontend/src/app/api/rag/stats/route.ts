import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
        const response = await axios.get(`${backendUrl}/rag/stats`);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching RAG stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch RAG statistics' },
            { status: 500 }
        );
    }
}
