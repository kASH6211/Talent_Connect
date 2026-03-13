import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const returnUrl = `${backendUrl}/api/auth/sso/callback`;
        console.log(`[SSO] Generating returnUrl: ${returnUrl}`);
        const targetUrl = `https://fasttrack.punjab.gov.in/webportalnode/api/talent-portal/getSSOLoginUrl?returnUrl=${encodeURIComponent(returnUrl)}`;

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'ssoId': 'VUFULUZUUFBfU1NPLWxvZ2luLXRhbGVudC1wb3J0YWw='
            },
            // Do not follow the redirect automatically so we can capture the Location header
            redirect: 'manual'
        });

        // The API returns a 302 Redirect. Extract the location header.
        if (response.status === 302 || response.status === 301) {
            const redirectUrl = response.headers.get('location');
            if (redirectUrl) {
                return NextResponse.json({ url: redirectUrl });
            }
        }

        // If it successfully followed the redirect (e.g. some fetch polyfills), return the final URL
        if (response.ok) {
            return NextResponse.json({ url: response.url });
        }

        return NextResponse.json({ error: 'Failed to retrieve SSO URL' }, { status: 500 });
    } catch (error) {
        console.error('SSO Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
