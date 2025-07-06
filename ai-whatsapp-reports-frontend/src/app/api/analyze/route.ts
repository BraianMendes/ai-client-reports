import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const { message } = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    try {
        const response = await axios.post(`${backendUrl}/analyze`, { message });
        return NextResponse.json({ report: response.data.report });
    } catch (error) {
        console.error('Error calling backend:', error);
        return NextResponse.json(
            { error: 'Error generating report' },
            { status: 500 }
        );
    }
}
