import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOTP, getOTPExpiry } from '@/lib/auth';
import { sendOTPEmail, sendOTPSMS } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { userId, otpMethod } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete any existing unused OTPs for this user
    await prisma.otpCode.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: otpMethod || 'email',
        expiresAt,
      },
    });

    // Send OTP based on method
    let otpSent = false;
    if (otpMethod === 'phone' && user.phone) {
      otpSent = await sendOTPSMS(user.phone, otp);
    } else {
      otpSent = await sendOTPEmail(user.email, otp, user.name);
    }

    // For development/testing, also log the OTP
    console.log(`[DEV] Resent OTP for ${user.email}: ${otp}`);

    if (!otpSent) {
      return NextResponse.json(
        { error: 'Failed to resend OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP resent successfully',
      otpMethod: otpMethod || 'email',
      destination: otpMethod === 'phone' ? user.phone : user.email,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}
