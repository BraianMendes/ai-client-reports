import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const { message } = await request.json();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Backend URL being used:', backendUrl);
    console.log('📩 Message received:', message);

    try {
        const response = await axios.post(`${backendUrl}/analyze`, { message });
        console.log('✅ Backend response received successfully');
        return NextResponse.json({ report: response.data.report });
    } catch (error) {
        console.error('❌ Error calling backend:', error);
        console.error('🔗 Attempted URL:', `${backendUrl}/analyze`);
        
        return NextResponse.json(
            { 
                error: 'Error generating report',
                attemptedUrl: `${backendUrl}/analyze`,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
