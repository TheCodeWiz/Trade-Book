import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { userId, otp } = await request.json();

    // Validate required fields
    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code: otp,
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 401 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Generate JWT token
    const token = generateToken({
      userId: otpRecord.user.id,
      email: otpRecord.user.email,
      name: otpRecord.user.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: otpRecord.user.id,
        name: otpRecord.user.name,
        email: otpRecord.user.email,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'OTP verification failed' },
      { status: 500 }
    );
  }
}
