import { NextResponse } from 'next/server';
import axios from 'axios';

export async function DELETE() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
        const response = await axios.delete(`${backendUrl}/rag/clear`);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error clearing RAG:', error);
        return NextResponse.json(
            { error: 'Failed to clear RAG database' },
            { status: 500 }
        );
    }
}
