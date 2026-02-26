import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
    const logoData = readFileSync(join(process.cwd(), 'public', 'logo.png'))

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    borderRadius: 16, // Half of 32 for a circle
                    overflow: 'hidden'
                }}
            >
                <img
                    src={`data:image/png;base64,${logoData.toString('base64')}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Logo"
                />
            </div>
        ),
        { ...size }
    )
}
